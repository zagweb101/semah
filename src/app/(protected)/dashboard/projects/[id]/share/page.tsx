import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Share2 } from "lucide-react";
import { ShareLinksManager } from "@/components/share-links-manager";
import { getShareLinksAction } from "@/lib/actions/share-links";

export const metadata = { title: "بوابة العميل" };
export const dynamic = "force-dynamic";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true, status: true } });
  if (!project) notFound();
  const links = await getShareLinksAction(project.id);
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشروع</Link>
      <div className="mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Share2 className="size-4 text-violet" /><span>بوابة العميل</span></div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">مشاركة {project.nameAr}</h1><p className="mt-2 text-muted-foreground">أنشئ روابط آمنة لمشاركة المشروع مع العميل.</p></div>
      <div className="card-premium p-6"><ShareLinksManager projectId={project.id} links={links} /></div>
    </div>
  );
}
