"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath("/dashboard/settings");
}

export async function changePasswordAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const current = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!current || !newPassword) return { error: "All fields required" };
  if (newPassword.length < 6) return { error: "Password too short" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.password) return { error: "No password set" };

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return { error: "Current password incorrect" };

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return null;
}

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.user.delete({ where: { id: session.user.id } });
}
