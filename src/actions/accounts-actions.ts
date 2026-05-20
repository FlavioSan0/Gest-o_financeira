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

function revalidateAccountsDependencies() {
  revalidatePath("/");
  revalidatePath("/contas");
  revalidatePath("/lancamentos");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/cartoes/faturas");
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

  revalidateAccountsDependencies();
}

export async function toggleAccountStatusAction(accountId: string) {
  console.log("[toggleAccountStatusAction] Recebido accountId:", accountId);

  if (!accountId || accountId.trim() === "") {
    throw new Error("ID da conta não informado.");
  }

  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
    },
    select: {
      id: true,
      name: true,
      active: true,
    },
  });

  if (!account) {
    console.log("[toggleAccountStatusAction] Conta não encontrada.");
    throw new Error("Conta não encontrada.");
  }

  console.log("[toggleAccountStatusAction] Conta encontrada:", {
    id: account.id,
    name: account.name,
    active: account.active,
  });

  const updatedAccount = await prisma.account.update({
    where: {
      id: account.id,
    },
    data: {
      active: !account.active,
    },
    select: {
      id: true,
      name: true,
      active: true,
    },
  });

  console.log("[toggleAccountStatusAction] Conta atualizada:", {
    id: updatedAccount.id,
    name: updatedAccount.name,
    active: updatedAccount.active,
  });

  revalidateAccountsDependencies();

  return {
    success: true,
    accountId: updatedAccount.id,
    accountName: updatedAccount.name,
    active: updatedAccount.active,
  };
}