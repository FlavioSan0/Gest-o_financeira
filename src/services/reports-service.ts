import { unstable_cache } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";

export type ReportTypeFilter = "ALL" | "INCOME" | "EXPENSE";
export type ReportStatusFilter = "ALL" | "PAID" | "PENDING";

export type ReportsFilters = {
  month?: string;
  year?: string;
  responsibleId?: string;
  categoryId?: string;
  type?: ReportTypeFilter;
  status?: ReportStatusFilter;
};

export type ReportsData = {
  filters: {
    month: string;
    year: string;
    responsibleId: string;
    categoryId: string;
    type: ReportTypeFilter;
    status: ReportStatusFilter;
  };
  options: {
    responsibles: { id: string; name: string }[];
    categories: { id: string; name: string; type: "INCOME" | "EXPENSE" }[];
    months: { value: string; label: string }[];
    years: string[];
  };
  periodLabel: string;
  summary: {
    paidIncome: string;
    paidExpense: string;
    realBalance: string;
    pendingForecast: string;
    pendingIncome: string;
    pendingExpense: string;
    transactionsCount: number;
  };
  charts: {
    expensesByCategory: {
      id: string;
      label: string;
      amount: number;
      formattedAmount: string;
      percentage: number;
    }[];
    incomeVsExpense: {
      label: string;
      amount: number;
      formattedAmount: string;
      percentage: number;
      tone: "income" | "expense";
    }[];
    expensesByResponsible: {
      id: string;
      label: string;
      amount: number;
      formattedAmount: string;
      percentage: number;
    }[];
    monthEvolution: {
      day: string;
      income: number;
      expense: number;
      balance: number;
      formattedBalance: string;
      percentage: number;
    }[];
  };
  recentTransactions: {
    id: string;
    description: string;
    amount: string;
    rawAmount: number;
    type: "INCOME" | "EXPENSE";
    typeLabel: string;
    status: "PAID" | "PENDING" | "OVERDUE" | "CANCELED";
    statusLabel: string;
    date: string;
    category: string;
    responsible: string;
  }[];
};

const monthOptions = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Fev" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Abr" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Ago" },
  { value: "09", label: "Set" },
  { value: "10", label: "Out" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dez" },
];

function getDisplayName(name: string) {
  return name === "Ana" ? "Ana Paula" : name;
}

function getCurrentMonth() {
  return String(new Date().getMonth() + 1).padStart(2, "0");
}

function getCurrentYear() {
  return String(new Date().getFullYear());
}

function getValidMonth(value: string | undefined) {
  if (/^(0[1-9]|1[0-2])$/.test(value ?? "")) {
    return value!;
  }

  return getCurrentMonth();
}

function getValidYear(value: string | undefined) {
  if (/^\d{4}$/.test(value ?? "")) {
    return value!;
  }

  return getCurrentYear();
}

function normalizeType(value: string | undefined): ReportTypeFilter {
  if (value === "INCOME" || value === "EXPENSE") {
    return value;
  }

  return "ALL";
}

function normalizeStatus(value: string | undefined): ReportStatusFilter {
  if (value === "PAID" || value === "PENDING") {
    return value;
  }

  return "ALL";
}

function getDateRange(month: string, year: string) {
  const parsedYear = Number(year);
  const monthIndex = Number(month) - 1;

  return {
    gte: new Date(parsedYear, monthIndex, 1),
    lt: new Date(parsedYear, monthIndex + 1, 1),
  };
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(value);
}

