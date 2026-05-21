"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, requireSession } from "@/lib/session";

function getRequiredValue(formData: FormData, field: string) {
  const value = formData.get(field);

  if (!value || typeof value !== "string" || value.trim() === "") {
    redirect("/configuracoes?passwordError=missing");
  }

  return value.trim();
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireSession();
  const currentPassword = getRequiredValue(formData, "currentPassword");
  const newPassword = getRequiredValue(formData, "newPassword");
  const confirmPassword = getRequiredValue(formData, "confirmPassword");

  if (newPassword.length < 8) {
    redirect("/configuracoes?passwordError=short");
  }

  if (newPassword !== confirmPassword) {
    redirect("/configuracoes?passwordError=mismatch");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      memberships: {
        some: {
          familyId: session.familyId,
        },
      },
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    redirect("/configuracoes?passwordError=current");
  }

  const currentPasswordIsValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordIsValid) {
    redirect("/configuracoes?passwordError=current");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
    },
  });

  revalidatePath("/configuracoes");
  await clearSessionCookie();
  redirect("/login?message=password-updated");
}
