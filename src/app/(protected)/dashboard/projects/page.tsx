import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Clock, Sparkles, MessageSquare } from "lucide-react";

export const metadata = { title: "المشاريع" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const memberships = await prisma.membership.findMany({ where: { userId: session.user.id }, select: { organizationId: true } });
  if (memberships.length === 0) redirect("/dashboard");
  const projects = await prisma.brandProject.findMany({
    where: { organizationId: { in: memberships.map((m) => m.organizationId) }, archivedAt: null },
    include: { organization: { select: { name: true } }, _count: { select: { comments: { where: { status: "OPEN" } }, aiJobs: { where: { status: "PROCESSING" } } } } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">المشاريع</h1><p className="mt-2 text-muted-foreground">{projects.length === 0 ? "ابدأ بإنشاء مشروعك الأول" : `${projects.length} مشروع`}</p></div>
        <Button nativeButton={false} render={<Link href="/dashboard/projects/new" />}><Plus className="size-4" />مشروع جديد</Button>
      </div>
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 sm:p-16 text-center">
          <div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-4"><FolderOpen className="size-8 text-violet" /></div>
          <h3 className="text-xl font-semibold mb-2">لا توجد مشاريع بعد</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">ابدأ رحلتك في بناء الهوية بإنشاء أول مشروع.</p>
          <Button size="lg" nativeButton={false} render={<Link href="/dashboard/projects/new" />}><Plus className="size-4" />إنشاء أول مشروع</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="card-premium p-5 group hover:border-violet/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="size-12 rounded-xl bg-gradient-to-br from-violet/20 to-coral/10 flex items-center justify-center"><span className="text-lg font-bold text-violet">{p.nameAr.charAt(0)}</span></div>
              </div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{p.nameAr}</h3>
              {p.nameEn && <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{p.nameEn}</p>}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                <span className="flex items-center gap-1"><Clock className="size-3" />{formatRelativeTime(p.updatedAt)}</span>
                {p._count.comments > 0 && <span className="flex items-center gap-1"><MessageSquare className="size-3" />{p._count.comments}</span>}
                {p._count.aiJobs > 0 && <span className="flex items-center gap-1 text-violet"><Sparkles className="size-3 animate-pulse" />{p._count.aiJobs}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `قبل ${minutes} دقيقة`;
  if (hours < 24) return `قبل ${hours} ساعة`;
  if (days < 30) return `قبل ${days} يوم`;
  return date.toLocaleDateString("ar-SA");
}
