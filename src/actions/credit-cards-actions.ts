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

function parseDayValue(value: string, fieldName: string) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 31) {
    throw new Error(`${fieldName} deve ser um dia entre 1 e 31.`);
  }

  return numericValue;
}

export async function createCreditCardAction(formData: FormData) {
  const familyId = getRequiredValue(formData, "familyId");
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

  revalidatePath("/cartoes");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/");
}

export async function toggleCreditCardStatusAction(formData: FormData) {
  const creditCardId = getRequiredValue(formData, "creditCardId");
  const currentStatus = getRequiredValue(formData, "currentStatus");

  await prisma.creditCard.update({
    where: {
      id: creditCardId,
    },
    data: {
      active: currentStatus !== "true",
    },
  });

  revalidatePath("/cartoes");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/");
}