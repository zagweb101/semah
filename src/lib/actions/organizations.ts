"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createInviteToken } from "@/lib/invitations/token";
import { sendInvitationEmail } from "@/lib/actions/email";
import { audit } from "@/lib/audit/log";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type InviteState = { error?: string; message?: string } | null;

export async function createOrganizationAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  const slug = slugify(name);
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) return;

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      ownerId: session.user.id,
      memberships: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });

  await audit({
    organizationId: org.id,
    userId: session.user.id,
    action: "ORG_CREATED",
    resourceType: "Organization",
    resourceId: org.id,
    metadata: { name, slug },
  });

  revalidatePath("/dashboard/teams");
  redirect(`/dashboard/teams/${org.id}`);
}

export async function inviteMemberAction(
  orgId: string,
  email: string,
  role: "ADMIN" | "MEMBER" = "MEMBER",
): Promise<InviteState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: orgId,
      },
    },
  });

  if (!membership || membership.role === "MEMBER") {
    return { error: "ليس لديك صلاحية دعوة أعضاء" };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    const existingMembership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: existingUser.id, organizationId: orgId } },
    });
    if (existingMembership) {
      return { error: "المستخدم عضو بالفعل في هذه المؤسسة" };
    }

    await prisma.membership.create({
      data: { userId: existingUser.id, organizationId: orgId, role },
    });

    await audit({
      organizationId: orgId,
      userId: session.user.id,
      action: "MEMBER_INVITED",
      resourceType: "Membership",
      resourceId: existingUser.id,
      metadata: { email: normalizedEmail, role },
    });

    revalidatePath(`/dashboard/teams/${orgId}`);
    return { message: "تمت إضافة العضو بنجاح" };
  }

  // New user: send invitation link
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } });
  if (!org) return { error: "المؤسسة غير موجودة" };

  const token = await createInviteToken({ email: normalizedEmail, orgId, role });
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/register?invite=${encodeURIComponent(token)}`;

  await sendInvitationEmail({
    to: normalizedEmail,
    orgName: org.name,
    inviterName: session.user.name ?? session.user.email ?? "أحد أعضاء الفريق",
    inviteUrl,
  });

  await audit({
    organizationId: orgId,
    userId: session.user.id,
    action: "MEMBER_INVITED",
    resourceType: "Invitation",
    metadata: { email: normalizedEmail, role },
  });

  return { message: "تم إرسال دعوة بالبريد الإلكتروني" };
}

export async function removeMemberAction(orgId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: orgId,
      },
    },
  });

  if (!membership || membership.role === "MEMBER") return;

  await prisma.membership.delete({
    where: {
      userId_organizationId: { userId, organizationId: orgId },
    },
  });

  await audit({
    organizationId: orgId,
    userId: session.user.id,
    action: "MEMBER_REMOVED",
    resourceType: "Membership",
    resourceId: userId,
  });

  revalidatePath(`/dashboard/teams/${orgId}`);
}

export async function deleteOrganizationAction(orgId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org || org.ownerId !== session.user.id) return;

  await prisma.organization.delete({ where: { id: orgId } });

  await audit({
    userId: session.user.id,
    action: "ORG_DELETED",
    resourceType: "Organization",
    resourceId: orgId,
  });

  revalidatePath("/dashboard/teams");
  redirect("/dashboard/teams");
}
