import { unstable_cache } from "next/cache";
import { familyCacheTags } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";

export type GoalStatusValue =
  | "ACTIVE"
  | "COMPLETED"
  | "PAUSED"
  | "CANCELED";

export type GoalListItem = {
  id: string;
  name: string;
  status: GoalStatusValue;
  statusLabel: string;
  targetAmount: string;
  currentAmount: string;
  remainingAmount: string;
  rawTargetAmount: number;
  rawCurrentAmount: number;
  rawDeadline: string;
  deadline: string | null;
  progress: number;
  isOverdue: boolean;
};

export type GoalsPageData = {
  familyId: string;
  goals: GoalListItem[];
  summary: {
    total: number;
    active: number;
    completed: number;
    paused: number;
    canceled: number;
    totalTargetAmount: string;
    totalCurrentAmount: string;
    averageProgress: number;
  };
};

const statusLabels: Record<GoalStatusValue, string> = {
  ACTIVE: "Ativa",
  COMPLETED: "Concluida",
  PAUSED: "Pausada",
  CANCELED: "Cancelada",
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function toDateInputValue(value: Date | null) {
  if (!value) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toMoneyInputValue(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function calculateProgress(currentAmount: number, targetAmount: number) {
  if (targetAmount <= 0) return 0;

  return Math.min(
    100,
    Number(((currentAmount / targetAmount) * 100).toFixed(1)),
  );
}

async function getGoalsPageDataForFamily(
  familyId: string,
): Promise<GoalsPageData> {
  const goals = await prisma.goal.findMany({
    where: {
      familyId,
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        deadline: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      name: true,
      targetAmount: true,
      currentAmount: true,
      deadline: true,
      status: true,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mappedGoals = goals.map((goal) => {
    const rawTargetAmount = Number(goal.targetAmount);
    const rawCurrentAmount = Number(goal.currentAmount);
    const remaining = Math.max(rawTargetAmount - rawCurrentAmount, 0);
    const status = goal.status as GoalStatusValue;

    return {
      id: goal.id,
      name: goal.name,
      status,
      statusLabel: statusLabels[status],
      targetAmount: formatCurrency(rawTargetAmount),
      currentAmount: formatCurrency(rawCurrentAmount),
      remainingAmount: formatCurrency(remaining),
      rawTargetAmount,
      rawCurrentAmount,
      rawDeadline: toDateInputValue(goal.deadline),
      deadline: goal.deadline ? formatDate(goal.deadline) : null,
      progress: calculateProgress(rawCurrentAmount, rawTargetAmount),
      isOverdue:
        goal.status === "ACTIVE" &&
        Boolean(goal.deadline) &&
        Number(goal.deadline) < Number(today),
    };
  });

  const activeGoals = mappedGoals.filter((goal) => goal.status === "ACTIVE");
  const totalTargetAmount = activeGoals.reduce(
    (sum, goal) => sum + goal.rawTargetAmount,
    0,
  );
  const totalCurrentAmount = activeGoals.reduce(
    (sum, goal) => sum + goal.rawCurrentAmount,
    0,
  );
  const averageProgress =
    activeGoals.length > 0
      ? Number(
          (
            activeGoals.reduce((sum, goal) => sum + goal.progress, 0) /
            activeGoals.length
          ).toFixed(1),
        )
      : 0;

  return {
    familyId,
    goals: mappedGoals,
    summary: {
      total: mappedGoals.length,
      active: mappedGoals.filter((goal) => goal.status === "ACTIVE").length,
      completed: mappedGoals.filter((goal) => goal.status === "COMPLETED")
        .length,
      paused: mappedGoals.filter((goal) => goal.status === "PAUSED").length,
      canceled: mappedGoals.filter((goal) => goal.status === "CANCELED").length,
      totalTargetAmount: formatCurrency(totalTargetAmount),
      totalCurrentAmount: formatCurrency(totalCurrentAmount),
      averageProgress,
    },
  };
}

export function getGoalStatusOptions() {
  return Object.entries(statusLabels).map(([value, label]) => ({
    value: value as GoalStatusValue,
    label,
  }));
}

export function getGoalMoneyInputValue(value: number) {
  return toMoneyInputValue(value);
}

export async function getGoalsPageData() {
  const session = await requireSession();
  const tags = familyCacheTags(session.familyId);

  return unstable_cache(
    getGoalsPageDataForFamily,
    ["goals-page", session.familyId],
    {
      revalidate: 60,
      tags: [tags.goals],
    },
  )(session.familyId);
}
