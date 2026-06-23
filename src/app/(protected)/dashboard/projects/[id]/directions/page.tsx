import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Layers, Sparkles } from "lucide-react";
import { DirectionsGenerator, DirectionSelector } from "@/components/directions-generator";
import { getMockMode } from "@/lib/ai/utils";
import type { VisualDirectionOutput } from "@/lib/ai/schemas/visual-direction-output";

export const metadata = { title: "الاتجاهات المؤسسية" };
export const dynamic = "force-dynamic";

export default async function DirectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true } });
  if (!project) notFound();
  const directions = await prisma.visualDirection.findMany({ where: { brandProjectId: project.id, isCurrent: true }, orderBy: { createdAt: "asc" } });
  const mockMode = getMockMode();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشروع</Link>
      <div className="mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Layers className="size-4 text-violet" /><span>الاتجاهات المؤسسية</span></div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">اتجاهات {project.nameAr}</h1><p className="mt-2 text-muted-foreground">ثلاثة اتجاهات مؤسسية متمايزة لاختيار الأنسب.</p></div>
      <div className="card-premium p-6 mb-8"><DirectionsGenerator projectId={project.id} hasExisting={directions.length > 0} mockMode={mockMode} /></div>
      {directions.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {directions.map((d, idx) => {
            const data = d.data as VisualDirectionOutput["directions"][number];
            const isSelected = d.status === "SELECTED";
            return (
              <article key={d.id} className={`card-premium p-6 flex flex-col ${isSelected ? "ring-2 ring-success" : ""}`}>
                <div className="flex items-center justify-between mb-3"><div className="size-10 rounded-xl bg-gradient-to-br from-violet/20 to-coral/10 flex items-center justify-center font-bold text-violet">{idx + 1}</div><DirectionSelector projectId={project.id} directionId={d.id} isSelected={isSelected} /></div>
                <h2 className="text-xl font-bold mb-1">{data.name}</h2>
                <p className="text-sm text-violet font-medium mb-3">{data.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{data.coreIdea}</p>
                <div className="space-y-3 text-sm flex-1">
                  <div><div className="text-xs font-medium text-muted-foreground mb-1">المشاعر</div><div className="flex flex-wrap gap-1">{data.targetEmotions.map((e, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-coral/10 text-coral text-xs">{e}</span>)}</div></div>
                  <div><div className="text-xs font-medium text-muted-foreground mb-1">الكلمات المفتاحية</div><div className="flex flex-wrap gap-1">{data.keywords.map((k, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{k}</span>)}</div></div>
                  <div className="grid grid-cols-2 gap-2 text-xs"><div><div className="text-muted-foreground">الألوان</div><div className="font-medium">{data.colorStyle.slice(0, 60)}</div></div><div><div className="text-muted-foreground">الخطوط</div><div className="font-medium">{data.typographyStyle.slice(0, 60)}</div></div></div>
                  <div><div className="text-xs font-medium text-muted-foreground mb-1">أفكار الشعار</div><ul className="space-y-1">{data.logoIdeas.map((l, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1"><Sparkles className="size-2.5 text-violet mt-0.5 flex-shrink-0" />{l}</li>)}</ul></div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center"><div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-4"><Layers className="size-8 text-violet" /></div><h3 className="text-xl font-semibold mb-2">لا توجد اتجاهات بعد</h3><p className="text-muted-foreground max-w-md mx-auto">اضغط على «توليد الاتجاهات المؤسسية» أعلاه.</p></div>
      )}
    </div>
  );
}
