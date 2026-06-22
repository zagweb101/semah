import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Eye } from "lucide-react";
import { MoodboardManager } from "@/components/moodboard-manager";
import { getMockMode } from "@/lib/ai/utils";

export const metadata = { title: "Mood Board" };
export const dynamic = "force-dynamic";

export default async function MoodboardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true } });
  if (!project) notFound();
  const moodboard = await prisma.moodboard.findFirst({ where: { brandProjectId: project.id, isCurrent: true }, include: { items: { orderBy: { order: "asc" } } } });
  const mockMode = getMockMode();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشروع</Link>
      <div className="mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Eye className="size-4 text-violet" /><span>Mood Board</span></div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Mood Board — {project.nameAr}</h1><p className="mt-2 text-muted-foreground">صور مرجعية وتوليد بالذكاء الاصطناعي.</p></div>
      <MoodboardManager projectId={project.id} moodboardId={moodboard?.id ?? null} items={(moodboard?.items ?? []).map((i) => ({ id: i.id, order: i.order, externalUrl: i.externalUrl, caption: i.caption, source: i.source, locked: i.locked }))} mockMode={mockMode} />
    </div>
  );
}
