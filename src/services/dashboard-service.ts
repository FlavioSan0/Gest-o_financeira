import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { requireSession } from "@/lib/session";
import { unstable_cache } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";

type RecentTransaction = {
  id: string;
  description: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  status: string;
  date: string;
  category: string;
  responsible: string;
};

type ResponsibleSummary = {
  id: string;
  name: string;
  income: string;
  expenses: string;
  balance: string;
  transactionsCount: number;
};

type ChartTransaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  status: string;
  transactionDate: string;
  categoryId: string | null;
  category: string;
  responsibleId: string | null;
  responsible: string;
};

type LargestExpenseInsight = {
  id: string;
  description: string;
  amount: number;
  formattedAmount: string;
  date: string;
  categoryName: string;
} | null;

type UpcomingPendingInsight = {
  id: string;
  description: string;
  amount: number;
  formattedAmount: string;
  dueDate: string;
  categoryName: string;
}[];

export type CategoryExpenseSummary = {
  categoryId: string | null;
  categoryName: string;
  amount: number;
  formattedAmount: string;
  percentage: number;
};

export type DashboardData = {
  monthLabel: string;
  referenceMonth: number;
  referenceYear: number;
  balance: string;
  income: string;
  expenses: string;
  goalsTotal: string;
  pendingBillsCount: number;
  activeCardsCount: number;
  activeGoalsCount: number;
  incomeTransactionsCount: number;
  expenseTransactionsCount: number;
  recentTransactions: RecentTransaction[];
  responsibleSummaries: ResponsibleSummary[];
  chartTransactions: ChartTransaction[];
  categoryExpenseSummary: CategoryExpenseSummary[];
  categoryExpenseForecastSummary: CategoryExpenseSummary[];
  largestExpense: LargestExpenseInsight;
  topExpenseCategory: CategoryExpenseSummary | null;
  upcomingPending: UpcomingPendingInsight;
};

type DashboardPeriodInput = {
  month?: string | number | null;
  year?: string | number | null;
};

function getReferencePeriod(input: DashboardPeriodInput = {}) {
  const now = new Date();
  const parsedMonth = Number(input.month);
  const parsedYear = Number(input.year);
  const month =
    Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : now.getMonth() + 1;
  const year =
    Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100
      ? parsedYear
      : now.getFullYear();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(start);

  return {
    month,
    year,
    start,
    end,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
}

function getReferenceDateWhere(start: Date, end: Date) {
  return {
    OR: [
      {
        dueDate: {
          gte: start,
          lt: end,
        },
      },
      {
        dueDate: null,
        transactionDate: {
          gte: start,
          lt: end,
        },
      },
    ],
  };
}

function toNumber(value: unknown) {
  if (!value) return 0;

  return Number(value);
}

function getEffectiveTransactionDate(transaction: {
  dueDate: Date | null;
  transactionDate: Date;
}) {
  return transaction.dueDate ?? transaction.transactionDate;
}

function buildCategoryExpenseSummary(
  transactions: {
    amount: unknown;
    category: { id: string; name: string } | null;
  }[],
): CategoryExpenseSummary[] {
  const grouped = new Map<
    string,
    { categoryId: string | null; categoryName: string; amount: number }
  >();

  transactions.forEach((transaction) => {
    const categoryId = transaction.category?.id ?? null;
    const categoryName = transaction.category?.name ?? "Sem categoria";
    const key = categoryId ?? "NO_CATEGORY";
    const current = grouped.get(key) ?? {
      categoryId,
      categoryName,
      amount: 0,
    };

    current.amount += toNumber(transaction.amount);
    grouped.set(key, current);
  });

  const total = Array.from(grouped.values()).reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  if (total <= 0) {
    return [];
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      amount: item.amount,
      formattedAmount: formatCurrency(item.amount),
      percentage: Number(((item.amount / total) * 100).toFixed(1)),
    }));
}

