import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

function getCurrentMonthMarker() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `${year}-${month}`;
}

function getNextDueDateLabel(dueDay: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const safeDueDay = Math.min(Math.max(dueDay, 1), lastDayOfMonth);
  const dueDate = new Date(year, month, safeDueDay, 12, 0, 0);

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return formatter.format(dueDate);
}

function getDaysUntilDue(dueDay: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const safeDueDay = Math.min(Math.max(dueDay, 1), lastDayOfMonth);
  const dueDate = new Date(year, month, safeDueDay, 23, 59, 59);

  const diff = dueDate.getTime() - now.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function getRecurringBillsPageData() {
  const family = await prisma.family.findFirst({
    where: {
      name: "Flávio & Ana",
    },
  });

  if (!family) {
    return {
      familyId: "",
      categories: [],
      recurringBills: [],
      summary: {
        total: 0,
        active: 0,
        inactive: 0,
        monthlyForecast: formatCurrency(0),
      },
    };
  }

  const [categories, recurringBills] = await Promise.all([
    prisma.category.findMany({
      where: {
        familyId: family.id,
        type: "EXPENSE",
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.recurringBill.findMany({
      where: {
        familyId: family.id,
      },
      orderBy: [
        {
          active: "desc",
        },
        {
          dueDay: "asc",
        },
        {
          description: "asc",
        },
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    }),
  ]);

  const activeRecurringBills = recurringBills.filter((bill) => bill.active);
  const inactiveRecurringBills = recurringBills.filter((bill) => !bill.active);

  const monthlyForecast = activeRecurringBills.reduce(
    (acc, bill) => acc + Number(bill.amount),
    0,
  );

  const currentMonthMarker = getCurrentMonthMarker();

  const generatedTransactions = await prisma.transaction.findMany({
    where: {
      familyId: family.id,
      notes: {
        contains: `RECURRENTE_MES:${currentMonthMarker}`,
      },
    },
    select: {
      notes: true,
    },
  });

  const generatedRecurringIds = new Set(
    generatedTransactions
      .map((transaction) => {
        const notes = transaction.notes ?? "";
        const match = notes.match(/RECURRENTE_ID:([^;]+)/);

        return match?.[1] ?? null;
      })
      .filter(Boolean),
  );

  return {
    familyId: family.id,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
    recurringBills: recurringBills.map((bill) => ({
      id: bill.id,
      description: bill.description,
      amount: formatCurrency(Number(bill.amount)),
      rawAmount: Number(bill.amount),
      dueDay: bill.dueDay,
      frequency: bill.frequency,
      active: bill.active,
      category: bill.category?.name ?? "Sem categoria",
      categoryColor: bill.category?.color ?? "",
      categoryIcon: bill.category?.icon ?? "",
      nextDueDate: getNextDueDateLabel(bill.dueDay),
      daysUntilDue: getDaysUntilDue(bill.dueDay),
      alreadyGeneratedThisMonth: generatedRecurringIds.has(bill.id),
    })),
    summary: {
      total: recurringBills.length,
      active: activeRecurringBills.length,
      inactive: inactiveRecurringBills.length,
      monthlyForecast: formatCurrency(monthlyForecast),
    },
  };
}