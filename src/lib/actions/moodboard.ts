"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertCan, ProjectPermissions } from "@/lib/permissions/can";
import { getImageProvider } from "@/lib/ai/providers/factory";
import { recordUsage } from "@/lib/ai/usage/tracker";
import { safeErrorMessage } from "@/lib/ai/core/errors";
import { reserveCredits, captureCredits, refundCredits } from "@/lib/credits/wallet";
import { getCreditCost } from "@/lib/credits/costs";
import { getMockMode } from "@/lib/ai/utils";
import { createHash } from "crypto";

export async function createMoodboardAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, organizationId: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.MOODBOARD_GENERATE, { organizationId: project.organizationId, projectId: project.id });
  await prisma.moodboard.updateMany({ where: { brandProjectId: project.id, isCurrent: true }, data: { isCurrent: false } });
  const prev = await prisma.moodboard.aggregate({ where: { brandProjectId: project.id }, _max: { version: true } });
  const newVersion = (prev._max.version ?? 0) + 1;
  const moodboard = await prisma.moodboard.create({ data: { brandProjectId: project.id, version: newVersion, isCurrent: true } });
  revalidatePath(`/dashboard/projects/${project.id}/moodboard`);
  return { success: true, moodboardId: moodboard.id };
}

export async function generateMoodboardImagesAction(projectId: string, prompts: string[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, include: { moodboards: { where: { isCurrent: true }, take: 1 } } });
  if (!project) return { error: "المشروع غير موجود" };
  if (project.moodboards.length === 0) return { error: "أنشئ Mood Board أولاً" };
  await assertCan(ProjectPermissions.MOODBOARD_GENERATE, { organizationId: project.organizationId, projectId: project.id });
  const moodboard = project.moodboards[0];
  const cost = getCreditCost("MOODBOARD_GENERATION") * prompts.length;
  const idempotencyKey = `moodboard:${moodboard.id}:${createHash("sha256").update(JSON.stringify(prompts)).digest("hex").slice(0, 16)}:${Date.now()}`;
  const reservation = await reserveCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "MOODBOARD_GENERATION", idempotencyKey, amount: cost });
  if (!reservation.success) return { error: reservation.reason === "Insufficient balance" ? "رصيد غير كافٍ" : reservation.reason ?? "فشل" };
  const provider = getImageProvider();
  const isMock = getMockMode();
  try {
    const existingCount = await prisma.moodboardItem.count({ where: { moodboardId: moodboard.id } });
    const items: Array<{ order: number; url: string; prompt: string }> = [];
    for (let i = 0; i < prompts.length; i++) {
      const result = await provider.generateImages({ prompt: prompts[i], width: 1024, height: 1024, count: 1 });
      const img = result.images[0];
      if (img) items.push({ order: existingCount + i, url: img.url, prompt: prompts[i] });
    }
    await prisma.moodboardItem.createMany({ data: items.map((it) => ({ moodboardId: moodboard.id, order: it.order, source: "GENERATED" as const, provider: provider.name, generationId: `gen-${Date.now()}-${it.order}`, externalUrl: it.url, caption: it.prompt, width: 1024, height: 1024 })) });
    await captureCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "MOODBOARD_GENERATION", idempotencyKey: `${idempotencyKey}:capture`, reservedAmount: cost, actualAmount: cost });
    await recordUsage({ organizationId: project.organizationId, userId: session.user.id, generationType: "MOODBOARD_GENERATION", provider: provider.name, model: "mock-image-v1", tokensIn: 0, tokensOut: 0, imagesGenerated: items.length, costEstimate: 0 });
    await prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "MOODBOARD_UPDATED", metadata: { count: items.length, mock: isMock } } });
    revalidatePath(`/dashboard/projects/${project.id}/moodboard`);
    return { success: true, count: items.length, mock: isMock };
  } catch (error) {
    await refundCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "MOODBOARD_GENERATION", idempotencyKey: `${idempotencyKey}:refund`, reservedAmount: cost, reason: "Refund" });
    return { error: safeErrorMessage(error) };
  }
}

export async function deleteMoodboardItemAction(projectId: string, itemId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await assertCan(ProjectPermissions.MOODBOARD_UPDATE, { projectId });
  await prisma.moodboardItem.delete({ where: { id: itemId } });
  revalidatePath(`/dashboard/projects/${projectId}/moodboard`);
  return { success: true };
}
