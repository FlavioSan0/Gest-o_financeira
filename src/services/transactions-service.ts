import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { requireSession } from "@/lib/session";

type TransactionTypeFilter = "ALL" | "INCOME" | "EXPENSE";
type TransactionStatusFilter =
  | "ALL"
  | "PAID"
  | "PENDING"
  | "OVERDUE"
  | "CANCELED";
type PaymentMethodFilter =
  | "ALL"
  | "PIX"
  | "CASH"
  | "DEBIT_CARD"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "BOLETO"
  | "OTHER";

export type TransactionsFilters = {
  search?: string;
  type?: TransactionTypeFilter;
  status?: TransactionStatusFilter;
  paymentMethod?: PaymentMethodFilter;
  responsibleId?: string;
};

function getDisplayName(name: string) {
  return name === "Ana" ? "Ana Paula" : name;
}

export async function getTransactionFormOptions() {
  const session = await requireSession();

  const family = await prisma.family.findUnique({
    where: {
      id: session.familyId,
    },
    include: {
      accounts: {
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      categories: {
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      creditCards: {
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!family) {
    return {
      familyId: session.familyId,
      accounts: [],
      categories: [],
      creditCards: [],
    };
  }

  return {
    familyId: family.id,
    accounts: family.accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
    })),
    categories: family.categories.map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
    })),
    creditCards: family.creditCards.map((card) => ({
      id: card.id,
      name: card.name,
      bank: card.bank ?? "Banco não informado",
      closingDay: card.closingDay,
      dueDay: card.dueDay,
    })),
  };
}

export async function getTransactionsList(filters: TransactionsFilters = {}) {
  const session = await requireSession();

  const family = await prisma.family.findUnique({
    where: {
      id: session.familyId,
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
      transactions: [],
      summary: {
        totalIncome: formatCurrency(0),
        totalExpense: formatCurrency(0),
        balance: formatCurrency(0),
        totalTransactions: 0,
      },
      responsibleSummaryCards: [],
      filters: {
        search: filters.search ?? "",
        type: filters.type ?? "ALL",
        status: filters.status ?? "ALL",
        paymentMethod: filters.paymentMethod ?? "ALL",
        responsibleId: filters.responsibleId ?? "ALL",
      },
      responsibleOptions: [],
    };
  }

  const responsibleId =
    filters.responsibleId && filters.responsibleId !== "ALL"
      ? filters.responsibleId
      : undefined;

  const baseWhere = {
    familyId: family.id,
    ...(filters.search
      ? {
          description: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(filters.type && filters.type !== "ALL"
      ? {
          type: filters.type,
        }
      : {}),
    ...(filters.status && filters.status !== "ALL"
      ? {
          status: filters.status,
        }
      : {}),
    ...(filters.paymentMethod && filters.paymentMethod !== "ALL"
      ? {
          paymentMethod: filters.paymentMethod,
        }
      : {}),
  };

  const where = {
    ...baseWhere,
    ...(responsibleId
      ? {
          userId: responsibleId,
        }
      : {}),
  };

  const [transactions, summaryBaseTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: {
        transactionDate: "desc",
      },
      include: {
        category: true,
        account: true,
        creditCard: true,
        user: true,
      },
    }),

    prisma.transaction.findMany({
      where: baseWhere,
      select: {
        id: true,
        userId: true,
        type: true,
        amount: true,
      },
    }),
  ]);

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const balance = totalIncome - totalExpense;

  const totalBaseIncome = summaryBaseTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const totalBaseExpense = summaryBaseTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const responsibleSummaryCards = [
    {
      id: "ALL",
      name: "Casal",
      income: formatCurrency(totalBaseIncome),
      expense: formatCurrency(totalBaseExpense),
      balance: formatCurrency(totalBaseIncome - totalBaseExpense),
      transactionsCount: summaryBaseTransactions.length,
      isGeneral: true,
    },
    ...family.members.map((member) => {
      const memberTransactions = summaryBaseTransactions.filter(
        (transaction) => transaction.userId === member.userId,
      );

      const memberIncome = memberTransactions
        .filter((transaction) => transaction.type === "INCOME")
        .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

      const memberExpense = memberTransactions
        .filter((transaction) => transaction.type === "EXPENSE")
        .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

      return {
        id: member.userId,
        name: getDisplayName(member.user.name),
        income: formatCurrency(memberIncome),
        expense: formatCurrency(memberExpense),
        balance: formatCurrency(memberIncome - memberExpense),
        transactionsCount: memberTransactions.length,
        isGeneral: false,
      };
    }),
  ];

  return {
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: formatCurrency(Number(transaction.amount)),
      rawAmount: Number(transaction.amount),
      type: transaction.type,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      date: new Intl.DateTimeFormat("pt-BR").format(
        transaction.transactionDate,
      ),
      category: transaction.category?.name ?? "Sem categoria",
      account:
        transaction.paymentMethod === "CREDIT_CARD"
          ? transaction.creditCard?.name ?? "Cartão não informado"
          : transaction.account?.name ?? "Sem conta",
      creditCard: transaction.creditCard?.name ?? null,
      responsible: transaction.user
        ? getDisplayName(transaction.user.name)
        : "Não informado",
      notes: transaction.notes,
    })),
    summary: {
      totalIncome: formatCurrency(totalIncome),
      totalExpense: formatCurrency(totalExpense),
      balance: formatCurrency(balance),
      totalTransactions: transactions.length,
    },
    responsibleSummaryCards,
    filters: {
      search: filters.search ?? "",
      type: filters.type ?? "ALL",
      status: filters.status ?? "ALL",
      paymentMethod: filters.paymentMethod ?? "ALL",
      responsibleId: filters.responsibleId ?? "ALL",
    },
    responsibleOptions: family.members.map((member) => ({
      id: member.user.id,
      name: getDisplayName(member.user.name),
    })),
  };
}

export async function getTransactionForEdit(transactionId: string) {
  const session = await requireSession();

  const [options, transaction] = await Promise.all([
    getTransactionFormOptions(),
    prisma.transaction.findFirst({
      where: {
        id: transactionId,
        familyId: session.familyId,
      },
    }),
  ]);

  if (!transaction) {
    return null;
  }

  return {
    options,
    transaction: {
      id: transaction.id,
      familyId: transaction.familyId,
      accountId: transaction.accountId ?? "",
      creditCardId: transaction.creditCardId ?? "",
      categoryId: transaction.categoryId ?? "",
      type: transaction.type,
      description: transaction.description,
      amount: Number(transaction.amount).toFixed(2).replace(".", ","),
      transactionDate: transaction.transactionDate.toISOString().slice(0, 10),
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes ?? "",
    },
  };
}