import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type SettingsPageData = {
  user: {
    name: string;
    email: string;
    role: "OWNER" | "MEMBER";
    lastLoginAt: string | null;
  };
  family: {
    name: string;
    members: {
      id: string;
      name: string;
      email: string;
      role: "OWNER" | "MEMBER";
    }[];
  };
  app: {
    name: string;
    mode: string;
    session: string;
  };
};

function formatDateTime(value: Date | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const session = await requireSession();

  const membership = await prisma.familyMember.findFirst({
    where: {
      userId: session.userId,
      familyId: session.familyId,
    },
    select: {
      role: true,
      user: {
        select: {
          name: true,
          email: true,
          lastLoginAt: true,
        },
      },
      family: {
        select: {
          name: true,
          members: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!membership) {
    throw new Error("Sessao invalida.");
  }

  return {
    user: {
      name: membership.user.name,
      email: membership.user.email,
      role: membership.role,
      lastLoginAt: formatDateTime(membership.user.lastLoginAt),
    },
    family: {
      name: membership.family.name,
      members: membership.family.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
      })),
    },
    app: {
      name: "Quebrei",
      mode: "Beta privado",
      session: "Cookie HTTP-only",
    },
  };
}
