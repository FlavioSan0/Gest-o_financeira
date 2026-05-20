import { prisma } from "@/lib/prisma";

export async function getCategoriesPageData() {
  const family = await prisma.family.findFirst({
    where: {
      name: "Flávio & Ana",
    },
  });

  if (!family) {
    return {
      familyId: "",
      categories: [],
      summary: {
        total: 0,
        income: 0,
        expense: 0,
        active: 0,
        inactive: 0,
      },
    };
  }

  const categories = await prisma.category.findMany({
    where: {
      familyId: family.id,
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
  });

  const income = categories.filter((category) => category.type === "INCOME");
  const expense = categories.filter((category) => category.type === "EXPENSE");
  const active = categories.filter((category) => category.active);
  const inactive = categories.filter((category) => !category.active);

  return {
    familyId: family.id,
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

export async function getCategoryForEdit(id: string) {
  const category = await prisma.category.findUnique({
    where: {
      id,
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