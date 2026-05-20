import { unstable_cache } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";

async function getAccountsPageDataForFamily(familyId: string) {
  const accounts = await prisma.account.findMany({
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
      type: true,
      initialBalance: true,
      currentBalance: true,
      active: true,
    },
  });

  const activeAccounts = accounts.filter((account) => account.active);
  const inactiveAccounts = accounts.filter((account) => !account.active);

  const totalCurrentBalance = activeAccounts.reduce(
    (acc, account) => acc + Number(account.currentBalance),
    0,
  );

  const totalInitialBalance = activeAccounts.reduce(
    (acc, account) => acc + Number(account.initialBalance),
    0,
  );

  return {
    familyId,
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      initialBalance: formatCurrency(Number(account.initialBalance)),
      currentBalance: formatCurrency(Number(account.currentBalance)),
      rawInitialBalance: Number(account.initialBalance),
      rawCurrentBalance: Number(account.currentBalance),
      active: account.active,
    })),
    summary: {
      total: accounts.length,
      active: activeAccounts.length,
      inactive: inactiveAccounts.length,
      totalCurrentBalance: formatCurrency(totalCurrentBalance),
      totalInitialBalance: formatCurrency(totalInitialBalance),
    },
  };
}

export async function getAccountsPageData() {
  const session = await requireSession();
  const tags = familyCacheTags(session.familyId);

  return unstable_cache(
    getAccountsPageDataForFamily,
    ["accounts-page", session.familyId],
    {
      revalidate: 60,
      tags: [tags.accounts, tags.options],
    },
  )(session.familyId);
}
