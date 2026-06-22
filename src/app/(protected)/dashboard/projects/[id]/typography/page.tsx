import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Type } from "lucide-react";
import { TypographyGenerator } from "@/components/typography-generator";
import { getMockMode } from "@/lib/ai/utils";

export const metadata = { title: "نظام الخطوط" };
export const dynamic = "force-dynamic";

const STYLE_LABELS: Record<string, string> = { DISPLAY: "عنوان رئيسي", HEADING: "عنوان", BODY: "نص أساسي", CAPTION: "تعليق", BUTTON: "أزرار" };

export default async function TypographyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true } });
  if (!project) notFound();
  const typo = await prisma.typographySystem.findFirst({ where: { brandProjectId: project.id, isCurrent: true }, include: { styles: true } });
  const data = typo?.data as any;
  const mockMode = getMockMode();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشروع</Link>
      <div className="mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Type className="size-4 text-violet" /><span>نظام الخطوط</span></div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">خطوط {project.nameAr}</h1><p className="mt-2 text-muted-foreground">خطوط عربية وإنجليزية متناسقة مع معاينات فعلية.</p></div>
      <div className="card-premium p-6 mb-8"><TypographyGenerator projectId={project.id} hasExisting={!!typo} mockMode={mockMode} /></div>
      {typo && data ? (
        <div className="space-y-6">
          <section className="card-premium p-6"><h2 className="text-lg font-semibold mb-4">عائلات الخطوط</h2><div className="grid gap-4 sm:grid-cols-2"><FontCard label="عربي — عنوان رئيسي" font={data.arabicDisplayFont?.family} /><FontCard label="عربي — عناوين" font={data.arabicHeadingFont?.family} /><FontCard label="عربي — نصوص" font={data.arabicBodyFont?.family} /><FontCard label="إنجليزي — عنوان رئيسي" font={data.englishDisplayFont?.family} /><FontCard label="إنجليزي — عناوين" font={data.englishHeadingFont?.family} /><FontCard label="إنجليزي — نصوص" font={data.englishBodyFont?.family} /></div></section>
          {data.previewTexts && <section className="card-premium p-6"><h2 className="text-lg font-semibold mb-4">معاينات حية</h2><div className="space-y-4"><PreviewBlock label="العنوان الرئيسي" text={data.previewTexts.arabic} style={typo.styles.find((s: any) => s.name === "DISPLAY")} /><PreviewBlock label="النص" text={data.previewTexts.arabicBody} style={typo.styles.find((s: any) => s.name === "BODY")} /></div></section>}
          <section className="card-premium p-6"><h2 className="text-lg font-semibold mb-4">مواصفات الأنماط</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-right"><th className="py-2 px-2">النمط</th><th className="py-2 px-2">الخط</th><th className="py-2 px-2">الوزن</th><th className="py-2 px-2">الحجم</th><th className="py-2 px-2">الارتفاع</th></tr></thead><tbody>{typo.styles.map((s: any) => <tr key={s.id} className="border-b border-border/50"><td className="py-2 px-2 font-medium">{STYLE_LABELS[s.name] ?? s.name}</td><td className="py-2 px-2">{s.fontFamily}</td><td className="py-2 px-2">{s.fontWeight}</td><td className="py-2 px-2 font-mono">{s.fontSize}</td><td className="py-2 px-2 font-mono">{s.lineHeight}</td></tr>)}</tbody></table></div></section>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center"><div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-4"><Type className="size-8 text-violet" /></div><h3 className="text-xl font-semibold mb-2">لا يوجد نظام خطوط بعد</h3><p className="text-muted-foreground max-w-md mx-auto">اضغط على "توليد نظام الخطوط" أعلاه.</p></div>
      )}
    </div>
  );
}

function FontCard({ label, font }: { label: string; font?: string }) { return <div className="rounded-lg border border-border p-4"><div className="text-xs text-muted-foreground mb-1">{label}</div><div className="font-medium text-lg">{font ?? "—"}</div></div>; }
function PreviewBlock({ label, text, style }: { label: string; text: string; style?: any }) { if (!style) return null; return <div className="border-r-2 border-violet pr-4"><div className="text-xs text-muted-foreground mb-1">{label}</div><div style={{ fontFamily: style.fontFamily, fontWeight: style.fontWeight, fontSize: style.fontSize, lineHeight: style.lineHeight }}>{text}</div></div>; }
