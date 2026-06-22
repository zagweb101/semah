"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertCan, ProjectPermissions } from "@/lib/permissions/can";
import { getTextProvider } from "@/lib/ai/providers/factory";
import { recordUsage } from "@/lib/ai/usage/tracker";
import { safeErrorMessage } from "@/lib/ai/core/errors";
import { reserveCredits, captureCredits, refundCredits } from "@/lib/credits/wallet";
import { getCreditCost } from "@/lib/credits/costs";
import { getMockMode } from "@/lib/ai/utils";
import { z } from "zod";
import type { BrandBriefInput } from "@/lib/ai/schemas/brand-brief-input";
import { createHash } from "crypto";

const TypographyOutputSchema = z.object({
  arabicDisplayFont: z.object({ family: z.string(), weights: z.array(z.number()), fallback: z.string() }),
  arabicHeadingFont: z.object({ family: z.string(), weights: z.array(z.number()), fallback: z.string() }),
  arabicBodyFont: z.object({ family: z.string(), weights: z.array(z.number()), fallback: z.string() }),
  englishDisplayFont: z.object({ family: z.string(), weights: z.array(z.number()), fallback: z.string() }),
  englishHeadingFont: z.object({ family: z.string(), weights: z.array(z.number()), fallback: z.string() }),
  englishBodyFont: z.object({ family: z.string(), weights: z.array(z.number()), fallback: z.string() }),
  fallbacks: z.array(z.string()),
  styles: z.array(z.object({
    name: z.enum(["DISPLAY", "HEADING", "BODY", "CAPTION", "BUTTON"]),
    fontFamily: z.string(), fontWeight: z.number(), fontSize: z.string(),
    lineHeight: z.string(), letterSpacing: z.string().optional(), paragraphSpacing: z.string().optional(),
  })),
  previewTexts: z.object({ arabic: z.string(), english: z.string(), arabicBody: z.string() }),
});
type TypographyOutput = z.infer<typeof TypographyOutputSchema>;

const typographyPrompt = {
  name: "typography", version: "1.0.0",
  buildSystem: () => `أنت خبير خطوط يعمل باللغة العربية. ولّد نظام خطوط متكامل. أعد JSON يطابق الـschema. اذكر 5 أنماط: DISPLAY, HEADING, BODY, CAPTION, BUTTON.`,
  buildUser: (brief: BrandBriefInput) => `Brand: ${brief.nameAr}\nDescription: ${brief.description}\nSector: ${brief.sector}`,
};

export async function generateTypographyAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, include: { brief: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.TYPOGRAPHY_GENERATE, { organizationId: project.organizationId, projectId: project.id });
  const briefData = (project.brief?.data as Partial<BrandBriefInput>) ?? {};
  const brief: BrandBriefInput = { nameAr: briefData.nameAr ?? project.nameAr, nameEn: briefData.nameEn ?? project.nameEn ?? undefined, description: briefData.description ?? project.nameAr, sector: briefData.sector ?? "غير محدد", ...briefData };
  const cost = getCreditCost("TYPOGRAPHY_SYSTEM");
  const idempotencyKey = `typography:${project.id}:${createHash("sha256").update(JSON.stringify(brief)).digest("hex").slice(0, 16)}:${Date.now()}`;
  const reservation = await reserveCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "TYPOGRAPHY_SYSTEM", idempotencyKey, amount: cost });
  if (!reservation.success) return { error: reservation.reason === "Insufficient balance" ? "رصيد غير كافٍ" : reservation.reason ?? "فشل" };
  const provider = getTextProvider();
  const isMock = getMockMode();
  try {
    const result = await provider.generateStructuredData<TypographyOutput>({
      systemPrompt: typographyPrompt.buildSystem(), userPrompt: typographyPrompt.buildUser(brief),
      outputSchema: TypographyOutputSchema, temperature: 0.6, locale: "ar",
      metadata: { generationType: "TYPOGRAPHY_SYSTEM", promptVersion: typographyPrompt.version, projectName: brief.nameAr, mock: isMock },
    });
    await prisma.typographySystem.updateMany({ where: { brandProjectId: project.id, isCurrent: true }, data: { isCurrent: false } });
    const prev = await prisma.typographySystem.aggregate({ where: { brandProjectId: project.id }, _max: { version: true } });
    const newVersion = (prev._max.version ?? 0) + 1;
    await prisma.typographySystem.create({ data: { brandProjectId: project.id, version: newVersion, isCurrent: true, data: result.structuredData as never, styles: { create: result.structuredData.styles.map((s) => ({ ...s, name: s.name })) } } });
    await captureCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "TYPOGRAPHY_SYSTEM", idempotencyKey: `${idempotencyKey}:capture`, reservedAmount: cost, actualAmount: cost });
    await recordUsage({ organizationId: project.organizationId, userId: session.user.id, generationType: "TYPOGRAPHY_SYSTEM", provider: result.provider, model: result.model, tokensIn: result.tokensIn, tokensOut: result.tokensOut, imagesGenerated: 0, costEstimate: 0 });
    await prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "TYPOGRAPHY_GENERATED", metadata: { version: newVersion, mock: isMock } } });
    revalidatePath(`/dashboard/projects/${project.id}/typography`);
    return { success: true, version: newVersion, mock: isMock };
  } catch (error) {
    await refundCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "TYPOGRAPHY_SYSTEM", idempotencyKey: `${idempotencyKey}:refund`, reservedAmount: cost, reason: "Refund" });
    return { error: safeErrorMessage(error) };
  }
}
