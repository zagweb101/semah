import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Sparkles } from "lucide-react";
import { StrategyGenerator } from "@/components/strategy-generator";
import { getMockMode } from "@/lib/ai/utils";
import type { BrandStrategyOutput } from "@/lib/ai/schemas/brand-strategy-output";

export const metadata = { title: "استراتيجية العلامة" };
export const dynamic = "force-dynamic";

export default async function StrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, nameEn: true, organizationId: true, status: true, brief: { select: { status: true } } } });
  if (!project) notFound();
  const strategy = await prisma.brandStrategy.findFirst({ where: { brandProjectId: project.id, isCurrent: true }, orderBy: { version: "desc" }, include: { creator: { select: { name: true, image: true } } } });
  const mockMode = getMockMode();
  const strategyData = strategy?.data as BrandStrategyOutput | null;
  const briefReady = project.brief?.status === "COMPLETED" || project.brief?.status === "DRAFT";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشروع</Link>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Sparkles className="size-4 text-violet" /><span>استراتيجية العلامة التجارية</span></div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">استراتيجية {project.nameAr}</h1>
        <p className="mt-2 text-muted-foreground">تحليل شامل لمشروعك يشمل الرؤية، الرسالة، القيم، التموضع، والشخصية.</p>
      </div>
      <div className="card-premium p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{strategy ? "إعادة توليد الاستراتيجية" : "ابدأ بتوليد الاستراتيجية"}</h2>
        {!briefReady && (<p className="text-sm text-muted-foreground mb-4">ننصح بإكمال Brand Brief أولًا لنتائج أفضل. <Link href={`/dashboard/projects/${project.id}/brief`} className="text-violet hover:underline">إكمال الـBrief</Link></p>)}
        <StrategyGenerator projectId={project.id} hasExistingStrategy={!!strategy} mockMode={mockMode} />
      </div>
      {strategyData ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>الإصدار {strategy?.version}</span><span>•</span><span>المزود: {strategy?.provider}</span><span>•</span><span>الموديل: {strategy?.model}</span>
            {strategy?.creator && (<><span>•</span><span>بواسطة {strategy.creator.name}</span></>)}
            {mockMode && (<><span>•</span><span className="text-gold font-medium">بيانات تجريبية</span></>)}
          </div>
          <Section title="ملخص تنفيذي"><p className="leading-relaxed">{strategyData.executiveSummary}</p></Section>
          <Section title="قصة العلامة"><p className="leading-relaxed">{strategyData.brandStory}</p></Section>
          <div className="grid gap-6 md:grid-cols-2">
            <Section title="الرؤية"><p className="leading-relaxed">{strategyData.vision}</p></Section>
            <Section title="الرسالة"><p className="leading-relaxed">{strategyData.mission}</p></Section>
          </div>
          <Section title="وعد العلامة"><p className="leading-relaxed text-lg">{strategyData.brandPromise}</p></Section>
          <Section title="القيم الجوهرية"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{strategyData.coreValues.map((v, i) => (<div key={i} className="rounded-lg border border-border bg-muted/50 p-4 text-sm">{v}</div>))}</div></Section>
          <Section title="تموضع العلامة"><p className="leading-relaxed">{strategyData.positioningStatement}</p></Section>
          <Section title="القيمة الفريدة"><p className="leading-relaxed">{strategyData.uniqueValueProposition}</p></Section>
          <Section title="عوامل التمايز"><ul className="space-y-2">{strategyData.differentiators.map((d, i) => (<li key={i} className="flex items-start gap-2"><span className="size-1.5 rounded-full bg-violet mt-2 flex-shrink-0" /><span>{d}</span></li>))}</ul></Section>
          <div className="grid gap-6 md:grid-cols-2">
            <Section title="الجمهور الأساسي"><p className="leading-relaxed">{strategyData.targetAudience.primary}</p></Section>
            {strategyData.targetAudience.secondary && <Section title="الجمهور الثانوي"><p className="leading-relaxed">{strategyData.targetAudience.secondary}</p></Section>}
          </div>
          <Section title="شخصيات العملاء"><div className="grid gap-4 sm:grid-cols-2">{strategyData.customerPersonas.map((persona, i) => (<div key={i} className="rounded-lg border border-border p-4"><div className="font-medium mb-2">{persona.name}</div><div className="text-sm text-muted-foreground mb-3">{persona.age} سنة · {persona.occupation}</div><div className="space-y-2 text-sm"><div><div className="text-xs font-medium text-muted-foreground">نقاط الألم</div><ul className="mt-1 space-y-1">{persona.painPoints.map((p, j) => (<li key={j} className="text-muted-foreground">• {p}</li>))}</ul></div><div><div className="text-xs font-medium text-muted-foreground">الأهداف</div><ul className="mt-1 space-y-1">{persona.goals.map((g, j) => (<li key={j} className="text-muted-foreground">• {g}</li>))}</ul></div></div></div>))}</div></Section>
          <Section title="نبرة الصوت"><div className="space-y-2"><div><span className="text-sm font-medium">الأساسية:</span> <span className="text-muted-foreground">{strategyData.toneOfVoice.primary}</span></div>{strategyData.toneOfVoice.secondary && <div><span className="text-sm font-medium">الثانوية:</span> <span className="text-muted-foreground">{strategyData.toneOfVoice.secondary}</span></div>}{strategyData.toneOfVoice.avoid && <div><span className="text-sm font-medium">تجنّب:</span> <span className="text-muted-foreground">{strategyData.toneOfVoice.avoid}</span></div>}</div></Section>
          <Section title="مبادئ التواصل"><ul className="space-y-2">{strategyData.communicationPrinciples.map((p, i) => (<li key={i} className="flex items-start gap-2"><span className="size-1.5 rounded-full bg-coral mt-2 flex-shrink-0" /><span>{p}</span></li>))}</ul></Section>
          <Section title="كلمات العلامة المفتاحية"><div className="flex flex-wrap gap-2">{strategyData.brandKeywords.map((k, i) => (<span key={i} className="px-3 py-1 rounded-full bg-violet/10 text-violet text-sm font-medium">{k}</span>))}</div></Section>
          <Section title="شعارات تسويقية مقترحة"><div className="space-y-3">{strategyData.suggestedTaglines.map((t, i) => (<div key={i} className="rounded-lg border border-border bg-muted/30 p-4 text-center text-lg font-medium">{t}</div>))}</div></Section>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-4"><Sparkles className="size-8 text-violet" /></div>
          <h3 className="text-xl font-semibold mb-2">لا توجد استراتيجية بعد</h3>
          <p className="text-muted-foreground max-w-md mx-auto">اضغط على «توليد الاستراتيجية» أعلاه لبدء تحليل مشروعك بالذكاء الاصطناعي.</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card-premium p-6"><h2 className="text-xl font-semibold mb-4">{title}</h2>{children}</section>;
}
