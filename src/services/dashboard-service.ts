import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

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
  userId: string;
  name: string;
  income: string;
  expenses: string;
  balance: string;
  transactionsCount: number;
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

function toNumber(value: unknown) {
  if (!value) return 0;

  return Number(value);
}

export async function getDashboardData(): Promise<DashboardData> {
  const { start, end } = getCurrentMonthRange();

  const family = await prisma.family.findFirst({
    where: {
      name: "Flávio & Ana",
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
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        familyId: family.id,
        type: "INCOME",
        status: {
          not: "CANCELED",
        },
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
        status: {
          not: "CANCELED",
        },
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
        status: {
          not: "CANCELED",
        },
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
        status: {
          not: "CANCELED",
        },
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
      userId: member.userId,
      name: member.user.name === "Ana" ? "Ana Paula" : member.user.name,
      income: formatCurrency(userIncome),
      expenses: formatCurrency(userExpenses),
      balance: formatCurrency(userBalance),
      transactionsCount: userTransactions.length,
    };
  });

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
  };
}