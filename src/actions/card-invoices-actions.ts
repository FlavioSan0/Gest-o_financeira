"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function getRequiredValue(formData: FormData, field: string) {
  const value = formData.get(field);

  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(`Campo obrigatório não informado: ${field}`);
  }

  return value.trim();
}

function parseNumberValue(value: string, fieldName: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new Error(`${fieldName} inválido.`);
  }

  return numericValue;
}

export async function payCardInvoiceAction(formData: FormData) {
  const creditCardId = getRequiredValue(formData, "creditCardId");
  const accountId = getRequiredValue(formData, "accountId");

  const month = parseNumberValue(getRequiredValue(formData, "month"), "Mês");
  const year = parseNumberValue(getRequiredValue(formData, "year"), "Ano");

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  await prisma.$transaction(async () => {
    const transactions = await prisma.transaction.findMany({
      where: {
        creditCardId,
        paymentMethod: "CREDIT_CARD",
        type: "EXPENSE",
        status: {
          not: "CANCELED",
        },
        transactionDate: {
          gte: start,
          lt: end,
        },
      },
    });

    const totalAmount = transactions.reduce(
      (acc, transaction) => acc + Number(transaction.amount),
      0,
    );

    if (transactions.length === 0 || totalAmount <= 0) {
      throw new Error("Nenhuma compra encontrada para esta fatura.");
    }

    const existingInvoice = await prisma.cardInvoice.findUnique({
      where: {
        creditCardId_month_year: {
          creditCardId,
          month,
          year,
        },
      },
    });

    if (existingInvoice?.status === "PAID") {
      throw new Error("Esta fatura já foi paga.");
    }

    const invoice = await prisma.cardInvoice.upsert({
      where: {
        creditCardId_month_year: {
          creditCardId,
          month,
          year,
        },
      },
      update: {
        totalAmount,
        status: "PAID",
        dueDate: new Date(year, month - 1, 10),
      },
      create: {
        creditCardId,
        month,
        year,
        totalAmount,
        status: "PAID",
        dueDate: new Date(year, month - 1, 10),
      },
    });

    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        currentBalance: {
          decrement: totalAmount,
        },
      },
    });

    await prisma.transaction.updateMany({
      where: {
        id: {
          in: transactions.map((transaction) => transaction.id),
        },
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
        invoiceId: invoice.id,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/contas");
  revalidatePath("/lancamentos");
  revalidatePath("/cartoes");
  revalidatePath("/cartoes/faturas");
}