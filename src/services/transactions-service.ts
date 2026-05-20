import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { requireSession } from "@/lib/session";
import { unstable_cache } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";

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
  month?: string;
  year?: string;
};

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
  if (value === "ALL") {
    return "ALL";
  }

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

function getDateRange(month: string, year: string) {
  const parsedYear = Number(year);

  if (month === "ALL") {
    return {
      gte: new Date(parsedYear, 0, 1),
      lt: new Date(parsedYear + 1, 0, 1),
    };
  }

  const monthIndex = Number(month) - 1;

  return {
    gte: new Date(parsedYear, monthIndex, 1),
    lt: new Date(parsedYear, monthIndex + 1, 1),
  };
}

function extractRepeatLabel(notes: string | null | undefined) {
  const match = notes?.match(/PARCELA:([0-9]+\/[0-9]+)/);

  return match ? match[1] : null;
}

export function getCleanNotes(notes: string | null | undefined) {
  const lines = (notes ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line !== "" &&
        !/^(REPETICAO_ID:|REPETICAO_TIPO:|PARCELA:|VALOR_MODO:)/.test(line),
    );

  return lines.join("\n").trim();
}

async function getTransactionFormOptionsForFamily(familyId: string) {
  const family = await prisma.family.findUnique({
    where: {
      id: familyId,
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
      familyId,
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

export async function getTransactionFormOptions() {
  const session = await requireSession();
  const tags = familyCacheTags(session.familyId);

  return unstable_cache(
    getTransactionFormOptionsForFamily,
    ["transaction-form-options", session.familyId],
    {
      revalidate: 120,
      tags: [tags.options, tags.accounts, tags.categories, tags.cards],
    },
  )(session.familyId);
}

async function getTransactionsListForFamily(
  familyId: string,
  filters: TransactionsFilters = {},
) {
  const month = getValidMonth(filters.month);
  const year = getValidYear(filters.year);

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
        month,
        year,
      },
      responsibleOptions: [],
    };
  }

  const dateRange = getDateRange(month, year);

  const responsibleId =
    filters.responsibleId && filters.responsibleId !== "ALL"
      ? filters.responsibleId
      : undefined;

  const summaryBaseWhere = {
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
    ...(filters.paymentMethod && filters.paymentMethod !== "ALL"
      ? {
          paymentMethod: filters.paymentMethod,
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

  const baseWhere = {
    ...summaryBaseWhere,
    ...(filters.status && filters.status !== "ALL"
      ? {
          status: filters.status,
        }
      : {}),
  };

  const where = {
    ...baseWhere,
    ...(responsibleId && responsibleId !== "CASAL"
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
      take: 100,
      select: {
        id: true,
        description: true,
        amount: true,
        type: true,
        status: true,
        paymentMethod: true,
        dueDate: true,
        transactionDate: true,
        notes: true,
        category: {
          select: {
            name: true,
          },
        },
        account: {
          select: {
            name: true,
          },
        },
        creditCard: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.transaction.findMany({
      where: summaryBaseWhere,
      select: {
        id: true,
        userId: true,
        type: true,
        amount: true,
        status: true,
      },
    }),
  ]);

  const paidSummaryTransactions = summaryBaseTransactions.filter(
    (transaction) => transaction.status === "PAID",
  );

  const totalIncome = paidSummaryTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const totalExpense = paidSummaryTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const balance = totalIncome - totalExpense;

  const responsibleSummaryCards = [
    {
      id: "CASAL",
      name: "Casal",
      income: formatCurrency(totalIncome),
      expense: formatCurrency(totalExpense),
      balance: formatCurrency(balance),
      transactionsCount: summaryBaseTransactions.length,
      isGeneral: true,
    },
    ...family.members.map((member) => {
      const memberAllTransactions = summaryBaseTransactions.filter(
        (transaction) => transaction.userId === member.userId,
      );

      const memberPaidTransactions = paidSummaryTransactions.filter(
        (transaction) => transaction.userId === member.userId,
      );

      const memberIncome = memberPaidTransactions
        .filter((transaction) => transaction.type === "INCOME")
        .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

      const memberExpense = memberPaidTransactions
        .filter((transaction) => transaction.type === "EXPENSE")
        .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

      return {
        id: member.userId,
        name: getDisplayName(member.user.name),
        income: formatCurrency(memberIncome),
        expense: formatCurrency(memberExpense),
        balance: formatCurrency(memberIncome - memberExpense),
        transactionsCount: memberAllTransactions.length,
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
        transaction.dueDate ?? transaction.transactionDate,
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
      repeatLabel: extractRepeatLabel(transaction.notes),
      notes: getCleanNotes(transaction.notes),
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
      month,
      year,
    },
    responsibleOptions: [
      {
        id: "CASAL",
        name: "Casal",
      },
      ...family.members.map((member) => ({
        id: member.user.id,
        name: getDisplayName(member.user.name),
      })),
    ],
  };
}

export async function getTransactionsList(filters: TransactionsFilters = {}) {
  const session = await requireSession();
  const normalizedFilters: TransactionsFilters = {
    search: filters.search ?? "",
    type: filters.type ?? "ALL",
    status: filters.status ?? "ALL",
    paymentMethod: filters.paymentMethod ?? "ALL",
    responsibleId: filters.responsibleId ?? "ALL",
    month: getValidMonth(filters.month),
    year: getValidYear(filters.year),
  };
  const tags = familyCacheTags(session.familyId);

  return unstable_cache(
    getTransactionsListForFamily,
    [
      "transactions-list",
      session.familyId,
      JSON.stringify(normalizedFilters),
    ],
    {
      revalidate: 30,
      tags: [tags.transactions],
    },
  )(session.familyId, normalizedFilters);
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
      dueDate: transaction.dueDate
        ? transaction.dueDate.toISOString().slice(0, 10)
        : "",
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      notes: getCleanNotes(transaction.notes),
    },
  };
}
