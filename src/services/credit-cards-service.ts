import { unstable_cache } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";

async function getCreditCardsPageDataForFamily(familyId: string) {
  const creditCards = await prisma.creditCard.findMany({
    where: {
      familyId,
    },
    orderBy: [
      {
        active: "desc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      bank: true,
      limitAmount: true,
      closingDay: true,
      dueDay: true,
      active: true,
    },
  });

  const activeCards = creditCards.filter((card) => card.active);
  const inactiveCards = creditCards.filter((card) => !card.active);

  const totalLimit = activeCards.reduce(
    (acc, card) => acc + Number(card.limitAmount),
    0,
  );

  return {
    familyId,
    creditCards: creditCards.map((card) => ({
      id: card.id,
      name: card.name,
      bank: card.bank ?? "Banco nao informado",
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

export async function getCreditCardsPageData() {
  const session = await requireSession();
  const tags = familyCacheTags(session.familyId);

  return unstable_cache(
    getCreditCardsPageDataForFamily,
    ["credit-cards-page", session.familyId],
    {
      revalidate: 60,
      tags: [tags.cards, tags.options],
    },
  )(session.familyId);
}
