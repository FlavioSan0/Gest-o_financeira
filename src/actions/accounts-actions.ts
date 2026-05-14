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

export async function createAccountAction(formData: FormData) {
  const familyId = getRequiredValue(formData, "familyId");
  const name = getRequiredValue(formData, "name");
  const type = getRequiredValue(formData, "type") as
    | "CHECKING"
    | "SAVINGS"
    | "CASH"
    | "WALLET"
    | "INVESTMENT"
    | "OTHER";

  const initialBalance = parseCurrencyValue(
    getOptionalValue(formData, "initialBalance"),
  );

  const existingAccount = await prisma.account.findFirst({
    where: {
      familyId,
      name,
    },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: {
        id: existingAccount.id,
      },
      data: {
        type,
        initialBalance,
        currentBalance: initialBalance,
        active: true,
      },
    });
  } else {
    await prisma.account.create({
      data: {
        familyId,
        name,
        type,
        initialBalance,
        currentBalance: initialBalance,
        active: true,
      },
    });
  }

  revalidatePath("/contas");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/lancamentos");
  revalidatePath("/");
}

export async function toggleAccountStatusAction(formData: FormData) {
  const accountId = getRequiredValue(formData, "accountId");
  const currentStatus = getRequiredValue(formData, "currentStatus");

  await prisma.account.update({
    where: {
      id: accountId,
    },
    data: {
      active: currentStatus !== "true",
    },
  });

  revalidatePath("/contas");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/lancamentos");
  revalidatePath("/");
}