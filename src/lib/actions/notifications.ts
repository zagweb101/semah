"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function markNotificationReadAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { read: true },
  });

  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/dashboard");
}

export async function createNotificationAction(
  userId: string,
  title: string,
  message: string,
  type: string = "info",
) {
  await prisma.notification.create({
    data: { userId, title, message, type },
  });
}

export async function notifyProjectTeam(
  projectId: string,
  title: string,
  message: string,
  type: string = "info",
  relatedEntityType?: string,
  relatedEntityId?: string,
) {
  const members = await prisma.projectMember.findMany({
    where: { brandProjectId: projectId },
    select: { userId: true },
  });
  if (members.length === 0) return;
  await prisma.notification.createMany({
    data: members.map((m) => ({
      userId: m.userId,
      title,
      message,
      type,
      relatedEntityType,
      relatedEntityId,
    })),
  });
}
