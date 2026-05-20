import { unstable_cache } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

async function getCategoriesPageDataForFamily(familyId: string) {
  const categories = await prisma.category.findMany({
    where: {
      familyId,
    },
    orderBy: [
      {
        active: "desc",
      },
      {
        type: "asc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
      icon: true,
      active: true,
    },
  });

  const income = categories.filter((category) => category.type === "INCOME");
  const expense = categories.filter((category) => category.type === "EXPENSE");
  const active = categories.filter((category) => category.active);
  const inactive = categories.filter((category) => !category.active);

  return {
    familyId,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
      color: category.color ?? "",
      icon: category.icon ?? "",
      active: category.active,
    })),
    summary: {
      total: categories.length,
      income: income.length,
      expense: expense.length,
      active: active.length,
      inactive: inactive.length,
    },
  };
}

export async function getCategoriesPageData() {
  const session = await requireSession();
  const tags = familyCacheTags(session.familyId);

  return unstable_cache(
    getCategoriesPageDataForFamily,
    ["categories-page", session.familyId],
    {
      revalidate: 60,
      tags: [tags.categories, tags.options],
    },
  )(session.familyId);
}

export async function getCategoryForEdit(id: string) {
  const session = await requireSession();

  const category = await prisma.category.findFirst({
    where: {
      id,
      familyId: session.familyId,
    },
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
      icon: true,
    },
  });

  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    type: category.type,
    color: category.color ?? "",
    icon: category.icon ?? "",
  };
}
