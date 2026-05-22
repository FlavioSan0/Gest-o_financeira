import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getRequiredDatabaseUrl } from "../src/lib/database-url";

const adapter = new PrismaPg({
  connectionString: getRequiredDatabaseUrl(),
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Iniciando seed do banco...");

  const flavioSeedPassword = process.env.SEED_FLAVIO_PASSWORD;
  const anaSeedPassword = process.env.SEED_ANA_PASSWORD;
  const flavioSeedEmail = process.env.SEED_FLAVIO_EMAIL;
  const anaSeedEmail = process.env.SEED_ANA_EMAIL;

  if (
    !flavioSeedEmail ||
    !flavioSeedPassword ||
    !anaSeedEmail ||
    !anaSeedPassword
  ) {
    throw new Error(
      "Configure SEED_FLAVIO_EMAIL, SEED_FLAVIO_PASSWORD, SEED_ANA_EMAIL e SEED_ANA_PASSWORD no .env antes de rodar o seed.",
    );
  }

  const flavioPasswordHash = await bcrypt.hash(flavioSeedPassword, 12);
  const anaPasswordHash = await bcrypt.hash(anaSeedPassword, 12);

  const flavio = await prisma.user.upsert({
    where: {
      email: flavioSeedEmail.toLowerCase(),
    },
    update: {
      name: "Flávio",
      passwordHash: flavioPasswordHash,
    },
    create: {
      name: "Flávio",
      email: flavioSeedEmail.toLowerCase(),
      passwordHash: flavioPasswordHash,
    },
  });

  const ana = await prisma.user.upsert({
    where: {
      email: anaSeedEmail.toLowerCase(),
    },
    update: {
      name: "Ana",
      passwordHash: anaPasswordHash,
    },
    create: {
      name: "Ana",
      email: anaSeedEmail.toLowerCase(),
      passwordHash: anaPasswordHash,
    },
  });

  const family = await prisma.family.upsert({
    where: {
      id: "family-flavio-ana",
    },
    update: {
      name: "Família Flávio e Ana",
    },
    create: {
      id: "family-flavio-ana",
      name: "Família Flávio e Ana",
    },
  });

  await prisma.familyMember.upsert({
    where: {
      familyId_userId: {
        familyId: family.id,
        userId: flavio.id,
      },
    },
    update: {
      role: "OWNER",
    },
    create: {
      familyId: family.id,
      userId: flavio.id,
      role: "OWNER",
    },
  });

  await prisma.familyMember.upsert({
    where: {
      familyId_userId: {
        familyId: family.id,
        userId: ana.id,
      },
    },
    update: {
      role: "MEMBER",
    },
    create: {
      familyId: family.id,
      userId: ana.id,
      role: "MEMBER",
    },
  });

  const incomeCategories = [
    { name: "Salário", color: "#22C55E", icon: "wallet" },
    { name: "Freelance", color: "#22C55E", icon: "briefcase" },
    { name: "Extras", color: "#22C55E", icon: "plus-circle" },
  ];

  const expenseCategories = [
    { name: "Moradia", color: "#EF4444", icon: "home" },
    { name: "Alimentação", color: "#EF4444", icon: "utensils" },
    { name: "Transporte", color: "#EF4444", icon: "car" },
    { name: "Saúde", color: "#EF4444", icon: "heart-pulse" },
    { name: "Educação", color: "#EF4444", icon: "book-open" },
    { name: "Lazer", color: "#EF4444", icon: "gamepad-2" },
    { name: "Cartão de crédito", color: "#A855F7", icon: "credit-card" },
    { name: "Casamento", color: "#38BDF8", icon: "heart" },
    { name: "Casa nova", color: "#38BDF8", icon: "house-plus" },
    { name: "Outros", color: "#94A3B8", icon: "circle" },
  ];

  for (const category of incomeCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        familyId: family.id,
        name: category.name,
        type: "INCOME",
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          familyId: family.id,
          name: category.name,
          type: "INCOME",
          color: category.color,
          icon: category.icon,
          active: true,
        },
      });
    } else {
      await prisma.category.update({
        where: {
          id: existing.id,
        },
        data: {
          color: category.color,
          icon: category.icon,
          active: true,
        },
      });
    }
  }

  for (const category of expenseCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        familyId: family.id,
        name: category.name,
        type: "EXPENSE",
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          familyId: family.id,
          name: category.name,
          type: "EXPENSE",
          color: category.color,
          icon: category.icon,
          active: true,
        },
      });
    } else {
      await prisma.category.update({
        where: {
          id: existing.id,
        },
        data: {
          color: category.color,
          icon: category.icon,
          active: true,
        },
      });
    }
  }

  const accountExists = await prisma.account.findFirst({
    where: {
      familyId: family.id,
      name: "Conta principal",
    },
  });

  if (!accountExists) {
    await prisma.account.create({
      data: {
        familyId: family.id,
        name: "Conta principal",
        type: "CHECKING",
        initialBalance: 0,
        currentBalance: 0,
        active: true,
      },
    });
  }

  const cashAccountExists = await prisma.account.findFirst({
    where: {
      familyId: family.id,
      name: "Carteira",
    },
  });

  if (!cashAccountExists) {
    await prisma.account.create({
      data: {
        familyId: family.id,
        name: "Carteira",
        type: "CASH",
        initialBalance: 0,
        currentBalance: 0,
        active: true,
      },
    });
  }

  const creditCardExists = await prisma.creditCard.findFirst({
    where: {
      familyId: family.id,
      name: "Cartão principal",
    },
  });

  if (!creditCardExists) {
    await prisma.creditCard.create({
      data: {
        familyId: family.id,
        name: "Cartão principal",
        bank: "Banco",
        limitAmount: 0,
        closingDay: 25,
        dueDay: 10,
        active: true,
      },
    });
  }

  const goalExists = await prisma.goal.findFirst({
    where: {
      familyId: family.id,
      name: "Reserva de emergência",
    },
  });

  if (!goalExists) {
    await prisma.goal.create({
      data: {
        familyId: family.id,
        name: "Reserva de emergência",
        targetAmount: 3000,
        currentAmount: 0,
        status: "ACTIVE",
      },
    });
  }

  console.log("Seed finalizado com sucesso!");
  console.log({
    family: family.name,
    users: [flavio.name, ana.name],
  });
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
