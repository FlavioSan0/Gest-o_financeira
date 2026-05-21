"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import type { GoalStatusValue } from "@/services/goals-service";

const allowedStatuses: GoalStatusValue[] = [
  "ACTIVE",
  "COMPLETED",
  "PAUSED",
  "CANCELED",
];

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

function parseCurrencyValue(value: string | null) {
  if (!value) return 0;

  const normalized = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const numericValue = Number(normalized);

  if (Number.isNaN(numericValue)) {
    throw new Error("Valor monetario invalido.");
  }

  return numericValue;
}

function parseDeadline(value: string | null) {
  if (!value) return null;

  const deadline = new Date(`${value}T12:00:00`);

  if (Number.isNaN(deadline.getTime())) {
    throw new Error("Prazo invalido.");
  }

  return deadline;
}

function parseStatus(value: string) {
  if (!allowedStatuses.includes(value as GoalStatusValue)) {
    throw new Error("Status da meta invalido.");
  }

  return value as GoalStatusValue;
}

async function ensureGoalFromFamily(goalId: string, familyId: string) {
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      familyId,
    },
    select: {
      id: true,
    },
  });

  if (!goal) {
    throw new Error("Meta nao encontrada.");
  }

  return goal;
}

function revalidateGoalsDependencies(familyId: string) {
  const tags = familyCacheTags(familyId);

  revalidateTag(tags.goals, "max");
  revalidateTag(tags.dashboard, "max");
  revalidatePath("/metas");
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function createGoalAction(formData: FormData) {
  const session = await requireSession();
  const familyId = session.familyId;
  const name = getRequiredValue(formData, "name");
  const targetAmount = parseCurrencyValue(
    getRequiredValue(formData, "targetAmount"),
  );
  const currentAmount = parseCurrencyValue(
    getOptionalValue(formData, "currentAmount"),
  );
  const deadline = parseDeadline(getOptionalValue(formData, "deadline"));

  if (targetAmount <= 0) {
    throw new Error("A meta precisa ter um valor alvo maior que zero.");
  }

  if (currentAmount < 0) {
    throw new Error("O valor atual nao pode ser negativo.");
  }

  await prisma.goal.create({
    data: {
      familyId,
      name,
      targetAmount,
      currentAmount,
      deadline,
      status: "ACTIVE",
    },
  });

  revalidateGoalsDependencies(familyId);
}

export async function updateGoalAction(formData: FormData) {
  const session = await requireSession();
  const familyId = session.familyId;
  const goalId = getRequiredValue(formData, "goalId");
  const name = getRequiredValue(formData, "name");
  const status = parseStatus(getRequiredValue(formData, "status"));
  const targetAmount = parseCurrencyValue(
    getRequiredValue(formData, "targetAmount"),
  );
  const currentAmount = parseCurrencyValue(
    getRequiredValue(formData, "currentAmount"),
  );
  const deadline = parseDeadline(getOptionalValue(formData, "deadline"));

  if (targetAmount <= 0) {
    throw new Error("A meta precisa ter um valor alvo maior que zero.");
  }

  if (currentAmount < 0) {
    throw new Error("O valor atual nao pode ser negativo.");
  }

  await ensureGoalFromFamily(goalId, familyId);

  await prisma.goal.update({
    where: {
      id: goalId,
    },
    data: {
      name,
      targetAmount,
      currentAmount,
      deadline,
      status,
    },
  });

  revalidateGoalsDependencies(familyId);
}

export async function updateGoalCurrentAmountAction(formData: FormData) {
  const session = await requireSession();
  const familyId = session.familyId;
  const goalId = getRequiredValue(formData, "goalId");
  const currentAmount = parseCurrencyValue(
    getRequiredValue(formData, "currentAmount"),
  );

  if (currentAmount < 0) {
    throw new Error("O valor atual nao pode ser negativo.");
  }

  await ensureGoalFromFamily(goalId, familyId);

  await prisma.goal.update({
    where: {
      id: goalId,
    },
    data: {
      currentAmount,
    },
  });

  revalidateGoalsDependencies(familyId);
}

export async function updateGoalStatusAction(formData: FormData) {
  const session = await requireSession();
  const familyId = session.familyId;
  const goalId = getRequiredValue(formData, "goalId");
  const status = parseStatus(getRequiredValue(formData, "status"));

  await ensureGoalFromFamily(goalId, familyId);

  await prisma.goal.update({
    where: {
      id: goalId,
    },
    data: {
      status,
    },
  });

  revalidateGoalsDependencies(familyId);
}
