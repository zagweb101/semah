"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { sendWelcomeEmail } from "@/lib/actions/email";
import { verifyInviteToken } from "@/lib/invitations/token";
import { audit } from "@/lib/audit/log";

export type RegisterState = {
  error?: string;
} | null;

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  const inviteToken = (formData.get("invite") as string) || undefined;

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { error: "Email already registered" };
  }

  let invite: Awaited<ReturnType<typeof verifyInviteToken>> = null;
  if (inviteToken) {
    invite = await verifyInviteToken(inviteToken);
    if (!invite || invite.email.toLowerCase().trim() !== normalizedEmail) {
      return { error: "رابط الدعوة غير صالح أو البريد الإلكتروني لا يتطابق" };
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashedPassword },
  });

  if (invite) {
    await prisma.membership.create({
      data: { userId: user.id, organizationId: invite.orgId, role: invite.role },
    });

    await audit({
      organizationId: invite.orgId,
      userId: user.id,
      action: "MEMBER_INVITED",
      resourceType: "Membership",
      resourceId: user.id,
      metadata: { acceptedInvite: true, role: invite.role },
    });
  }

  await sendWelcomeEmail({ to: normalizedEmail, name });

  await signIn("credentials", { email: normalizedEmail, password, redirect: false });
  redirect("/dashboard");
}
