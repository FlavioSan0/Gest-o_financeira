import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export async function getCreditCardsPageData() {
  const family = await prisma.family.findFirst({
    where: {
      name: "Flávio & Ana",
    },
  });

  if (!family) {
    return {
      familyId: "",
      creditCards: [],
      summary: {
        total: 0,
        active: 0,
        inactive: 0,
        totalLimit: formatCurrency(0),
      },
    };
  }

  const creditCards = await prisma.creditCard.findMany({
    where: {
      familyId: family.id,
    },
    orderBy: [
      {
        active: "desc",
      },
      {
        name: "asc",
      },
    ],
  });

  const activeCards = creditCards.filter((card) => card.active);
  const inactiveCards = creditCards.filter((card) => !card.active);

  const totalLimit = activeCards.reduce(
    (acc, card) => acc + Number(card.limitAmount),
    0,
  );

  return {
    familyId: family.id,
    creditCards: creditCards.map((card) => ({
      id: card.id,
      name: card.name,
      bank: card.bank ?? "Banco não informado",
      limitAmount: formatCurrency(Number(card.limitAmount)),
      rawLimitAmount: Number(card.limitAmount),
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      active: card.active,
    })),
    summary: {
      total: creditCards.length,
      active: activeCards.length,
      inactive: inactiveCards.length,
      totalLimit: formatCurrency(totalLimit),
    },
  };
}