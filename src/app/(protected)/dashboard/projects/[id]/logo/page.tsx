import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Sparkles } from "lucide-react";
import { LogoGenerator } from "@/components/logo-generator";
import { getMockMode } from "@/lib/ai/utils";

export const metadata = { title: "مفاهيم الشعار" };
export const dynamic = "force-dynamic";

export default async function LogoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true } });
  if (!project) notFound();
  const concepts = await prisma.logoConcept.findMany({ where: { brandProjectId: project.id }, orderBy: [{ version: "desc" }, { createdAt: "asc" }], take: 3 });
  const mockMode = getMockMode();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشروع</Link>
      <div className="mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Sparkles className="size-4 text-violet" /><span>مفاهيم الشعار</span></div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">شعار {project.nameAr}</h1><p className="mt-2 text-muted-foreground">ثلاثة مفاهيم شعار متمايزة.</p></div>
      <div className="card-premium p-6 mb-8"><LogoGenerator projectId={project.id} hasExisting={concepts.length > 0} mockMode={mockMode} /></div>
      {concepts.length > 0 ? (
        <div className="space-y-6">
          {concepts.map((c, idx) => (
            <article key={c.id} className="card-premium p-6">
              <div className="flex items-start gap-4 mb-4"><div className="size-12 rounded-xl bg-gradient-to-br from-violet/20 to-coral/10 flex items-center justify-center font-bold text-violet flex-shrink-0">{idx + 1}</div><div className="flex-1"><h2 className="text-xl font-bold">{c.name}</h2></div></div>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground leading-relaxed">{c.rationale}</p>
                {c.symbolMeaning && <div><div className="text-xs font-medium mb-1">معنى الرمز</div><p className="text-muted-foreground">{c.symbolMeaning}</p></div>}
                <div className="grid sm:grid-cols-2 gap-3">{c.typographyDirection && <div><div className="text-xs font-medium mb-1">اتجاه الخط</div><p className="text-muted-foreground">{c.typographyDirection}</p></div>}{c.colorDirection && <div><div className="text-xs font-medium mb-1">اتجاه الألوان</div><p className="text-muted-foreground">{c.colorDirection}</p></div>}</div>
                <div className="rounded-xl border border-dashed border-border aspect-video flex items-center justify-center bg-muted/30"><div className="text-center"><Sparkles className="size-6 text-muted-foreground mx-auto mb-2" /><p className="text-xs text-muted-foreground">معاينة مؤسسية — تتطلب توليد صورة منفصل</p></div></div>
                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 font-mono" dir="ltr">{c.prompt}</div>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="rounded-2xl border border-dashed border-border p-12 text-center"><div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-4"><Sparkles className="size-8 text-violet" /></div><h3 className="text-xl font-semibold mb-2">لا توجد مفاهيم بعد</h3><p className="text-muted-foreground max-w-md mx-auto">اضغط على «توليد مفاهيم الشعار» أعلاه.</p></div>}
    </div>
  );
}
