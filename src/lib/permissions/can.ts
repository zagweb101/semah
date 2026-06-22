import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canOrg, type OrganizationRole } from "./organization";
import { canProject, type ProjectRole } from "./project";
import { canClient, type ShareLinkContext } from "./client";

export interface PermissionContext {
  organizationId?: string; projectId?: string; shareLink?: ShareLinkContext;
}

export async function can(permission: string, context: PermissionContext): Promise<boolean> {
  if (context.shareLink) return canClient(context.shareLink, permission);
  const session = await auth();
  if (!session?.user?.id) return false;
  const userId = session.user.id;

  if (context.projectId) {
    const project = await prisma.brandProject.findFirst({ where: { id: context.projectId }, select: { id: true, organizationId: true } });
    if (!project) return false;
    const membership = await prisma.membership.findUnique({ where: { userId_organizationId: { userId, organizationId: project.organizationId } }, select: { role: true } });
    if (!membership) return false;
    if (membership.role === "OWNER") return true;
    const pm = await prisma.projectMember.findUnique({ where: { brandProjectId_userId: { brandProjectId: context.projectId, userId } }, select: { role: true } });
    if (!pm) return membership.role === "ADMIN" ? canProject("CONTRIBUTOR", permission) : false;
    return canProject(pm.role as ProjectRole, permission);
  }

  if (context.organizationId) {
    const m = await prisma.membership.findUnique({ where: { userId_organizationId: { userId, organizationId: context.organizationId } }, select: { role: true } });
    if (!m) return false;
    return canOrg(m.role as OrganizationRole, permission);
  }
  return false;
}

export async function assertCan(permission: string, context: PermissionContext): Promise<void> {
  if (!(await can(permission, context))) throw new PermissionDeniedError(permission);
}

export class PermissionDeniedError extends Error {
  constructor(public readonly permission: string) { super(`Permission denied: ${permission}`); this.name = "PermissionDeniedError"; }
}

export { canOrg, canProject, canClient };

// Re-export permission constants for convenience
export { OrgPermissions } from "./organization";
export { ProjectPermissions } from "./project";
export { ClientPermissions } from "./client";
