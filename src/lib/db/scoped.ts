import { prisma } from "@/lib/prisma";

export async function getScopedProject(organizationId: string, projectId: string) {
  return prisma.brandProject.findFirst({ where: { id: projectId, organizationId } });
}

export async function getScopedAsset(organizationId: string, assetId: string) {
  return prisma.asset.findFirst({ where: { id: assetId, organizationId, deletedAt: null } });
}

export async function getScopedAIJob(organizationId: string, jobId: string) {
  return prisma.aIJob.findFirst({ where: { id: jobId, organizationId } });
}

export async function verifyOrgAccess(userId: string, organizationId: string) {
  return prisma.membership.findUnique({ where: { userId_organizationId: { userId, organizationId } }, select: { id: true, role: true } });
}

export async function verifyProjectAccess(userId: string, projectId: string) {
  const project = await prisma.brandProject.findFirst({ where: { id: projectId }, select: { id: true, organizationId: true } });
  if (!project) return null;
  const membership = await prisma.membership.findUnique({ where: { userId_organizationId: { userId, organizationId: project.organizationId } }, select: { role: true } });
  if (!membership) return null;
  return { project, membership };
}
