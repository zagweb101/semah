import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { can, ProjectPermissions } from "@/lib/permissions/can";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = { PRIMARY: "primary", SECONDARY: "secondary", ACCENT: "accent", BACKGROUND: "background", SURFACE: "surface", TEXT_PRIMARY: "text-primary", TEXT_SECONDARY: "text-secondary", MUTED: "muted", BORDER: "border", SUCCESS: "success", WARNING: "warning", ERROR: "error" };

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string; paletteId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, paletteId } = await params;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "json";
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const allowed = await can(ProjectPermissions.PALETTE_VIEW, { organizationId: project.organizationId, projectId: project.id });
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const palette = await prisma.colorPalette.findFirst({ where: { id: paletteId, brandProjectId: projectId, isCurrent: true }, include: { swatches: true } });
  if (!palette) return NextResponse.json({ error: "Palette not found" }, { status: 404 });
  if (type === "json") {
    const json = { meta: { brandName: project.nameAr, version: palette.version, exportedAt: new Date().toISOString() }, name: `Palette ${project.nameAr}`, swatches: palette.swatches.map((sw) => ({ role: ROLE_LABELS[sw.role] ?? sw.role.toLowerCase(), name: sw.name, hex: sw.hex, rgb: sw.rgb, hsl: sw.hsl, cmyk: sw.cmykApprox, usage: sw.usage, accessibility: sw.accessibility, suggestedForeground: sw.suggestedForeground })) };
    return new NextResponse(JSON.stringify(json, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="palette.json"` } });
  }
  if (type === "css") {
    const lines: string[] = [":root {"];
    for (const sw of palette.swatches) { const label = ROLE_LABELS[sw.role] ?? sw.role.toLowerCase(); lines.push(`  --color-${label}: ${sw.hex};`); }
    lines.push("}");
    return new NextResponse(lines.join("\n"), { headers: { "Content-Type": "text/css", "Content-Disposition": `attachment; filename="palette.css"` } });
  }
  if (type === "tailwind") {
    const tw: Record<string, string> = {};
    for (const sw of palette.swatches) { const label = ROLE_LABELS[sw.role] ?? sw.role.toLowerCase(); tw[label] = sw.hex; }
    return new NextResponse(`export const semahColors = ${JSON.stringify(tw, null, 2)};`, { headers: { "Content-Type": "text/typescript", "Content-Disposition": `attachment; filename="tailwind-theme.ts"` } });
  }
  return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
}
