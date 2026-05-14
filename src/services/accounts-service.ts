import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export async function getAccountsPageData() {
  const family = await prisma.family.findFirst({
    where: {
      name: "Flávio & Ana",
    },
  });

  if (!family) {
    return {
      familyId: "",
      accounts: [],
      summary: {
        total: 0,
        active: 0,
        inactive: 0,
        totalCurrentBalance: formatCurrency(0),
        totalInitialBalance: formatCurrency(0),
      },
    };
  }

  const accounts = await prisma.account.findMany({
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
    familyId: family.id,
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