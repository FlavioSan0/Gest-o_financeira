"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_FAMILY_ID = "family-flavio-ana";
const DEFAULT_FAMILY_NAME = "Família Flávio e Ana";
const GENERIC_REGISTRATION_ERROR = "/cadastro?error=invalid";

function redirectWithError(error: string): never {
  redirect(`/cadastro?error=${error}`);
}

function getRequiredValue(formData: FormData, field: string, error = field) {
  const value = formData.get(field);

  if (!value || typeof value !== "string" || value.trim() === "") {
    redirectWithError(error);
  }

  return value.trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function inviteCodeIsValid(inviteCode: string) {
  const configuredCode = process.env.REGISTRATION_INVITE_CODE;

  if (!configuredCode) {
    return false;
  }

  return inviteCode === configuredCode;
}

export async function registerAction(formData: FormData) {
  const name = getRequiredValue(formData, "name", "name");
  const email = getRequiredValue(formData, "email", "email").toLowerCase();
  const password = getRequiredValue(formData, "password", "password");
  const confirmPassword = getRequiredValue(
    formData,
    "confirmPassword",
    "password-confirmation",
  );
  const inviteCode = getRequiredValue(
    formData,
    "inviteCode",
    "invalid",
  );

  if (!isValidEmail(email)) {
    redirectWithError("email");
  }

  if (password.length < 8) {
    redirectWithError("password");
  }

  if (password !== confirmPassword) {
    redirectWithError("password-confirmation");
  }

  if (!inviteCodeIsValid(inviteCode)) {
    redirect(GENERIC_REGISTRATION_ERROR);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    redirect(GENERIC_REGISTRATION_ERROR);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      let family = await tx.family.findUnique({
        where: {
          id: DEFAULT_FAMILY_ID,
        },
        select: {
          id: true,
        },
      });

      if (!family) {
        family = await tx.family.findFirst({
          where: {
            name: DEFAULT_FAMILY_NAME,
          },
          select: {
            id: true,
          },
        });
      }

      if (!family) {
        family = await tx.family.create({
          data: {
            id: DEFAULT_FAMILY_ID,
            name: DEFAULT_FAMILY_NAME,
          },
          select: {
            id: true,
          },
        });
      }

      const familyMemberCount = await tx.familyMember.count({
        where: {
          familyId: family.id,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: {
          id: true,
        },
      });

      await tx.familyMember.create({
        data: {
          familyId: family.id,
          userId: user.id,
          role: familyMemberCount === 0 ? "OWNER" : "MEMBER",
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect(GENERIC_REGISTRATION_ERROR);
    }

    throw error;
  }

  redirect("/login?message=registered");
}
