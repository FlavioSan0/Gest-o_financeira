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

export async function createCategoryAction(formData: FormData) {
  const familyId = getRequiredValue(formData, "familyId");
  const name = getRequiredValue(formData, "name");
  const type = getRequiredValue(formData, "type") as "INCOME" | "EXPENSE";
  const color = getOptionalValue(formData, "color");
  const icon = getOptionalValue(formData, "icon");

  const existingCategory = await prisma.category.findFirst({
    where: {
      familyId,
      name,
      type,
    },
  });

  if (existingCategory) {
    await prisma.category.update({
      where: {
        id: existingCategory.id,
      },
      data: {
        active: true,
        color,
        icon,
      },
    });
  } else {
    await prisma.category.create({
      data: {
        familyId,
        name,
        type,
        color,
        icon,
        active: true,
      },
    });
  }

  revalidatePath("/categorias");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/lancamentos");
}

export async function toggleCategoryStatusAction(formData: FormData) {
  const categoryId = getRequiredValue(formData, "categoryId");
  const currentStatus = getRequiredValue(formData, "currentStatus");

  await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      active: currentStatus !== "true",
    },
  });

  revalidatePath("/categorias");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/lancamentos");
}