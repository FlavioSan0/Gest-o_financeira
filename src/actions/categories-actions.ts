"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
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

function getCategoryType(value: string) {
  if (value !== "INCOME" && value !== "EXPENSE") {
    throw new Error("Tipo de categoria invalido.");
  }

  return value;
}

function revalidateCategoriesDependencies(familyId: string) {
  const tags = familyCacheTags(familyId);

  revalidateTag(tags.categories, "max");
  revalidateTag(tags.dashboard, "max");
  revalidateTag(tags.options, "max");
  revalidateTag(tags.transactions, "max");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/categorias");
  revalidatePath("/lancamentos");
  revalidatePath("/lancamentos/novo");
}

export async function createCategoryAction(formData: FormData) {
  const session = await requireSession();
  const familyId = session.familyId;
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

  revalidateCategoriesDependencies(familyId);
  redirect("/categorias");
}

export async function updateCategoryAction(formData: FormData) {
  const session = await requireSession();
  const categoryId = getRequiredValue(formData, "categoryId");
  const name = getRequiredValue(formData, "name");
  const type = getCategoryType(getRequiredValue(formData, "type"));
  const color = getOptionalValue(formData, "color");
  const icon = getOptionalValue(formData, "icon");

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      familyId: session.familyId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    throw new Error("Categoria nao encontrada.");
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

  revalidateCategoriesDependencies(session.familyId);
  redirect("/categorias");
}

export async function toggleCategoryStatusAction(categoryId: string) {
  const session = await requireSession();

  if (!categoryId || categoryId.trim() === "") {
    throw new Error("ID da categoria nao informado.");
  }

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      familyId: session.familyId,
    },
    select: {
      id: true,
      active: true,
    },
  });

  if (!category) {
    throw new Error("Categoria nao encontrada.");
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

  revalidateCategoriesDependencies(session.familyId);

  return {
    success: true,
    categoryId: updatedCategory.id,
    active: updatedCategory.active,
  };
}
