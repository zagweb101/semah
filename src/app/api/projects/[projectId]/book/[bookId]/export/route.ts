import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { can, ProjectPermissions } from "@/lib/permissions/can";
import { generateBrandBookPdf } from "@/lib/exports/pdf";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string; bookId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, bookId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, nameEn: true, organizationId: true } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const allowed = await can(ProjectPermissions.BRAND_BOOK_EXPORT, { organizationId: project.organizationId, projectId: project.id });
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const book = await prisma.brandBook.findFirst({ where: { id: bookId, brandProjectId: projectId, isCurrent: true }, include: { sections: { orderBy: { order: "asc" } } } });
  if (!book) return NextResponse.json({ error: "Brand book not found" }, { status: 404 });
  const palette = await prisma.colorPalette.findFirst({ where: { brandProjectId: projectId, isCurrent: true }, include: { swatches: true } });
  const colors: Record<string, string> = {};
  if (palette) for (const sw of palette.swatches) { if (sw.role === "PRIMARY") colors.primary = sw.hex; if (sw.role === "SECONDARY") colors.secondary = sw.hex; if (sw.role === "ACCENT") colors.accent = sw.hex; }
  try {
    const pdfBuffer = await generateBrandBookPdf({ projectName: project.nameAr, projectNameEn: project.nameEn ?? undefined, layout: book.layout, sections: book.sections.map((s) => ({ type: s.type, title: s.title, content: s.content as Record<string, unknown>, hidden: s.hidden, order: s.order })), colors });
    await prisma.export.create({ data: { organizationId: project.organizationId, brandProjectId: project.id, userId: session.user.id, type: "BRAND_BOOK_PDF", status: "COMPLETED", version: book.version, metadata: { bookId: book.id } as never, completedAt: new Date() } });
    return new NextResponse(new Uint8Array(pdfBuffer), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="brand-book.pdf"`, "Content-Length": String(pdfBuffer.length), "Cache-Control": "private, no-cache" } });
  } catch (error) {
    return NextResponse.json({ error: "PDF generation failed", details: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
