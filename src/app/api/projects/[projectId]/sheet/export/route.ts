import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { can, ProjectPermissions } from "@/lib/permissions/can";
import { generateBrandSheetPdf, type BrandSheetPdfInput } from "@/lib/exports/pdf";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const allowed = await can(ProjectPermissions.BRAND_BOOK_EXPORT, { organizationId: project.organizationId, projectId: project.id });
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sheet = await prisma.brandSheet.findUnique({ where: { brandProjectId: projectId } });
  if (!sheet) return NextResponse.json({ error: "Brand sheet not found" }, { status: 404 });
  const data = sheet.data as unknown as BrandSheetPdfInput;
  try {
    const pdfBuffer = await generateBrandSheetPdf({ projectName: project.nameAr, template: sheet.template, fields: data.fields ?? {} });
    return new NextResponse(new Uint8Array(pdfBuffer), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="brand-sheet.pdf"`, "Content-Length": String(pdfBuffer.length), "Cache-Control": "private, no-cache" } });
  } catch (error) {
    return NextResponse.json({ error: "PDF generation failed", details: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
