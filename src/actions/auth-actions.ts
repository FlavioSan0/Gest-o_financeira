"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

function getRequiredValue(formData: FormData, field: string) {
  const value = formData.get(field);

  if (!value || typeof value !== "string" || value.trim() === "") {
    redirect("/login?error=invalid");
  }

  return value.trim();
}

function getRedirectPath(formData: FormData) {
  const next = formData.get("next");

  if (typeof next !== "string" || !next.startsWith("/")) {
    return "/";
  }

  if (next.startsWith("/login")) {
    return "/";
  }

  return next;
}

export async function loginAction(formData: FormData) {
  const email = getRequiredValue(formData, "email").toLowerCase();
  const password = getRequiredValue(formData, "password");
  const nextPath = getRedirectPath(formData);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    redirect("/login?error=invalid");
  }

  const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordIsValid) {
    redirect("/login?error=invalid");
  }

  const membership = await prisma.familyMember.findFirst({
    where: {
      userId: user.id,
    },
    select: {
      familyId: true,
    },
  });

  if (!membership) {
    redirect("/login?error=invalid");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  await setSessionCookie({
    userId: user.id,
    familyId: membership.familyId,
    name: user.name,
    email: user.email,
  });

  redirect(nextPath);
}

export async function logoutAction() {
  await clearSessionCookie();

  redirect("/login");
}
