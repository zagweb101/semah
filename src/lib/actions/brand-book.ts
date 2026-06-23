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
import { advanceProjectStatus } from "@/lib/projects/status";

const BrandSheetSchema = z.object({
  template: z.enum(["DEFAULT", "MINIMAL", "EDITORIAL"]).default("DEFAULT"),
  fields: z.object({
    logo: z.string(), primaryColor: z.string(), secondaryColor: z.string(),
    accentColor: z.string(), arabicFont: z.string(), englishFont: z.string(),
    personality: z.array(z.string()), keywords: z.array(z.string()),
    imageStyle: z.string(), usageExamples: z.array(z.string()),
  }),
});
type BrandSheetOutput = z.infer<typeof BrandSheetSchema>;

const BrandBookSchema = z.object({
  layout: z.enum(["CLASSIC", "MODERN", "EDITORIAL"]).default("CLASSIC"),
  sections: z.array(z.object({
    type: z.string(), title: z.string(),
    content: z.record(z.string(), z.any()), hidden: z.boolean().default(false),
  })),
});

const sheetPrompt = { name: "brand-sheet", version: "1.0.0", buildSystem: () => `أنت خبير هوية مؤسسية. ولّد Brand Sheet. أعد JSON يطابق الـschema.`, buildUser: (brief: BrandBriefInput) => `Brand: ${brief.nameAr}\nDescription: ${brief.description}\nSector: ${brief.sector}` };
const brandBookPrompt = { name: "brand-book", version: "1.0.0", buildSystem: () => `أنت خبير Brand Book. ولّد دليل علامة كامل بـ25 قسم. أعد JSON يطابق الـschema.`, buildUser: (brief: BrandBriefInput) => `Brand: ${brief.nameAr}\nDescription: ${brief.description}\nSector: ${brief.sector}` };

export async function generateBrandSheetAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, include: { brief: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.BRAND_BOOK_GENERATE, { organizationId: project.organizationId, projectId: project.id });
  const briefData = (project.brief?.data as Partial<BrandBriefInput>) ?? {};
  const brief: BrandBriefInput = { nameAr: briefData.nameAr ?? project.nameAr, nameEn: briefData.nameEn ?? project.nameEn ?? undefined, description: briefData.description ?? project.nameAr, sector: briefData.sector ?? "غير محدد", ...briefData };
  const cost = getCreditCost("BRAND_SHEET");
  const idempotencyKey = `sheet:${project.id}:${Date.now()}`;
  const reservation = await reserveCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "BRAND_SHEET", idempotencyKey, amount: cost });
  if (!reservation.success) return { error: reservation.reason === "Insufficient balance" ? "رصيد غير كافٍ" : reservation.reason ?? "فشل" };
  const provider = getTextProvider();
  const isMock = getMockMode();
  try {
    const result = await provider.generateStructuredData<BrandSheetOutput>({
      systemPrompt: sheetPrompt.buildSystem(), userPrompt: sheetPrompt.buildUser(brief),
      outputSchema: BrandSheetSchema, temperature: 0.5, locale: "ar",
      metadata: { generationType: "BRAND_SHEET", promptVersion: sheetPrompt.version, projectName: brief.nameAr, mock: isMock },
    });
    await prisma.brandSheet.deleteMany({ where: { brandProjectId: project.id } });
    const sheet = await prisma.brandSheet.create({ data: { brandProjectId: project.id, template: result.structuredData.template, data: result.structuredData as never, version: 1, isCurrent: true } });
    await captureCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "BRAND_SHEET", idempotencyKey: `${idempotencyKey}:capture`, reservedAmount: cost, actualAmount: cost });
    await recordUsage({ organizationId: project.organizationId, userId: session.user.id, generationType: "BRAND_SHEET", provider: result.provider, model: result.model, tokensIn: result.tokensIn, tokensOut: result.tokensOut, imagesGenerated: 0, costEstimate: 0 });
    await prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "SHEET_CREATED", metadata: { mock: isMock } } });
    await advanceProjectStatus(project.id, "BRAND_SHEET");
    revalidatePath(`/dashboard/projects/${project.id}/sheet`);
    return { success: true, sheetId: sheet.id, mock: isMock };
  } catch (error) {
    await refundCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "BRAND_SHEET", idempotencyKey: `${idempotencyKey}:refund`, reservedAmount: cost, reason: "Refund" });
    return { error: safeErrorMessage(error) };
  }
}

