import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, BookOpen } from "lucide-react";
import { BrandAssetGenerator } from "@/components/brand-asset-generator";
import { generateBrandBookAction, getBrandBookAction } from "@/lib/actions/brand-book";
import { getMockMode } from "@/lib/ai/utils";

export const metadata = { title: "Brand Book" };
export const dynamic = "force-dynamic";

const SECTION_LABELS: Record<string, string> = { COVER: "الغلاف", ABOUT: "نبذة", STORY: "قصة العلامة", VISION: "الرؤية", MISSION: "الرسالة", VALUES: "القيم", AUDIENCE: "الجمهور", PERSONALITY: "الشخصية", POSITIONING: "التموضع", TONE: "نبرة الصوت", LOGO: "الشعار", LOGO_VARIATIONS: "نسخ الشعار", SAFE_AREA: "المساحة الآمنة", MIN_SIZE: "الحد الأدنى للحجم", CORRECT_USE: "الاستخدام الصحيح", WRONG_USE: "الاستخدام الخاطئ", COLORS: "الألوان", TYPOGRAPHY: "الخطوط", MOODBOARD: "Mood Board", IMAGE_STYLE: "أسلوب الصور", PATTERNS: "الأنماط", ICONS: "الأيقونات", APPLICATIONS: "تطبيقات الهوية", DESIGN_TOKENS: "Design Tokens", CONTACT: "التواصل" };

export default async function BrandBookPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true } });
  if (!project) notFound();
  const book = await getBrandBookAction(project.id);
  const mockMode = getMockMode();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشروع</Link>
      <div className="mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><BookOpen className="size-4 text-violet" /><span>Brand Book</span></div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Brand Book — {project.nameAr}</h1><p className="mt-2 text-muted-foreground">دليل العلامة الكامل (25 قسم).</p></div>
      <div className="card-premium p-6 mb-8"><BrandAssetGenerator projectId={project.id} hasExisting={!!book} mockMode={mockMode} cost={5} label="توليد Brand Book" generateAction={generateBrandBookAction} /></div>
      {book && book.sections.length > 0 ? (
        <div className="space-y-4">
          <div className="card-premium p-12 text-center bg-gradient-to-br from-violet/10 via-card to-coral/5"><h1 className="text-5xl font-bold mb-2">{project.nameAr}</h1><p className="text-muted-foreground">دليل العلامة التجارية</p><p className="text-xs text-muted-foreground mt-4">الإصدار {book.version}</p></div>
          {book.sections.filter((s) => !s.hidden).map((section, idx) => {
            const content = section.content as Record<string, unknown>;
            return (
              <section key={section.id} className="card-premium p-6">
                <div className="flex items-center gap-2 mb-3"><span className="text-xs text-muted-foreground font-mono">{String(idx + 1).padStart(2, "0")}</span><h2 className="text-xl font-semibold">{SECTION_LABELS[section.type] ?? section.title}</h2></div>
                <SectionContent type={section.type} content={content} />
              </section>
            );
          })}
          <div className="card-premium p-6 mt-8 text-center"><a href={`/api/projects/${project.id}/book/${book.id}/export`} download className="inline-block px-6 py-2.5 rounded-lg bg-violet text-white font-medium hover:bg-violet-dark transition-colors">تصدير PDF</a><p className="text-xs text-muted-foreground mt-2">يدعم العربية RTL</p></div>
        </div>
      ) : <div className="rounded-2xl border border-dashed border-border p-12 text-center"><div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-4"><BookOpen className="size-8 text-violet" /></div><h3 className="text-xl font-semibold mb-2">لا يوجد Brand Book بعد</h3><p className="text-muted-foreground max-w-md mx-auto">اضغط على «توليد Brand Book» أعلاه.</p></div>}
    </div>
  );
}

function SectionContent({ type, content }: { type: string; content: Record<string, unknown> }) {
  if (!content) return null;
  if (["VISION", "MISSION", "POSITIONING", "STORY", "ABOUT", "IMAGE_STYLE", "TONE"].includes(type)) return <p className="leading-relaxed text-muted-foreground">{content.body as string}</p>;
  if (["VALUES", "PERSONALITY"].includes(type)) { const items = (content.values as string[] | undefined) ?? (content.traits as string[] | undefined) ?? []; return <div className="flex flex-wrap gap-2">{items.map((v, i) => <span key={i} className="px-3 py-1 rounded-full bg-violet/10 text-violet text-sm">{v}</span>)}</div>; }
  if (type === "COLORS") return <div className="grid grid-cols-3 gap-3">{["primary", "secondary", "accent"].map((k) => { const color = content[k] as string | undefined; return color ? <div key={k} className="text-center"><div className="h-14 rounded-lg mb-1" style={{ backgroundColor: color }} /><div className="text-xs font-mono">{color}</div></div> : null; })}</div>;
  if (type === "TYPOGRAPHY") return <div className="grid sm:grid-cols-2 gap-3 text-sm">{(content.arabic as string | undefined) && <div><strong>عربي:</strong> {content.arabic as string}</div>}{(content.english as string | undefined) && <div><strong>إنجليزي:</strong> {content.english as string}</div>}</div>;
  if (["WRONG_USE", "CORRECT_USE", "APPLICATIONS", "LOGO_VARIATIONS"].includes(type)) { const items = (content.examples as string[] | undefined) ?? []; return <ul className="space-y-1 text-sm text-muted-foreground">{items.map((e, i) => <li key={i} className="flex items-start gap-2"><span className={`size-1.5 rounded-full mt-2 ${type === "WRONG_USE" ? "bg-danger" : "bg-success"}`} />{e}</li>)}</ul>; }
  return <pre className="text-xs text-muted-foreground bg-muted/30 rounded p-3 overflow-x-auto">{JSON.stringify(content, null, 2)}</pre>;
}
