"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertCan, ProjectPermissions, OrgPermissions } from "@/lib/permissions/can";
import { createProjectSchema, brandBriefSchema, canTransition, type BrandBrief } from "@/lib/validations/project";
import { getPlan } from "@/lib/plans";

function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || `project-${Date.now()}`;
}

export async function createProjectAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) return { error: "بيانات غير صحيحة", issues: parsed.error.issues };
  const { organizationId, nameAr, nameEn } = parsed.data;
  await assertCan(OrgPermissions.PROJECTS_CREATE, { organizationId });
  const subscription = await prisma.subscription.findFirst({ where: { userId: session.user.id } });
  const plan = getPlan(subscription?.plan);
  const projectCount = await prisma.brandProject.count({ where: { organizationId, archivedAt: null } });
  if (projectCount >= plan.maxProjects) return { error: `وصلت للحد الأقصى (${plan.maxProjects}) في خطة ${plan.nameAr}` };
  const baseSlug = slugify(nameAr);
  let slug = baseSlug, suffix = 1;
  while (await prisma.brandProject.findUnique({ where: { organizationId_slug: { organizationId, slug } } })) slug = `${baseSlug}-${suffix++}`;
  const project = await prisma.brandProject.create({
    data: {
      organizationId, nameAr, nameEn, slug, status: "DRAFT", createdBy: session.user.id,
      brief: { create: { data: {}, status: "DRAFT" } },
      projectMembers: { create: { userId: session.user.id, role: "PROJECT_OWNER" } },
      activities: { create: { type: "CREATED", userId: session.user.id, metadata: { nameAr, nameEn } } },
    },
  });
  revalidatePath("/dashboard"); revalidatePath("/dashboard/projects");
  return { projectId: project.id, slug: project.slug };
}

export async function getProjectsAction() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const memberships = await prisma.membership.findMany({ where: { userId: session.user.id }, select: { organizationId: true } });
  if (memberships.length === 0) return [];
  return prisma.brandProject.findMany({
    where: { organizationId: { in: memberships.map((m) => m.organizationId) }, archivedAt: null },
    include: { organization: { select: { name: true, slug: true } }, _count: { select: { comments: { where: { status: "OPEN" } }, aiJobs: { where: { status: "PROCESSING" } } } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function saveBrandBriefAction(projectId: string, briefData: Partial<BrandBrief>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, organizationId: true, brief: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.BRIEF_UPDATE, { organizationId: project.organizationId, projectId: project.id });
  const existing = (project.brief?.data as Record<string, unknown>) ?? {};
  const merged = { ...existing, ...briefData };
  await prisma.brandBrief.update({ where: { brandProjectId: project.id }, data: { data: merged as never, lastSavedAt: new Date(), lastSavedBy: session.user.id, status: "DRAFT" } });
  if (project.brief?.status === "DRAFT") await prisma.brandProject.updateMany({ where: { id: project.id, status: "DRAFT" }, data: { status: "BRIEF_IN_PROGRESS" } });
  return { success: true, savedAt: new Date().toISOString() };
}

export async function completeBrandBriefAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, organizationId: true, brief: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.BRIEF_UPDATE, { organizationId: project.organizationId, projectId: project.id });
  const briefData = (project.brief?.data as Record<string, unknown>) ?? {};
  if (!briefData.nameAr || !briefData.description || !briefData.sector) return { error: "الرجاء تعبئة: الاسم العربي، الوصف، القطاع" };
  await prisma.$transaction([
    prisma.brandBrief.update({ where: { brandProjectId: project.id }, data: { status: "COMPLETED" } }),
    prisma.brandProject.update({ where: { id: project.id }, data: { status: "READY_FOR_ANALYSIS" } }),
    prisma.projectActivity.create({ data: { brandProjectId: project.id, userId: session.user.id, type: "BRIEF_UPDATED", metadata: { action: "completed" } } }),
  ]);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function archiveProjectAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, organizationId: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.ARCHIVE, { organizationId: project.organizationId, projectId: project.id });
  await prisma.$transaction([
    prisma.brandProject.update({ where: { id: projectId }, data: { archivedAt: new Date(), status: "ARCHIVED" } }),
    prisma.projectActivity.create({ data: { brandProjectId: projectId, userId: session.user.id, type: "ARCHIVED", metadata: {} } }),
  ]);
  revalidatePath("/dashboard"); revalidatePath("/dashboard/projects");
  redirect("/dashboard");
}
