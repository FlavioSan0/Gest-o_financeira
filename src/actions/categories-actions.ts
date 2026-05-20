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

function getCategoryType(value: string) {
  if (value !== "INCOME" && value !== "EXPENSE") {
    throw new Error("Tipo de categoria inválido.");
  }

  return value;
}

function revalidateCategoriesDependencies() {
  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath("/lancamentos");
  revalidatePath("/lancamentos/novo");
}

export async function createCategoryAction(formData: FormData) {
  const familyId = getRequiredValue(formData, "familyId");
  const name = getRequiredValue(formData, "name");
  const type = getCategoryType(getRequiredValue(formData, "type"));
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

  revalidateCategoriesDependencies();
  redirect("/categorias");
}

export async function updateCategoryAction(formData: FormData) {
  const categoryId = getRequiredValue(formData, "categoryId");
  const name = getRequiredValue(formData, "name");
  const type = getCategoryType(getRequiredValue(formData, "type"));
  const color = getOptionalValue(formData, "color");
  const icon = getOptionalValue(formData, "icon");

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    throw new Error("Categoria não encontrada.");
  }

  await prisma.category.update({
    where: {
      id: category.id,
    },
    data: {
      name,
      type,
      color,
      icon,
    },
  });

  revalidateCategoriesDependencies();
  redirect("/categorias");
}

export async function toggleCategoryStatusAction(categoryId: string) {
  if (!categoryId || categoryId.trim() === "") {
    throw new Error("ID da categoria não informado.");
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      active: true,
    },
  });

  if (!category) {
    throw new Error("Categoria não encontrada.");
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: category.id,
    },
    data: {
      active: !category.active,
    },
    select: {
      id: true,
      active: true,
    },
  });

  revalidateCategoriesDependencies();

  return {
    success: true,
    categoryId: updatedCategory.id,
    active: updatedCategory.active,
  };
}