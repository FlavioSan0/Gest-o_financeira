import { unstable_cache } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";

export type CardInvoiceFilters = {
  creditCardId?: string;
  month?: number;
  year?: number;
};

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function getMonthLabel(month: number, year: number) {
  const date = new Date(year, month - 1, 1);

  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getMonthRange(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return { start, end };
}

function getAvailableYears() {
  const currentYear = getCurrentYear();

  return [currentYear - 1, currentYear, currentYear + 1];
}

async function getCardInvoicesPageDataForFamily(
  familyId: string,
  filters: CardInvoiceFilters = {},
) {
  const selectedMonth = filters.month ?? getCurrentMonth();
  const selectedYear = filters.year ?? getCurrentYear();

  const family = await prisma.family.findUnique({
    where: {
      id: familyId,
    },
    include: {
      creditCards: {
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      accounts: {
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
      filters: {
        creditCardId: filters.creditCardId ?? "ALL",
        month: selectedMonth,
        year: selectedYear,
      },
      creditCards: [],
      accounts: [],
      availableYears: getAvailableYears(),
      monthLabel: getMonthLabel(selectedMonth, selectedYear),
      canPayInvoice: false,
      invoiceStatus: "NONE",
      invoiceStatusLabel: "Sem fatura",
      overview: {
        totalAmount: formatCurrency(0),
        totalTransactions: 0,
        selectedCardName: "Todos os cartoes",
        paidAmount: formatCurrency(0),
        pendingAmount: formatCurrency(0),
      },
      transactions: [],
    };
  }

  const selectedCreditCardId =
    filters.creditCardId && filters.creditCardId !== "ALL"
      ? filters.creditCardId
      : undefined;

  const { start, end } = getMonthRange(selectedMonth, selectedYear);

  const [transactions, existingInvoice] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        familyId,
        type: "EXPENSE",
        paymentMethod: "CREDIT_CARD",
        creditCardId: selectedCreditCardId,
        transactionDate: {
          gte: start,
          lt: end,
        },
        status: {
          not: "CANCELED",
        },
      },
      orderBy: {
        transactionDate: "desc",
      },
      select: {
        id: true,
        description: true,
        amount: true,
        transactionDate: true,
        status: true,
        creditCard: {
          select: {
            name: true,
          },
        },
        category: {
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

    selectedCreditCardId
      ? prisma.cardInvoice.findUnique({
          where: {
            creditCardId_month_year: {
              creditCardId: selectedCreditCardId,
              month: selectedMonth,
              year: selectedYear,
            },
          },
        })
      : Promise.resolve(null),
  ]);

  const totalAmount = transactions.reduce(
    (acc, transaction) => acc + Number(transaction.amount),
    0,
  );

  const paidAmount = transactions
    .filter((transaction) => transaction.status === "PAID")
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const pendingAmount = transactions
    .filter(
      (transaction) =>
        transaction.status === "PENDING" || transaction.status === "OVERDUE",
    )
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const selectedCard = selectedCreditCardId
    ? family.creditCards.find((card) => card.id === selectedCreditCardId)
    : null;

  const invoiceStatus = existingInvoice?.status ?? "NONE";

  const invoiceStatusLabel =
    invoiceStatus === "PAID"
      ? "Paga"
      : invoiceStatus === "PENDING"
        ? "Pendente"
        : invoiceStatus === "OVERDUE"
          ? "Atrasada"
          : "Nao gerada";

  const canPayInvoice =
    Boolean(selectedCreditCardId) &&
    transactions.length > 0 &&
    invoiceStatus !== "PAID";

  return {
    filters: {
      creditCardId: filters.creditCardId ?? "ALL",
      month: selectedMonth,
      year: selectedYear,
    },
    creditCards: family.creditCards.map((card) => ({
      id: card.id,
      name: card.name,
      bank: card.bank ?? "Banco nao informado",
      closingDay: card.closingDay,
      dueDay: card.dueDay,
    })),
    accounts: family.accounts.map((account) => ({
      id: account.id,
      name: account.name,
      currentBalance: formatCurrency(Number(account.currentBalance)),
    })),
    availableYears: getAvailableYears(),
    monthLabel: getMonthLabel(selectedMonth, selectedYear),
    canPayInvoice,
    invoiceStatus,
    invoiceStatusLabel,
    overview: {
      totalAmount: formatCurrency(totalAmount),
      totalTransactions: transactions.length,
      selectedCardName: selectedCard ? selectedCard.name : "Todos os cartoes",
      paidAmount: formatCurrency(paidAmount),
      pendingAmount: formatCurrency(pendingAmount),
    },
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: formatCurrency(Number(transaction.amount)),
      date: new Intl.DateTimeFormat("pt-BR").format(
        transaction.transactionDate,
      ),
      status: transaction.status,
      category: transaction.category?.name ?? "Sem categoria",
      creditCard: transaction.creditCard?.name ?? "Cartao nao informado",
      responsible:
        transaction.user?.name === "Ana"
          ? "Ana Paula"
          : transaction.user?.name ?? "Nao informado",
    })),
  };
}

export async function getCardInvoicesPageData(
  filters: CardInvoiceFilters = {},
) {
  const session = await requireSession();
  const normalizedFilters = {
    creditCardId: filters.creditCardId ?? "ALL",
    month: filters.month ?? getCurrentMonth(),
    year: filters.year ?? getCurrentYear(),
  };
  const tags = familyCacheTags(session.familyId);

  return unstable_cache(
    getCardInvoicesPageDataForFamily,
    [
      "card-invoices-page",
      session.familyId,
      JSON.stringify(normalizedFilters),
    ],
    {
      revalidate: 60,
      tags: [tags.cards, tags.accounts, tags.transactions],
    },
  )(session.familyId, normalizedFilters);
}