function getPeriodLabel(month: string, year: string) {
  const date = new Date(Number(year), Number(month) - 1, 1);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getYearOptions(selectedYear: string) {
  const currentYear = new Date().getFullYear();
  const years = new Set<string>();

  for (let year = currentYear - 2; year <= currentYear + 1; year += 1) {
    years.add(String(year));
  }

  years.add(selectedYear);

  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

function getStatusLabel(status: ReportsData["recentTransactions"][number]["status"]) {
  if (status === "PAID") return "Realizado";
  if (status === "PENDING") return "Pendente";
  if (status === "OVERDUE") return "Atrasado";

  return "Cancelado";
}

function getPercentage(amount: number, total: number) {
  if (total <= 0) return 0;

  return Number(((amount / total) * 100).toFixed(1));
}

function groupAmounts<T extends { amount: unknown }>(
  items: T[],
  getKey: (item: T) => string,
  getLabel: (item: T) => string,
) {
  const grouped = new Map<string, { label: string; amount: number }>();

  items.forEach((item) => {
    const key = getKey(item);
    const current = grouped.get(key) ?? {
      label: getLabel(item),
      amount: 0,
    };

    current.amount += Number(item.amount);
    grouped.set(key, current);
  });

  const total = Array.from(grouped.values()).reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  return Array.from(grouped.entries())
    .map(([id, item]) => ({
      id,
      label: item.label,
      amount: item.amount,
      formattedAmount: formatCurrency(item.amount),
      percentage: getPercentage(item.amount, total),
    }))
    .sort((a, b) => b.amount - a.amount);
}

async function getReportsDataForFamily(
  familyId: string,
  filters: Required<ReportsFilters>,
): Promise<ReportsData> {
  const month = getValidMonth(filters.month);
  const year = getValidYear(filters.year);
  const type = normalizeType(filters.type);
  const status = normalizeStatus(filters.status);
  const dateRange = getDateRange(month, year);

  const family = await prisma.family.findUnique({
    where: {
      id: familyId,
    },
    select: {
      id: true,
      members: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      categories: {
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  if (!family) {
    return {
      filters: {
        month,
        year,
        responsibleId: "ALL",
        categoryId: "ALL",
        type,
        status,
      },
      options: {
        responsibles: [{ id: "ALL", name: "Todos" }],
        categories: [],
        months: monthOptions,
        years: getYearOptions(year),
      },
      periodLabel: getPeriodLabel(month, year),
      summary: {
        paidIncome: formatCurrency(0),
        paidExpense: formatCurrency(0),
        realBalance: formatCurrency(0),
        pendingForecast: formatCurrency(0),
        pendingIncome: formatCurrency(0),
        pendingExpense: formatCurrency(0),
        transactionsCount: 0,
      },
      charts: {
        expensesByCategory: [],
        incomeVsExpense: [],
        expensesByResponsible: [],
        monthEvolution: [],
      },
      recentTransactions: [],
    };
  }

  const responsibleIds = new Set(family.members.map((member) => member.user.id));
  const categoryIds = new Set(family.categories.map((category) => category.id));
  const responsibleId = responsibleIds.has(filters.responsibleId)
    ? filters.responsibleId
    : "ALL";
  const categoryId = categoryIds.has(filters.categoryId)
    ? filters.categoryId
    : "ALL";
  const statusList: ("PAID" | "PENDING")[] =
    status === "ALL" ? ["PAID", "PENDING"] : [status];

  const baseWhere = {
    familyId: family.id,
    ...(type !== "ALL"
      ? {
          type,
        }
      : {}),
    ...(responsibleId !== "ALL"
      ? {
          userId: responsibleId,
        }
      : {}),
    ...(categoryId !== "ALL"
      ? {
          categoryId,
        }
      : {}),
    OR: [
      {
        dueDate: dateRange,
      },
      {
        dueDate: null,
        transactionDate: dateRange,
      },
    ],
  };

  const where = {
    ...baseWhere,
    status: {
      in: statusList,
    },
  };

  const [transactions, transactionsCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [
        {
          transactionDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 500,
      select: {
        id: true,
        description: true,
        amount: true,
        type: true,
        status: true,
        dueDate: true,
        transactionDate: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.transaction.count({
      where,
    }),
  ]);

  const paidTransactions = transactions.filter(
    (transaction) => transaction.status === "PAID",
  );
  const pendingTransactions = transactions.filter(
    (transaction) => transaction.status === "PENDING",
  );
  const paidIncome = paidTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const paidExpense = paidTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const pendingIncome = pendingTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const pendingExpense = pendingTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const realBalance = paidIncome - paidExpense;
  const pendingForecast = pendingIncome - pendingExpense;
  const expenses = transactions.filter(
    (transaction) => transaction.type === "EXPENSE",
  );
  const paidExpenses = paidTransactions.filter(
    (transaction) => transaction.type === "EXPENSE",
  );
  const incomeVsExpenseTotal = paidIncome + paidExpense;
  const expensesByCategory = groupAmounts(
    expenses,
    (transaction) => transaction.category?.id ?? "NO_CATEGORY",
    (transaction) => transaction.category?.name ?? "Sem categoria",
  );
  const expensesByResponsible = groupAmounts(
    expenses,
    (transaction) => transaction.user?.id ?? "NO_RESPONSIBLE",
    (transaction) =>
      transaction.user ? getDisplayName(transaction.user.name) : "Nao informado",
  );
  const dailyMap = new Map<
    string,
    { day: string; income: number; expense: number; balance: number }
  >();

  paidTransactions.forEach((transaction) => {
    const date = transaction.dueDate ?? transaction.transactionDate;
    const day = String(date.getDate()).padStart(2, "0");
    const current = dailyMap.get(day) ?? {
      day,
      income: 0,
      expense: 0,
      balance: 0,
    };

    if (transaction.type === "INCOME") {
      current.income += Number(transaction.amount);
    } else {
      current.expense += Number(transaction.amount);
    }

    current.balance = current.income - current.expense;
    dailyMap.set(day, current);
  });

  const maxDailyAmount = Math.max(
    ...Array.from(dailyMap.values()).map((item) =>
      Math.max(item.income, item.expense, Math.abs(item.balance)),
    ),
    0,
  );

  return {
    filters: {
      month,
      year,
      responsibleId,
      categoryId,
      type,
      status,
    },
    options: {
      responsibles: [
        { id: "ALL", name: "Todos" },
        ...family.members.map((member) => ({
          id: member.user.id,
          name: getDisplayName(member.user.name),
        })),
      ],
      categories: family.categories.map((category) => ({
        id: category.id,
        name: category.name,
        type: category.type,
      })),
      months: monthOptions,
      years: getYearOptions(year),
    },
    periodLabel: getPeriodLabel(month, year),
    summary: {
      paidIncome: formatCurrency(paidIncome),
      paidExpense: formatCurrency(paidExpense),
      realBalance: formatCurrency(realBalance),
      pendingForecast: formatCurrency(pendingForecast),
      pendingIncome: formatCurrency(pendingIncome),
      pendingExpense: formatCurrency(pendingExpense),
      transactionsCount,
    },
    charts: {
      expensesByCategory,
      incomeVsExpense: [
        {
          label: "Receitas",
          amount: paidIncome,
          formattedAmount: formatCurrency(paidIncome),
          percentage: getPercentage(paidIncome, incomeVsExpenseTotal),
          tone: "income",
        },
        {
          label: "Despesas",
          amount: paidExpense,
          formattedAmount: formatCurrency(paidExpense),
          percentage: getPercentage(paidExpense, incomeVsExpenseTotal),
          tone: "expense",
        },
      ],
      expensesByResponsible,
      monthEvolution:
        dailyMap.size >= 2
          ? Array.from(dailyMap.values())
              .sort((a, b) => Number(a.day) - Number(b.day))
              .map((item) => ({
                ...item,
                formattedBalance: formatCurrency(item.balance),
                percentage: getPercentage(
                  Math.max(item.income, item.expense, Math.abs(item.balance)),
                  maxDailyAmount,
                ),
              }))
          : paidExpenses.length >= 2
            ? []
            : [],
    },
    recentTransactions: transactions.slice(0, 10).map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: formatCurrency(Number(transaction.amount)),
      rawAmount: Number(transaction.amount),
      type: transaction.type,
      typeLabel: transaction.type === "INCOME" ? "Entrada" : "Saida",
      status: transaction.status,
      statusLabel: getStatusLabel(transaction.status),
      date: formatDate(transaction.dueDate ?? transaction.transactionDate),
      category: transaction.category?.name ?? "Sem categoria",
      responsible: transaction.user
        ? getDisplayName(transaction.user.name)
        : "Nao informado",
    })),
  };
}

export async function getReportsData(filters: ReportsFilters = {}) {
  const session = await requireSession();
  const normalizedFilters: Required<ReportsFilters> = {
    month: getValidMonth(filters.month),
    year: getValidYear(filters.year),
    responsibleId: filters.responsibleId ?? "ALL",
    categoryId: filters.categoryId ?? "ALL",
    type: normalizeType(filters.type),
    status: normalizeStatus(filters.status),
  };
  const tags = familyCacheTags(session.familyId);

  return unstable_cache(
    getReportsDataForFamily,
    [
      "reports-page",
      session.familyId,
      JSON.stringify(normalizedFilters),
    ],
    {
      revalidate: 30,
      tags: [tags.transactions, tags.categories, tags.options],
    },
  )(session.familyId, normalizedFilters);
}
