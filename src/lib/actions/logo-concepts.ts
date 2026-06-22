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

const LogoConceptOutputSchema = z.object({
  strategy: z.string(),
  concepts: z.array(z.object({
    name: z.string(), conceptDescription: z.string(),
    symbolMeaning: z.string().optional(), typographyDirection: z.string().optional(),
    colorDirection: z.string().optional(), composition: z.string().optional(),
    prompt: z.string(), approvalStatus: z.literal("PENDING").default("PENDING"),
  })),
  wordmarkDirections: z.array(z.string()), symbolDirections: z.array(z.string()),
  monogramIdeas: z.array(z.string()), arabicWordmarkIdeas: z.array(z.string()),
  englishWordmarkIdeas: z.array(z.string()), bilingualIdeas: z.array(z.string()),
  appIconIdeas: z.array(z.string()), faviconIdeas: z.array(z.string()),
  disclaimer: z.string(),
});
type LogoConceptOutput = z.infer<typeof LogoConceptOutputSchema>;

const logoPrompt = {
  name: "logo-concepts", version: "1.0.0",
  buildSystem: () => `أنت مصمم شعارات خبير. ولّد 3 مفاهيم شعار. أعد JSON يطابق الـschema. اذكر disclaimer واضح.`,
  buildUser: (brief: BrandBriefInput) => `Brand: ${brief.nameAr}\nDescription: ${brief.description}\nSector: ${brief.sector}`,
};

export async function generateLogoConceptsAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, include: { brief: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.LOGO_GENERATE, { organizationId: project.organizationId, projectId: project.id });
  const briefData = (project.brief?.data as Partial<BrandBriefInput>) ?? {};
  const brief: BrandBriefInput = { nameAr: briefData.nameAr ?? project.nameAr, nameEn: briefData.nameEn ?? project.nameEn ?? undefined, description: briefData.description ?? project.nameAr, sector: briefData.sector ?? "غير محدد", ...briefData };
  const cost = getCreditCost("LOGO_CONCEPTS");
  const idempotencyKey = `logo:${project.id}:${createHash("sha256").update(JSON.stringify(brief)).digest("hex").slice(0, 16)}:${Date.now()}`;
  const reservation = await reserveCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "LOGO_CONCEPTS", idempotencyKey, amount: cost });
  if (!reservation.success) return { error: reservation.reason === "Insufficient balance" ? "رصيد غير كافٍ" : reservation.reason ?? "فشل" };
  const provider = getTextProvider();
  const isMock = getMockMode();
  try {
    const result = await provider.generateStructuredData<LogoConceptOutput>({
      systemPrompt: logoPrompt.buildSystem(), userPrompt: logoPrompt.buildUser(brief),
      outputSchema: LogoConceptOutputSchema, temperature: 0.7, locale: "ar",
      metadata: { generationType: "LOGO_CONCEPTS", promptVersion: logoPrompt.version, projectName: brief.nameAr, mock: isMock },
    });
    const prev = await prisma.logoConcept.aggregate({ where: { brandProjectId: project.id }, _max: { version: true } });
    const newVersion = (prev._max.version ?? 0) + 1;
    await prisma.logoConcept.createMany({ data: result.structuredData.concepts.map((c) => ({ brandProjectId: project.id, version: newVersion, name: c.name, rationale: c.conceptDescription, symbolMeaning: c.symbolMeaning, typographyDirection: c.typographyDirection, colorDirection: c.colorDirection, composition: c.composition, prompt: c.prompt, approvalStatus: "PENDING" })) });
    await captureCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "LOGO_CONCEPTS", idempotencyKey: `${idempotencyKey}:capture`, reservedAmount: cost, actualAmount: cost });
    await recordUsage({ organizationId: project.organizationId, userId: session.user.id, generationType: "LOGO_CONCEPTS", provider: result.provider, model: result.model, tokensIn: result.tokensIn, tokensOut: result.tokensOut, imagesGenerated: 0, costEstimate: 0 });
    await prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "LOGO_GENERATED", metadata: { version: newVersion, count: result.structuredData.concepts.length, mock: isMock } } });
    revalidatePath(`/dashboard/projects/${project.id}/logo`);
    return { success: true, version: newVersion, count: result.structuredData.concepts.length, mock: isMock };
  } catch (error) {
    await refundCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "LOGO_CONCEPTS", idempotencyKey: `${idempotencyKey}:refund`, reservedAmount: cost, reason: "Refund" });
    return { error: safeErrorMessage(error) };
  }
}
