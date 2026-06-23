"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertCan, ProjectPermissions } from "@/lib/permissions/can";
import { getTextProvider } from "@/lib/ai/providers/factory";
import { colorPalettePrompt } from "@/lib/ai/prompts/color-palette";
import { recordUsage } from "@/lib/ai/usage/tracker";
import { safeErrorMessage } from "@/lib/ai/core/errors";
import { reserveCredits, captureCredits, refundCredits } from "@/lib/credits/wallet";
import { getCreditCost } from "@/lib/credits/costs";
import { getMockMode } from "@/lib/ai/utils";
import type { BrandBriefInput } from "@/lib/ai/schemas/brand-brief-input";
import type { ColorPaletteOutput, ColorSwatchOutput } from "@/lib/ai/schemas/color-palette-output";
import { advanceProjectStatus } from "@/lib/projects/status";
import { createHash } from "crypto";

export async function generateColorPaletteAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, include: { brief: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.PALETTE_GENERATE, { organizationId: project.organizationId, projectId: project.id });
  const briefData = (project.brief?.data as Partial<BrandBriefInput>) ?? {};
  const brief: BrandBriefInput = { nameAr: briefData.nameAr ?? project.nameAr, nameEn: briefData.nameEn ?? project.nameEn ?? undefined, description: briefData.description ?? project.nameAr, sector: briefData.sector ?? "غير محدد", ...briefData };
  const cost = getCreditCost("COLOR_PALETTE");
  const idempotencyKey = `palette:${project.id}:${createHash("sha256").update(JSON.stringify(brief)).digest("hex").slice(0, 16)}:${Date.now()}`;
  const reservation = await reserveCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "COLOR_PALETTE", idempotencyKey, amount: cost });
  if (!reservation.success) return { error: reservation.reason === "Insufficient balance" ? "رصيد غير كافٍ" : reservation.reason ?? "فشل" };
  const provider = getTextProvider();
  const isMock = getMockMode();
  try {
    const result = await provider.generateStructuredData<ColorPaletteOutput>({
      systemPrompt: colorPalettePrompt.buildSystem(), userPrompt: colorPalettePrompt.buildUser(brief),
      outputSchema: colorPalettePrompt.outputSchema, temperature: 0.6, locale: "ar",
      metadata: { generationType: "COLOR_PALETTE", promptVersion: colorPalettePrompt.version, projectName: brief.nameAr, mock: isMock },
    });
    await prisma.colorPalette.updateMany({ where: { brandProjectId: project.id, isCurrent: true }, data: { isCurrent: false } });
    const prev = await prisma.colorPalette.aggregate({ where: { brandProjectId: project.id }, _max: { version: true } });
    const newVersion = (prev._max.version ?? 0) + 1;
    const palette = await prisma.colorPalette.create({ data: { brandProjectId: project.id, version: newVersion, isCurrent: true, swatches: { create: result.structuredData.swatches.map((s: ColorSwatchOutput) => s) } } });
    await captureCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "COLOR_PALETTE", idempotencyKey: `${idempotencyKey}:capture`, reservedAmount: cost, actualAmount: cost });
    await recordUsage({ organizationId: project.organizationId, userId: session.user.id, generationType: "COLOR_PALETTE", provider: result.provider, model: result.model, tokensIn: result.tokensIn, tokensOut: result.tokensOut, imagesGenerated: 0, costEstimate: 0 });
    await prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "PALETTE_GENERATED", metadata: { version: newVersion, mock: isMock } } });
    await advanceProjectStatus(project.id, "COLOR_PALETTE");
    revalidatePath(`/dashboard/projects/${project.id}/colors`);
    return { success: true, version: newVersion, mock: isMock, paletteId: palette.id };
  } catch (error) {
    await refundCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "COLOR_PALETTE", idempotencyKey: `${idempotencyKey}:refund`, reservedAmount: cost, reason: "Refund" });
    return { error: safeErrorMessage(error) };
  }
}