async function getDashboardDataForFamily(
  familyId: string,
  month: number,
  year: number,
): Promise<DashboardData> {
  const { start, end, label } = getReferencePeriod({ month, year });
  const referenceDateWhere = getReferenceDateWhere(start, end);

  const family = await prisma.family.findUnique({
    where: {
      id: familyId,
    },
    include: {
      members: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!family) {
    return {
      monthLabel: label,
      referenceMonth: month,
      referenceYear: year,
      balance: formatCurrency(0),
      income: formatCurrency(0),
      expenses: formatCurrency(0),
      goalsTotal: formatCurrency(0),
      pendingBillsCount: 0,
      activeCardsCount: 0,
      activeGoalsCount: 0,
      incomeTransactionsCount: 0,
      expenseTransactionsCount: 0,
      recentTransactions: [],
      responsibleSummaries: [],
      chartTransactions: [],
      categoryExpenseSummary: [],
      categoryExpenseForecastSummary: [],
      largestExpense: null,
      topExpenseCategory: null,
      upcomingPending: [],
    };
  }

  const [
    incomeAggregate,
    expenseAggregate,
    incomeTransactionsCount,
    expenseTransactionsCount,
    pendingBillsCount,
    activeCardsCount,
    activeGoalsCount,
    goalsAggregate,
    recentTransactions,
    monthTransactions,
    chartTransactions,
    categoryExpenseTransactions,
    categoryExpenseForecastTransactions,
    largestExpense,
    upcomingPending,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        familyId: family.id,
        type: "INCOME",
        status: "PAID",
        ...referenceDateWhere,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.transaction.aggregate({
      where: {
        familyId: family.id,
        type: "EXPENSE",
        status: "PAID",
        ...referenceDateWhere,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.transaction.count({
      where: {
        familyId: family.id,
        type: "INCOME",
        status: "PAID",
        ...referenceDateWhere,
      },
    }),

    prisma.transaction.count({
      where: {
        familyId: family.id,
        type: "EXPENSE",
        status: "PAID",
        ...referenceDateWhere,
      },
    }),

    prisma.transaction.count({
      where: {
        familyId: family.id,
        status: {
          in: ["PENDING", "OVERDUE"],
        },
        ...referenceDateWhere,
      },
    }),

    prisma.creditCard.count({
      where: {
        familyId: family.id,
        active: true,
      },
    }),

    prisma.goal.count({
      where: {
        familyId: family.id,
        status: "ACTIVE",
      },
    }),

    prisma.goal.aggregate({
      where: {
        familyId: family.id,
        status: "ACTIVE",
      },
      _sum: {
        currentAmount: true,
      },
    }),

    prisma.transaction.findMany({
      where: {
        familyId: family.id,
        status: {
          not: "CANCELED",
        },
        ...referenceDateWhere,
      },
      include: {
        category: true,
        user: true,
      },
    }),

    prisma.transaction.findMany({
      where: {
        familyId: family.id,
        status: {
          in: ["PAID"],
        },
        ...referenceDateWhere,
      },
      select: {
        id: true,
        userId: true,
        type: true,
        amount: true,
      },
    }),

    prisma.transaction.findMany({
      where: {
        familyId: family.id,
        status: {
          in: ["PAID", "PENDING", "OVERDUE"],
        },
        ...referenceDateWhere,
      },
      orderBy: {
        transactionDate: "asc",
      },
      include: {
        category: true,
        user: true,
      },
    }),

    prisma.transaction.findMany({
      where: {
        familyId: family.id,
        type: "EXPENSE",
        status: "PAID",
        ...referenceDateWhere,
      },
      select: {
        amount: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.transaction.findMany({
      where: {
        familyId: family.id,
        type: "EXPENSE",
        status: {
          in: ["PAID", "PENDING"],
        },
        ...referenceDateWhere,
      },
      select: {
        amount: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.transaction.findFirst({
      where: {
        familyId: family.id,
        type: "EXPENSE",
        status: "PAID",
        ...referenceDateWhere,
      },
      orderBy: {
        amount: "desc",
      },
      include: {
        category: true,
      },
    }),

    prisma.transaction.findMany({
      where: {
        familyId: family.id,
        type: "EXPENSE",
        status: "PENDING",
        ...referenceDateWhere,
      },
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          transactionDate: "asc",
        },
      ],
      take: 4,
      include: {
        category: true,
      },
    }),
  ]);

  const incomeTotal = toNumber(incomeAggregate._sum.amount);
  const expenseTotal = toNumber(expenseAggregate._sum.amount);
  const goalsTotal = toNumber(goalsAggregate._sum.currentAmount);
  const balance = incomeTotal - expenseTotal;

  const responsibleSummaries = family.members.map((member) => {
    const userTransactions = monthTransactions.filter(
      (transaction) => transaction.userId === member.userId,
    );

    const userIncome = userTransactions
      .filter((transaction) => transaction.type === "INCOME")
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

    const userExpenses = userTransactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

    const userBalance = userIncome - userExpenses;

    return {
      id: member.userId,
      name: member.user.name === "Ana" ? "Ana Paula" : member.user.name,
      income: formatCurrency(userIncome),
      expenses: formatCurrency(userExpenses),
      balance: formatCurrency(userBalance),
      transactionsCount: userTransactions.length,
    };
  });

  const mappedChartTransactions: ChartTransaction[] = chartTransactions.map(
    (transaction) => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type,
      status: transaction.status,
      transactionDate: getEffectiveTransactionDate(transaction).toISOString(),
      categoryId: transaction.category?.id ?? null,
      category: transaction.category?.name ?? "Sem categoria",
      responsibleId: transaction.user?.id ?? null,
      responsible: transaction.user?.name ?? "Não informado",
    }),
  );
  const categoryExpenseSummary = buildCategoryExpenseSummary(
    categoryExpenseTransactions,
  );
  const categoryExpenseForecastSummary = buildCategoryExpenseSummary(
    categoryExpenseForecastTransactions,
  );
  const topExpenseCategory = categoryExpenseSummary[0] ?? null;
  const sortedRecentTransactions = [...recentTransactions]
    .sort(
      (a, b) =>
        getEffectiveTransactionDate(b).getTime() -
        getEffectiveTransactionDate(a).getTime(),
    )
    .slice(0, 5);

  return {
    monthLabel: label,
    referenceMonth: month,
    referenceYear: year,
    balance: formatCurrency(balance),
    income: formatCurrency(incomeTotal),
    expenses: formatCurrency(expenseTotal),
    goalsTotal: formatCurrency(goalsTotal),
    pendingBillsCount,
    activeCardsCount,
    activeGoalsCount,
    incomeTransactionsCount,
    expenseTransactionsCount,
    recentTransactions: sortedRecentTransactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: formatCurrency(Number(transaction.amount)),
      type: transaction.type,
      status: transaction.status,
      date: new Intl.DateTimeFormat("pt-BR").format(
        getEffectiveTransactionDate(transaction),
      ),
      category: transaction.category?.name ?? "Sem categoria",
      responsible: transaction.user?.name ?? "Não informado",
    })),
    responsibleSummaries,
    chartTransactions: mappedChartTransactions,
    categoryExpenseSummary,
    categoryExpenseForecastSummary,
    largestExpense: largestExpense
      ? {
          id: largestExpense.id,
          description: largestExpense.description,
          amount: Number(largestExpense.amount),
          formattedAmount: formatCurrency(Number(largestExpense.amount)),
          date: new Intl.DateTimeFormat("pt-BR").format(
            getEffectiveTransactionDate(largestExpense),
          ),
          categoryName: largestExpense.category?.name ?? "Sem categoria",
        }
      : null,
    topExpenseCategory,
    upcomingPending: upcomingPending.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: Number(transaction.amount),
      formattedAmount: formatCurrency(Number(transaction.amount)),
      dueDate: new Intl.DateTimeFormat("pt-BR").format(
        transaction.dueDate ?? transaction.transactionDate,
      ),
      categoryName: transaction.category?.name ?? "Sem categoria",
    })),
  };
}

export async function getDashboardData(
  input: DashboardPeriodInput = {},
): Promise<DashboardData> {
  const session = await requireSession();
  const tags = familyCacheTags(session.familyId);
  const period = getReferencePeriod(input);

  return unstable_cache(
    getDashboardDataForFamily,
    [
      "dashboard",
      session.familyId,
      String(period.month),
      String(period.year),
    ],
    {
      revalidate: 60,
      tags: [tags.dashboard, tags.transactions, tags.accounts, tags.cards],
    },
  )(session.familyId, period.month, period.year);
}
