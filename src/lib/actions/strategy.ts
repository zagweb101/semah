"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertCan, ProjectPermissions } from "@/lib/permissions/can";
import { getTextProvider } from "@/lib/ai/providers/factory";
import { brandStrategyPrompt } from "@/lib/ai/prompts/brand-strategy";
import { recordUsage } from "@/lib/ai/usage/tracker";
import { safeErrorMessage } from "@/lib/ai/core/errors";
import { reserveCredits, captureCredits, refundCredits } from "@/lib/credits/wallet";
import { getCreditCost } from "@/lib/credits/costs";
import { getMockMode } from "@/lib/ai/utils";
import type { BrandBriefInput } from "@/lib/ai/schemas/brand-brief-input";
import type { BrandStrategyOutput } from "@/lib/ai/schemas/brand-strategy-output";
import { createHash } from "crypto";

export async function generateBrandStrategyAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, include: { brief: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.STRATEGY_GENERATE, { organizationId: project.organizationId, projectId: project.id });
  const briefData = (project.brief?.data as Partial<BrandBriefInput>) ?? {};
  const brief: BrandBriefInput = { nameAr: briefData.nameAr ?? project.nameAr, nameEn: briefData.nameEn ?? project.nameEn ?? undefined, description: briefData.description ?? project.nameAr, sector: briefData.sector ?? "غير محدد", ...briefData };
  const cost = getCreditCost("BRAND_STRATEGY");
  const idempotencyKey = `strategy:${project.id}:${createHash("sha256").update(JSON.stringify(brief)).digest("hex").slice(0, 16)}:${Date.now()}`;
  const reservation = await reserveCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "BRAND_STRATEGY", idempotencyKey, amount: cost });
  if (!reservation.success) return { error: reservation.reason === "Insufficient balance" ? "رصيد غير كافٍ" : reservation.reason ?? "فشل" };
  await prisma.brandProject.update({ where: { id: project.id }, data: { status: "ANALYZING" } });
  const provider = getTextProvider();
  const isMock = getMockMode();
  try {
    const result = await provider.generateStructuredData<BrandStrategyOutput>({
      systemPrompt: brandStrategyPrompt.buildSystem(),
      userPrompt: brandStrategyPrompt.buildUser(brief),
      outputSchema: brandStrategyPrompt.outputSchema,
      temperature: 0.7, locale: "ar",
      metadata: { generationType: "BRAND_STRATEGY", promptVersion: brandStrategyPrompt.version, projectName: brief.nameAr, mock: isMock },
    });
    const previousVersion = await prisma.brandStrategy.findFirst({ where: { brandProjectId: project.id, isCurrent: true }, select: { version: true } });
    const newVersion = (previousVersion?.version ?? 0) + 1;
    if (previousVersion) await prisma.brandStrategy.updateMany({ where: { brandProjectId: project.id, isCurrent: true }, data: { isCurrent: false } });
    await prisma.brandStrategy.create({ data: { brandProjectId: project.id, version: newVersion, data: result.structuredData as never, promptVersion: result.promptVersion, provider: result.provider, model: result.model, createdBy: session.user.id, isCurrent: true } });
    await captureCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "BRAND_STRATEGY", idempotencyKey: `${idempotencyKey}:capture`, reservedAmount: cost, actualAmount: cost });
    await recordUsage({ organizationId: project.organizationId, userId: session.user.id, generationType: "BRAND_STRATEGY", provider: result.provider, model: result.model, tokensIn: result.tokensIn, tokensOut: result.tokensOut, imagesGenerated: 0, costEstimate: 0 });
    await prisma.$transaction([
      prisma.brandProject.update({ where: { id: project.id }, data: { status: "STRATEGY_READY" } }),
      prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "STRATEGY_GENERATED", metadata: { version: newVersion, mock: isMock } } }),
    ]);
    revalidatePath(`/dashboard/projects/${project.id}`); revalidatePath(`/dashboard/projects/${project.id}/strategy`);
    return { success: true, version: newVersion, mock: isMock };
  } catch (error) {
    await refundCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "BRAND_STRATEGY", idempotencyKey: `${idempotencyKey}:refund`, reservedAmount: cost, reason: "Refund" });
    await prisma.brandProject.update({ where: { id: project.id }, data: { status: "READY_FOR_ANALYSIS" } });
    return { error: safeErrorMessage(error) };
  }
}
