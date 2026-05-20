"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

function getRequiredValue(formData: FormData, field: string) {
  const value = formData.get(field);

  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(`Campo obrigatorio nao informado: ${field}`);
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

function revalidateAccountsDependencies(familyId: string) {
  const tags = familyCacheTags(familyId);

  revalidateTag(tags.accounts, "max");
  revalidateTag(tags.dashboard, "max");
  revalidateTag(tags.options, "max");
  revalidateTag(tags.transactions, "max");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/contas");
  revalidatePath("/lancamentos");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/cartoes/faturas");
}

export async function createAccountAction(formData: FormData) {
  const session = await requireSession();
  const familyId = session.familyId;
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

  revalidateAccountsDependencies(familyId);
}

export async function toggleAccountStatusAction(accountId: string) {
  const session = await requireSession();

  if (!accountId || accountId.trim() === "") {
    throw new Error("ID da conta nao informado.");
  }

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      familyId: session.familyId,
    },
    select: {
      id: true,
      name: true,
      active: true,
    },
  });

  if (!account) {
    throw new Error("Conta nao encontrada.");
  }

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

  revalidateAccountsDependencies(session.familyId);

  return {
    success: true,
    accountId: updatedAccount.id,
    accountName: updatedAccount.name,
    active: updatedAccount.active,
  };
}
