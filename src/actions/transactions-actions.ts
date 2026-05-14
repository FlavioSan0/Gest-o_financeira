"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type TransactionType = "INCOME" | "EXPENSE";
type TransactionStatus = "PAID" | "PENDING" | "OVERDUE" | "CANCELED";
type PaymentMethod =
  | "PIX"
  | "CASH"
  | "DEBIT_CARD"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "BOLETO"
  | "OTHER";

type AccountImpactInput = {
  accountId: string | null;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
};

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

function parseCurrencyValue(value: string) {
  const normalized = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const numericValue = Number(normalized);

  if (Number.isNaN(numericValue) || numericValue <= 0) {
    throw new Error("Valor inválido.");
  }

  return numericValue;
}

function shouldAffectAccount(input: AccountImpactInput) {
  return Boolean(input.accountId) && input.status === "PAID";
}

function getAccountImpactAmount(input: AccountImpactInput) {
  if (!shouldAffectAccount(input)) {
    return 0;
  }

  return input.type === "INCOME" ? input.amount : -input.amount;
}

async function applyAccountImpact(input: AccountImpactInput) {
  const impact = getAccountImpactAmount(input);

  if (!input.accountId || impact === 0) {
    return;
  }

  await prisma.account.update({
    where: {
      id: input.accountId,
    },
    data: {
      currentBalance: {
        increment: impact,
      },
    },
  });
}

async function revertAccountImpact(input: AccountImpactInput) {
  const impact = getAccountImpactAmount(input);

  if (!input.accountId || impact === 0) {
    return;
  }

  await prisma.account.update({
    where: {
      id: input.accountId,
    },
    data: {
      currentBalance: {
        decrement: impact,
      },
    },
  });
}

function revalidateFinancialPages() {
  revalidatePath("/");
  revalidatePath("/lancamentos");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/contas");
  revalidatePath("/cartoes");
}

export async function createTransactionAction(formData: FormData) {
  const familyId = getRequiredValue(formData, "familyId");
  const type = getRequiredValue(formData, "type") as TransactionType;
  const description = getRequiredValue(formData, "description");
  const amount = parseCurrencyValue(getRequiredValue(formData, "amount"));
  const transactionDate = getRequiredValue(formData, "transactionDate");

  const rawPaymentMethod = getOptionalValue(formData, "paymentMethod") ?? "PIX";
  const paymentMethod = rawPaymentMethod as PaymentMethod;

  const isCreditCardPayment = paymentMethod === "CREDIT_CARD";

  const accountId = isCreditCardPayment
    ? null
    : getOptionalValue(formData, "accountId");

  const creditCardId = isCreditCardPayment
    ? getRequiredValue(formData, "creditCardId")
    : null;

  const categoryId = getOptionalValue(formData, "categoryId");
  const userId = getOptionalValue(formData, "userId");
  const notes = getOptionalValue(formData, "notes");

  const status = (getOptionalValue(formData, "status") ??
    "PAID") as TransactionStatus;

  await prisma.$transaction(async () => {
    await prisma.transaction.create({
      data: {
        familyId,
        accountId,
        creditCardId,
        categoryId,
        userId,
        type,
        description,
        amount,
        transactionDate: new Date(`${transactionDate}T12:00:00`),
        status,
        paymentMethod,
        notes,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    if (!isCreditCardPayment) {
      await applyAccountImpact({
        accountId,
        type,
        status,
        amount,
      });
    }
  });

  revalidateFinancialPages();

  redirect("/");
}

export async function updateTransactionAction(formData: FormData) {
  const transactionId = getRequiredValue(formData, "transactionId");
  const type = getRequiredValue(formData, "type") as TransactionType;
  const description = getRequiredValue(formData, "description");
  const amount = parseCurrencyValue(getRequiredValue(formData, "amount"));
  const transactionDate = getRequiredValue(formData, "transactionDate");

  const rawPaymentMethod = getOptionalValue(formData, "paymentMethod") ?? "PIX";
  const paymentMethod = rawPaymentMethod as PaymentMethod;

  const isCreditCardPayment = paymentMethod === "CREDIT_CARD";

  const accountId = isCreditCardPayment
    ? null
    : getOptionalValue(formData, "accountId");

  const creditCardId = isCreditCardPayment
    ? getRequiredValue(formData, "creditCardId")
    : null;

  const categoryId = getOptionalValue(formData, "categoryId");
  const userId = getOptionalValue(formData, "userId");
  const notes = getOptionalValue(formData, "notes");

  const status = (getOptionalValue(formData, "status") ??
    "PAID") as TransactionStatus;

  await prisma.$transaction(async () => {
    const oldTransaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!oldTransaction) {
      throw new Error("Lançamento não encontrado.");
    }

    if (oldTransaction.paymentMethod !== "CREDIT_CARD") {
      await revertAccountImpact({
        accountId: oldTransaction.accountId,
        type: oldTransaction.type,
        status: oldTransaction.status,
        amount: Number(oldTransaction.amount),
      });
    }

    await prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        accountId,
        creditCardId,
        categoryId,
        userId,
        type,
        description,
        amount,
        transactionDate: new Date(`${transactionDate}T12:00:00`),
        status,
        paymentMethod,
        notes,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    if (!isCreditCardPayment) {
      await applyAccountImpact({
        accountId,
        type,
        status,
        amount,
      });
    }
  });

  revalidateFinancialPages();

  redirect("/lancamentos");
}

export async function deleteTransactionAction(formData: FormData) {
  const transactionId = getRequiredValue(formData, "transactionId");

  await prisma.$transaction(async () => {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      throw new Error("Lançamento não encontrado.");
    }

    if (transaction.paymentMethod !== "CREDIT_CARD") {
      await revertAccountImpact({
        accountId: transaction.accountId,
        type: transaction.type,
        status: transaction.status,
        amount: Number(transaction.amount),
      });
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  });

  revalidateFinancialPages();

  redirect("/lancamentos");
}