import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Palette } from "lucide-react";
import { ColorPaletteGenerator, CopyableHex } from "@/components/color-palette-generator";
import { getMockMode } from "@/lib/ai/utils";

export const metadata = { title: "لوحة الألوان" };
export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = { PRIMARY: "أساسي", SECONDARY: "ثانوي", ACCENT: "تمييز", BACKGROUND: "خلفية", SURFACE: "بطاقات", TEXT_PRIMARY: "نص أساسي", TEXT_SECONDARY: "نص ثانوي", MUTED: "خافت", BORDER: "حدود", SUCCESS: "نجاح", WARNING: "تحذير", ERROR: "خطأ" };
const ACC_LABELS: Record<string, { label: string; color: string }> = { AAA_PASS: { label: "AAA", color: "bg-success/10 text-success" }, AA_PASS: { label: "AA", color: "bg-success/10 text-success" }, AA_FAIL: { label: "Below AA", color: "bg-danger/10 text-danger" } };

export default async function ColorsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true } });
  if (!project) notFound();
  const palette = await prisma.colorPalette.findFirst({ where: { brandProjectId: project.id, isCurrent: true }, include: { swatches: true } });
  const mockMode = getMockMode();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشروع</Link>
      <div className="mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Palette className="size-4 text-violet" /><span>لوحة الألوان</span></div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">ألوان {project.nameAr}</h1><p className="mt-2 text-muted-foreground">11 لونًا متكاملًا مع فحص WCAG للتباين.</p></div>
      <div className="card-premium p-6 mb-8"><ColorPaletteGenerator projectId={project.id} hasExisting={!!palette} mockMode={mockMode} /></div>
      {palette && palette.swatches.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {palette.swatches.map((sw) => {
              const acc = sw.accessibility ? ACC_LABELS[sw.accessibility] : null;
              return (
                <div key={sw.id} className="card-premium overflow-hidden">
                  <div className="h-24 flex items-end p-3" style={{ backgroundColor: sw.hex, color: sw.suggestedForeground ?? "#fff" }}><div className="text-xs font-medium opacity-90">{ROLE_LABELS[sw.role] ?? sw.role}</div></div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between"><div><div className="font-medium">{sw.name}</div><CopyableHex hex={sw.hex} /></div>{acc && <span className={`text-xs px-2 py-1 rounded-full ${acc.color}`}>{acc.label}</span>}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground"><div>RGB: <span className="font-mono">{sw.rgb}</span></div><div>HSL: <span className="font-mono">{sw.hsl}</span></div></div>
                    {sw.usage && <p className="text-xs text-muted-foreground pt-2 border-t border-border">{sw.usage}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          {palette && <div className="card-premium p-6"><h2 className="text-lg font-semibold mb-3">تصدير</h2><div className="grid gap-3 sm:grid-cols-3"><ExportButton label="JSON" url={`/api/projects/${project.id}/colors/${palette.id}/export?type=json`} /><ExportButton label="CSS Variables" url={`/api/projects/${project.id}/colors/${palette.id}/export?type=css`} /><ExportButton label="Tailwind" url={`/api/projects/${project.id}/colors/${palette.id}/export?type=tailwind`} /></div></div>}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center"><div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-4"><Palette className="size-8 text-violet" /></div><h3 className="text-xl font-semibold mb-2">لا توجد لوحة بعد</h3><p className="text-muted-foreground max-w-md mx-auto">اضغط على «توليد لوحة الألوان» أعلاه.</p></div>
      )}
    </div>
  );
}

function ExportButton({ label, url }: { label: string; url: string }) {
  return <a href={url} download className="block text-center px-4 py-2 rounded-lg border border-border hover:border-violet hover:bg-violet/5 transition-colors text-sm font-medium">{label}</a>;
}