export async function getBrandSheetAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await assertCan(ProjectPermissions.BRAND_BOOK_VIEW, { projectId });
  return prisma.brandSheet.findUnique({ where: { brandProjectId: projectId } });
}

export async function generateBrandBookAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, include: { brief: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.BRAND_BOOK_GENERATE, { organizationId: project.organizationId, projectId: project.id });
  const briefData = (project.brief?.data as Partial<BrandBriefInput>) ?? {};
  const brief: BrandBriefInput = { nameAr: briefData.nameAr ?? project.nameAr, nameEn: briefData.nameEn ?? project.nameEn ?? undefined, description: briefData.description ?? project.nameAr, sector: briefData.sector ?? "غير محدد", ...briefData };
  const cost = getCreditCost("BRAND_BOOK");
  const idempotencyKey = `book:${project.id}:${Date.now()}`;
  const reservation = await reserveCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "BRAND_BOOK", idempotencyKey, amount: cost });
  if (!reservation.success) return { error: reservation.reason === "Insufficient balance" ? "رصيد غير كافٍ" : reservation.reason ?? "فشل" };
  const provider = getTextProvider();
  const isMock = getMockMode();
  try {
    const result = await provider.generateStructuredData<z.infer<typeof BrandBookSchema>>({
      systemPrompt: brandBookPrompt.buildSystem(), userPrompt: brandBookPrompt.buildUser(brief),
      outputSchema: BrandBookSchema, temperature: 0.6, locale: "ar",
      metadata: { generationType: "BRAND_BOOK", promptVersion: brandBookPrompt.version, projectName: brief.nameAr, mock: isMock },
    });
    await prisma.brandBook.updateMany({ where: { brandProjectId: project.id, isCurrent: true }, data: { isCurrent: false } });
    const prev = await prisma.brandBook.aggregate({ where: { brandProjectId: project.id }, _max: { version: true } });
    const newVersion = (prev._max.version ?? 0) + 1;
    const book = await prisma.brandBook.create({ data: { brandProjectId: project.id, version: newVersion, isCurrent: true, layout: result.structuredData.layout as never, sections: { create: result.structuredData.sections.map((s, i) => ({ order: i + 1, type: s.type as never, title: s.title, content: s.content as never, hidden: s.hidden ?? false })) } } });
    await captureCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "BRAND_BOOK", idempotencyKey: `${idempotencyKey}:capture`, reservedAmount: cost, actualAmount: cost });
    await recordUsage({ organizationId: project.organizationId, userId: session.user.id, generationType: "BRAND_BOOK", provider: result.provider, model: result.model, tokensIn: result.tokensIn, tokensOut: result.tokensOut, imagesGenerated: 0, costEstimate: 0 });
    await prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "BOOK_CREATED", metadata: { version: newVersion, mock: isMock } } });
    await advanceProjectStatus(project.id, "BRAND_BOOK");
    revalidatePath(`/dashboard/projects/${project.id}/book`);
    return { success: true, bookId: book.id, mock: isMock };
  } catch (error) {
    await refundCredits({ organizationId: project.organizationId, userId: session.user.id, brandProjectId: project.id, operationType: "BRAND_BOOK", idempotencyKey: `${idempotencyKey}:refund`, reservedAmount: cost, reason: "Refund" });
    return { error: safeErrorMessage(error) };
  }
}

export async function getBrandBookAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await assertCan(ProjectPermissions.BRAND_BOOK_VIEW, { projectId });
  return prisma.brandBook.findFirst({ where: { brandProjectId: projectId, isCurrent: true }, include: { sections: { orderBy: { order: "asc" } } } });
}
