"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function getRequiredValue(formData: FormData, field: string) {
  const value = formData.get(field);

  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(`Campo obrigatório não informado: ${field}`);
  }

  return value.trim();
}

function getOptionalValue(formData: FormData, field: string) {
  const value = formData.get(field);

  if (!value || typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
}

function parseCurrencyValue(value: string | null) {
  if (!value) return 0;

  const normalized = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const numericValue = Number(normalized);

  if (Number.isNaN(numericValue)) {
    return 0;
  }

  return numericValue;
}

function parseDueDay(value: string) {
  const dueDay = Number(value);

  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    throw new Error("Dia de vencimento inválido. Use um número entre 1 e 31.");
  }

  return dueDay;
}

function getCurrentMonthMarker() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `${year}-${month}`;
}

function getCurrentMonthDueDate(dueDay: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const safeDueDay = Math.min(Math.max(dueDay, 1), lastDayOfMonth);

  return new Date(year, month, safeDueDay, 12, 0, 0);
}

function revalidateRecurringDependencies() {
  revalidatePath("/");
  revalidatePath("/recorrentes");
  revalidatePath("/lancamentos");
  revalidatePath("/lancamentos/novo");
}

export async function createRecurringBillAction(formData: FormData) {
  const familyId = getRequiredValue(formData, "familyId");
  const description = getRequiredValue(formData, "description");
  const amount = parseCurrencyValue(getOptionalValue(formData, "amount"));
  const dueDay = parseDueDay(getRequiredValue(formData, "dueDay"));
  const categoryId = getOptionalValue(formData, "categoryId");

  if (amount <= 0) {
    throw new Error("O valor da conta fixa deve ser maior que zero.");
  }

  const existingBill = await prisma.recurringBill.findFirst({
    where: {
      familyId,
      description,
      dueDay,
    },
  });

  if (existingBill) {
    await prisma.recurringBill.update({
      where: {
        id: existingBill.id,
      },
      data: {
        amount,
        categoryId,
        frequency: "MONTHLY",
        active: true,
      },
    });
  } else {
    await prisma.recurringBill.create({
      data: {
        familyId,
        categoryId,
        description,
        amount,
        dueDay,
        frequency: "MONTHLY",
        active: true,
      },
    });
  }

  revalidateRecurringDependencies();
  redirect("/recorrentes");
}

export async function toggleRecurringBillStatusAction(recurringBillId: string) {
  if (!recurringBillId || recurringBillId.trim() === "") {
    throw new Error("ID da conta fixa não informado.");
  }

  const recurringBill = await prisma.recurringBill.findUnique({
    where: {
      id: recurringBillId,
    },
    select: {
      id: true,
      active: true,
    },
  });

  if (!recurringBill) {
    throw new Error("Conta fixa não encontrada.");
  }

  const updatedBill = await prisma.recurringBill.update({
    where: {
      id: recurringBill.id,
    },
    data: {
      active: !recurringBill.active,
    },
    select: {
      id: true,
      active: true,
    },
  });

  revalidateRecurringDependencies();

  return {
    success: true,
    recurringBillId: updatedBill.id,
    active: updatedBill.active,
  };
}

export async function generateRecurringTransactionAction(
  recurringBillId: string,
) {
  if (!recurringBillId || recurringBillId.trim() === "") {
    throw new Error("ID da conta fixa não informado.");
  }

  const recurringBill = await prisma.recurringBill.findUnique({
    where: {
      id: recurringBillId,
    },
    select: {
      id: true,
      familyId: true,
      categoryId: true,
      description: true,
      amount: true,
      dueDay: true,
      active: true,
    },
  });

  if (!recurringBill) {
    throw new Error("Conta fixa não encontrada.");
  }

  if (!recurringBill.active) {
    throw new Error("Essa conta fixa está inativa.");
  }

  const monthMarker = getCurrentMonthMarker();
  const recurringMarker = `RECURRENTE_ID:${recurringBill.id};RECURRENTE_MES:${monthMarker}`;
  const dueDate = getCurrentMonthDueDate(recurringBill.dueDay);

  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      familyId: recurringBill.familyId,
      notes: {
        contains: recurringMarker,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingTransaction) {
    return {
      success: true,
      alreadyGenerated: true,
      transactionId: existingTransaction.id,
    };
  }

  const transaction = await prisma.transaction.create({
    data: {
      familyId: recurringBill.familyId,
      categoryId: recurringBill.categoryId,
      type: "EXPENSE",
      description: recurringBill.description,
      amount: recurringBill.amount,
      transactionDate: dueDate,
      dueDate,
      status: "PENDING",
      paymentMethod: "OTHER",
      notes: `${recurringMarker}; Gerado automaticamente a partir de conta fixa.`,
    },
    select: {
      id: true,
    },
  });

  revalidateRecurringDependencies();

  return {
    success: true,
    alreadyGenerated: false,
    transactionId: transaction.id,
  };
}