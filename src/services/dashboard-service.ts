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

function getCurrentMonthRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { start, end };
}

function getMonthLabel() {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getTodayStart() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function toNumber(value: unknown) {
  if (!value) return 0;

  return Number(value);
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

async function getDashboardDataForFamily(familyId: string): Promise<DashboardData> {
  const { start, end } = getCurrentMonthRange();
  const chartStart = new Date(start);
  chartStart.setMonth(chartStart.getMonth() - 11);

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
      monthLabel: getMonthLabel(),
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

  const today = getTodayStart();
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
        transactionDate: {
          gte: start,
          lt: end,
        },
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
        transactionDate: {
          gte: start,
          lt: end,
        },
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
        transactionDate: {
          gte: start,
          lt: end,
        },
      },
    }),

    prisma.transaction.count({
      where: {
        familyId: family.id,
        type: "EXPENSE",
        status: "PAID",
        transactionDate: {
          gte: start,
          lt: end,
        },
      },
    }),

    prisma.transaction.count({
      where: {
        familyId: family.id,
        status: {
          in: ["PENDING", "OVERDUE"],
        },
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
      },
      orderBy: {
        transactionDate: "desc",
      },
      take: 5,
      include: {
        category: true,
        user: true,
      },
    }),

    prisma.transaction.findMany({
      where: {
        familyId: family.id,
        status: {
          not: "CANCELED",
        },
        transactionDate: {
          gte: start,
          lt: end,
        },
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
        transactionDate: {
          gte: chartStart,
          lt: end,
        },
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
        transactionDate: {
          gte: start,
          lt: end,
        },
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
        transactionDate: {
          gte: start,
          lt: end,
        },
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
        transactionDate: {
          gte: start,
          lt: end,
        },
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
        OR: [
          {
            dueDate: {
              gte: today,
            },
          },
          {
            dueDate: null,
            transactionDate: {
              gte: today,
            },
          },
        ],
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
      transactionDate: transaction.transactionDate.toISOString(),
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

  return {
    monthLabel: getMonthLabel(),
    balance: formatCurrency(balance),
    income: formatCurrency(incomeTotal),
    expenses: formatCurrency(expenseTotal),
    goalsTotal: formatCurrency(goalsTotal),
    pendingBillsCount,
    activeCardsCount,
    activeGoalsCount,
    incomeTransactionsCount,
    expenseTransactionsCount,
    recentTransactions: recentTransactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: formatCurrency(Number(transaction.amount)),
      type: transaction.type,
      status: transaction.status,
      date: new Intl.DateTimeFormat("pt-BR").format(
        transaction.transactionDate,
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
            largestExpense.transactionDate,
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

export async function getDashboardData(): Promise<DashboardData> {
  const session = await requireSession();
  const tags = familyCacheTags(session.familyId);

  return unstable_cache(
    getDashboardDataForFamily,
    ["dashboard", session.familyId],
    {
      revalidate: 60,
      tags: [tags.dashboard, tags.transactions, tags.accounts, tags.cards],
    },
  )(session.familyId);
}
