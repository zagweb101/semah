"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertCan, ProjectPermissions } from "@/lib/permissions/can";
import { getTextProvider } from "@/lib/ai/providers/factory";
import { visualDirectionsPrompt } from "@/lib/ai/prompts/visual-directions";
import { recordUsage } from "@/lib/ai/usage/tracker";
import { safeErrorMessage } from "@/lib/ai/core/errors";
import { reserveCredits, captureCredits, refundCredits } from "@/lib/credits/wallet";
import { getCreditCost } from "@/lib/credits/costs";
import { getMockMode } from "@/lib/ai/utils";
import type { BrandBriefInput } from "@/lib/ai/schemas/brand-brief-input";
import type { VisualDirectionOutput } from "@/lib/ai/schemas/visual-direction-output";
import { createHash } from "crypto";

export async function generateVisualDirectionsAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, include: { brief: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.VISUAL_DIRECTION_GENERATE, { organizationId: project.organizationId, projectId: project.id });
  const briefData = (project.brief?.data as Partial<BrandBriefInput>) ?? {};
  const brief: BrandBriefInput = { nameAr: briefData.nameAr ?? project.nameAr, nameEn: briefData.nameEn ?? project.nameEn ?? undefined, description: briefData.description ?? project.nameAr, sector: briefData.sector ?? "غير محدد", ...briefData };
  const cost = getCreditCost("VISUAL_DIRECTIONS");
  const idempotencyKey = `directions:${project.id}:${createHash("sha256").update(JSON.stringify(brief)).digest("hex").slice(0, 16)}:${Date.now()}`;
  const reservation = await reserveCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "VISUAL_DIRECTIONS", idempotencyKey, amount: cost });
  if (!reservation.success) return { error: reservation.reason === "Insufficient balance" ? "رصيد غير كافٍ" : reservation.reason ?? "فشل" };
  const provider = getTextProvider();
  const isMock = getMockMode();
  try {
    const result = await provider.generateStructuredData<VisualDirectionOutput>({
      systemPrompt: visualDirectionsPrompt.buildSystem(), userPrompt: visualDirectionsPrompt.buildUser(brief),
      outputSchema: visualDirectionsPrompt.outputSchema, temperature: 0.8, locale: "ar",
      metadata: { generationType: "VISUAL_DIRECTIONS", promptVersion: visualDirectionsPrompt.version, projectName: brief.nameAr, mock: isMock },
    });
    await prisma.visualDirection.updateMany({ where: { brandProjectId: project.id, isCurrent: true }, data: { isCurrent: false } });
    const prev = await prisma.visualDirection.aggregate({ where: { brandProjectId: project.id }, _max: { version: true } });
    const newVersion = (prev._max.version ?? 0) + 1;
    await prisma.visualDirection.createMany({ data: result.structuredData.directions.map((d) => ({ brandProjectId: project.id, version: newVersion, data: d as never, status: "GENERATED", promptVersion: result.promptVersion, provider: result.provider, model: result.model, isCurrent: true })) });
    await captureCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "VISUAL_DIRECTIONS", idempotencyKey: `${idempotencyKey}:capture`, reservedAmount: cost, actualAmount: cost });
    await recordUsage({ organizationId: project.organizationId, userId: session.user.id, generationType: "VISUAL_DIRECTIONS", provider: result.provider, model: result.model, tokensIn: result.tokensIn, tokensOut: result.tokensOut, imagesGenerated: 0, costEstimate: 0 });
    await prisma.$transaction([
      prisma.brandProject.update({ where: { id: project.id }, data: { status: "VISUAL_DIRECTIONS_READY" } }),
      prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "BRIEF_UPDATED", metadata: { action: "directions_generated", mock: isMock } } }),
    ]);
    revalidatePath(`/dashboard/projects/${project.id}/directions`);
    return { success: true, version: newVersion, count: result.structuredData.directions.length, mock: isMock };
  } catch (error) {
    await refundCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "VISUAL_DIRECTIONS", idempotencyKey: `${idempotencyKey}:refund`, reservedAmount: cost, reason: "Refund" });
    return { error: safeErrorMessage(error) };
  }
}

export async function selectVisualDirectionAction(projectId: string, directionId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, organizationId: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.VISUAL_DIRECTION_APPROVE, { organizationId: project.organizationId, projectId: project.id });
  await prisma.$transaction([
    prisma.visualDirection.updateMany({ where: { brandProjectId: project.id, status: "SELECTED" }, data: { status: "GENERATED" } }),
    prisma.visualDirection.update({ where: { id: directionId }, data: { status: "SELECTED" } }),
    prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "DIRECTION_SELECTED", metadata: { directionId } } }),
  ]);
  revalidatePath(`/dashboard/projects/${project.id}/directions`);
  return { success: true };
}
