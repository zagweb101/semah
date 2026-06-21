"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

  revalidatePath("/dashboard/teams");
  redirect(`/dashboard/teams/${org.id}`);
}

export async function inviteMemberAction(
  orgId: string,
  email: string,
  role: "ADMIN" | "MEMBER" = "MEMBER",
) {
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  await prisma.membership.create({
    data: { userId: user.id, organizationId: orgId, role },
  });

  revalidatePath(`/dashboard/teams/${orgId}`);
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

  revalidatePath(`/dashboard/teams/${orgId}`);
}

export async function deleteOrganizationAction(orgId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org || org.ownerId !== session.user.id) return;

  await prisma.organization.delete({ where: { id: orgId } });

  revalidatePath("/dashboard/teams");
  redirect("/dashboard/teams");
}
