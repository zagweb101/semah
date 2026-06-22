import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, BookOpen, Layers, Palette, Type, Eye, Sparkles, Share2, FileText, CheckCircle2, Clock } from "lucide-react";

export const metadata = { title: "نظرة عامة على المشروع" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = { DRAFT: "مسودة", BRIEF_IN_PROGRESS: "جاري تعبئة الـBrief", READY_FOR_ANALYSIS: "جاهز للتحليل", ANALYZING: "جاري التحليل", STRATEGY_READY: "الاستراتيجية جاهزة", VISUAL_DIRECTIONS_READY: "الاتجاهات المؤسسية جاهزة", INTERNAL_REVIEW: "مراجعة داخلية", CLIENT_REVIEW: "مراجعة العميل", REVISION_REQUESTED: "طلب تعديل", APPROVED: "معتمد", DELIVERED: "تم التسليم", ARCHIVED: "مؤرشف" };

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({
    where: { id: projectId, archivedAt: null },
    include: { organization: { select: { id: true, name: true } }, brief: true,
      _count: { select: { strategies: { where: { isCurrent: true } }, visualDirections: true, colorPalettes: { where: { isCurrent: true } }, typographySystems: { where: { isCurrent: true } }, moodboards: { where: { isCurrent: true } }, logoConcepts: true, brandBooks: { where: { isCurrent: true } }, shareLinks: { where: { revokedAt: null } }, comments: { where: { status: "OPEN" } } } } },
  });
  if (!project) notFound();

  const modules = [
    { href: `/dashboard/projects/${project.id}/brief`, icon: BookOpen, title: "Brand Brief", description: "معلومات المشروع والجمهور والشخصية", completed: project.brief?.status === "COMPLETED", count: undefined },
    { href: `/dashboard/projects/${project.id}/strategy`, icon: Sparkles, title: "استراتيجية العلامة", description: "الرؤية، الرسالة، القيم، التموضع", completed: project._count.strategies > 0, count: project._count.strategies },
    { href: `/dashboard/projects/${project.id}/directions`, icon: Layers, title: "الاتجاهات المؤسسية", description: "ثلاثة اتجاهات مؤسسية متمايزة", completed: project._count.visualDirections > 0, count: project._count.visualDirections },
    { href: `/dashboard/projects/${project.id}/colors`, icon: Palette, title: "لوحة الألوان", description: "11 لونًا مع فحص التباين", completed: project._count.colorPalettes > 0, count: project._count.colorPalettes },
    { href: `/dashboard/projects/${project.id}/typography`, icon: Type, title: "نظام الخطوط", description: "خطوط عربية وإنجليزية متناسقة", completed: project._count.typographySystems > 0, count: project._count.typographySystems },
    { href: `/dashboard/projects/${project.id}/moodboard`, icon: Eye, title: "Mood Board", description: "صور مرجعية وتوليد بالذكاء الاصطناعي", completed: project._count.moodboards > 0, count: project._count.moodboards },
    { href: `/dashboard/projects/${project.id}/logo`, icon: Sparkles, title: "مفاهيم الشعار", description: "أفكار الشعار ومعاينات مؤسسية", completed: project._count.logoConcepts > 0, count: project._count.logoConcepts },
    { href: `/dashboard/projects/${project.id}/sheet`, icon: FileText, title: "Brand Sheet", description: "صفحة ملخص قابلة للتصدير", completed: false, count: undefined },
    { href: `/dashboard/projects/${project.id}/book`, icon: BookOpen, title: "Brand Book", description: "دليل العلامة الكامل (25 قسم)", completed: project._count.brandBooks > 0, count: project._count.brandBooks },
    { href: `/dashboard/projects/${project.id}/share`, icon: Share2, title: "بوابة العميل", description: "مشاركة المشروع مع العميل للاعتماد", completed: project._count.shareLinks > 0, count: project._count.shareLinks },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشاريع</Link>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-violet to-violet-dark flex items-center justify-center"><span className="text-2xl font-bold text-white">{project.nameAr.charAt(0)}</span></div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{project.nameAr}</h1>
              {project.nameEn && <p className="text-sm text-muted-foreground" dir="ltr">{project.nameEn}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2.5 py-1 rounded-full bg-violet/10 text-violet font-medium">{STATUS_LABELS[project.status] ?? project.status}</span>
            <span className="text-muted-foreground">{project.organization.name}</span>
            <span className="text-muted-foreground flex items-center gap-1"><Clock className="size-3" />أُنشئ في {project.createdAt.toLocaleDateString("ar-SA")}</span>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {modules.map((m, idx) => (
          <Link key={m.href} href={m.href} className="card-premium p-5 group hover:border-violet/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`size-11 rounded-xl flex items-center justify-center ${m.completed ? "bg-success/10" : "bg-muted"}`}>
                {m.completed ? <CheckCircle2 className="size-5 text-success" /> : <m.icon className="size-5 text-muted-foreground" />}
              </div>
              {typeof m.count === "number" && m.count > 0 && (<span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{m.count}</span>)}
            </div>
            <div className="flex items-center gap-2 mb-1"><span className="text-xs text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span><h3 className="font-semibold">{m.title}</h3></div>
            <p className="text-sm text-muted-foreground">{m.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
