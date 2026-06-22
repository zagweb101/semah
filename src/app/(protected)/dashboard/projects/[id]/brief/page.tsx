import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BriefWizard } from "@/components/brief-wizard";
import type { BrandBrief } from "@/lib/validations/project";

export const metadata = { title: "Brand Brief" };
export const dynamic = "force-dynamic";

export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, include: { brief: true } });
  if (!project) notFound();
  const briefData = (project.brief?.data as Partial<BrandBrief>) ?? {};
  return <BriefWizard projectId={project.id} initialData={briefData} alreadyCompleted={project.brief?.status === "COMPLETED"} />;
}
