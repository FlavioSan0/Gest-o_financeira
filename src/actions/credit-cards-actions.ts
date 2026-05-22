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

function parseDayValue(value: string, fieldName: string) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 31) {
    throw new Error(`${fieldName} deve ser um dia entre 1 e 31.`);
  }

  return numericValue;
}

function revalidateCreditCardDependencies(familyId: string) {
  const tags = familyCacheTags(familyId);

  revalidateTag(tags.cards, "max");
  revalidateTag(tags.dashboard, "max");
  revalidateTag(tags.options, "max");
  revalidateTag(tags.transactions, "max");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/cartoes");
  revalidatePath("/cartoes/faturas");
  revalidatePath("/lancamentos/novo");
}

function getBooleanValue(formData: FormData, field: string) {
  const value = getOptionalValue(formData, field);

  return value === "true" || value === "on";
}

export async function createCreditCardAction(formData: FormData) {
  const session = await requireSession();
  const familyId = session.familyId;
  const name = getRequiredValue(formData, "name");
  const bank = getOptionalValue(formData, "bank");
  const limitAmount = parseCurrencyValue(
    getOptionalValue(formData, "limitAmount"),
  );

  const closingDay = parseDayValue(
    getRequiredValue(formData, "closingDay"),
    "Dia de fechamento",
  );

  const dueDay = parseDayValue(
    getRequiredValue(formData, "dueDay"),
    "Dia de vencimento",
  );

  const existingCard = await prisma.creditCard.findFirst({
    where: {
      familyId,
      name,
      bank,
    },
  });

  if (existingCard) {
    await prisma.creditCard.update({
      where: {
        id: existingCard.id,
      },
      data: {
        limitAmount,
        closingDay,
        dueDay,
        active: true,
      },
    });
  } else {
    await prisma.creditCard.create({
      data: {
        familyId,
        name,
        bank,
        limitAmount,
        closingDay,
        dueDay,
        active: true,
      },
    });
  }

  revalidateCreditCardDependencies(familyId);
}

export async function updateCreditCardAction(formData: FormData) {
  const session = await requireSession();
  const familyId = session.familyId;
  const creditCardId = getRequiredValue(formData, "creditCardId");
  const name = getRequiredValue(formData, "name");
  const bank = getOptionalValue(formData, "bank");
  const limitAmount = parseCurrencyValue(
    getOptionalValue(formData, "limitAmount"),
  );
  const closingDay = parseDayValue(
    getRequiredValue(formData, "closingDay"),
    "Dia de fechamento",
  );
  const dueDay = parseDayValue(
    getRequiredValue(formData, "dueDay"),
    "Dia de vencimento",
  );
  const active = getBooleanValue(formData, "active");

  const creditCard = await prisma.creditCard.findFirst({
    where: {
      id: creditCardId,
      familyId,
    },
    select: {
      id: true,
    },
  });

  if (!creditCard) {
    throw new Error("Cartao nao encontrado.");
  }

  await prisma.creditCard.update({
    where: {
      id: creditCard.id,
    },
    data: {
      name,
      bank,
      limitAmount,
      closingDay,
      dueDay,
      active,
    },
  });

  revalidateCreditCardDependencies(familyId);

  return {
    success: true,
  };
}

export async function deleteCreditCardAction(formData: FormData) {
  const session = await requireSession();
  const familyId = session.familyId;
  const creditCardId = getRequiredValue(formData, "creditCardId");

  const creditCard = await prisma.creditCard.findFirst({
    where: {
      id: creditCardId,
      familyId,
    },
    select: {
      id: true,
      _count: {
        select: {
          invoices: true,
          transactions: true,
        },
      },
    },
  });

  if (!creditCard) {
    throw new Error("Cartao nao encontrado.");
  }

  if (
    creditCard._count.transactions > 0 ||
    creditCard._count.invoices > 0
  ) {
    return {
      success: false,
      message:
        "Este cartao possui lancamentos ou faturas e nao pode ser excluido. Voce pode inativa-lo.",
    };
  }

  await prisma.creditCard.delete({
    where: {
      id: creditCard.id,
    },
  });

  revalidateCreditCardDependencies(familyId);

  return {
    success: true,
  };
}

export async function toggleCreditCardStatusAction(formData: FormData) {
  const session = await requireSession();
  const creditCardId = getRequiredValue(formData, "creditCardId");
  const currentStatus = getRequiredValue(formData, "currentStatus");

  const creditCard = await prisma.creditCard.findFirst({
    where: {
      id: creditCardId,
      familyId: session.familyId,
    },
    select: {
      id: true,
    },
  });

  if (!creditCard) {
    throw new Error("Cartao nao encontrado.");
  }

  await prisma.creditCard.update({
    where: {
      id: creditCard.id,
    },
    data: {
      active: currentStatus !== "true",
    },
  });

  revalidateCreditCardDependencies(session.familyId);
}
