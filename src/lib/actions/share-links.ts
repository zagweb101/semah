"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertCan, ProjectPermissions, canClient, ClientPermissions } from "@/lib/permissions/can";

export async function createShareLinkAction(input: { projectId: string; expiresAt?: Date | null; password?: string | null; allowDownload?: boolean; allowComment?: boolean; allowApprove?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await prisma.brandProject.findFirst({ where: { id: input.projectId, archivedAt: null }, select: { id: true, organizationId: true } });
  if (!project) return { error: "المشروع غير موجود" };
  await assertCan(ProjectPermissions.CLIENT_SHARE, { organizationId: project.organizationId, projectId: project.id });
  const token = randomBytes(32).toString("hex");
  const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : null;
  const link = await prisma.shareLink.create({ data: { brandProjectId: input.projectId, token, passwordHash, expiresAt: input.expiresAt ?? null, allowDownload: input.allowDownload ?? false, allowComment: input.allowComment ?? true, allowApprove: input.allowApprove ?? false, createdById: session.user.id } });
  await prisma.projectActivity.create({ data: { brandProjectId: input.projectId, userId: session.user.id, type: "SHARED", metadata: { linkId: link.id } } });
  revalidatePath(`/dashboard/projects/${input.projectId}`);
  return { success: true, token: link.token, linkId: link.id };
}

export async function revokeShareLinkAction(projectId: string, linkId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await assertCan(ProjectPermissions.CLIENT_SHARE, { projectId });
  await prisma.shareLink.update({ where: { id: linkId, brandProjectId: projectId }, data: { revokedAt: new Date() } });
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function getShareLinksAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await assertCan(ProjectPermissions.CLIENT_SHARE, { projectId });
  return prisma.shareLink.findMany({ where: { brandProjectId: projectId }, orderBy: { createdAt: "desc" } });
}

export async function validateShareLinkAction(token: string, password?: string) {
  const link = await prisma.shareLink.findUnique({ where: { token }, include: { brandProject: { select: { id: true, nameAr: true, nameEn: true, organizationId: true } } } });
  if (!link) return { error: "الرابط غير موجود" };
  if (link.revokedAt) return { error: "تم إلغاء هذا الرابط" };
  if (link.expiresAt && link.expiresAt < new Date()) return { error: "انتهت صلاحية الرابط" };
  if (link.passwordHash) {
    if (!password) return { error: "كلمة مرور مطلوبة", needsPassword: true };
    const valid = await bcrypt.compare(password, link.passwordHash);
    if (!valid) return { error: "كلمة المرور غير صحيحة" };
  }
  await prisma.shareLink.update({ where: { id: link.id }, data: { lastAccessedAt: new Date() } });
  return { success: true, link: { id: link.id, allowDownload: link.allowDownload, allowComment: link.allowComment, allowApprove: link.allowApprove }, project: link.brandProject };
}

export async function clientCommentAction(token: string, input: { body: string; relatedEntityType?: string; relatedEntityId?: string }) {
  const link = await prisma.shareLink.findUnique({ where: { token } });
  if (!link) return { error: "رابط غير صالح" };
  const canComment = canClient({ revokedAt: link.revokedAt, expiresAt: link.expiresAt, allowDownload: link.allowDownload, allowComment: link.allowComment, allowApprove: link.allowApprove, passwordHash: link.passwordHash }, ClientPermissions.COMMENT);
  if (!canComment) return { error: "التعليق غير مسموح" };
  const comment = await prisma.comment.create({ data: { brandProjectId: link.brandProjectId, authorName: "عميل", authorType: "CLIENT", relatedEntityType: (input.relatedEntityType as never) ?? "PROJECT", relatedEntityId: input.relatedEntityId ?? link.brandProjectId, body: input.body, status: "OPEN" } });
  await prisma.projectActivity.create({ data: { brandProjectId: link.brandProjectId, type: "COMMENTED", metadata: { commentId: comment.id, source: "client" } } });
  revalidatePath(`/share/${token}`);
  return { success: true };
}

export async function clientApproveAction(token: string, input: { entityType: string; entityId: string; comment?: string }) {
  const link = await prisma.shareLink.findUnique({ where: { token } });
  if (!link) return { error: "رابط غير صالح" };
  const canApprove = canClient({ revokedAt: link.revokedAt, expiresAt: link.expiresAt, allowDownload: link.allowDownload, allowComment: link.allowComment, allowApprove: link.allowApprove, passwordHash: link.passwordHash }, ClientPermissions.APPROVE);
  if (!canApprove) return { error: "الاعتماد غير مسموح" };
  const approval = await prisma.approval.create({ data: { brandProjectId: link.brandProjectId, approverType: "CLIENT", approverName: "عميل", approvedEntityType: input.entityType as never, approvedEntityId: input.entityId, comment: input.comment } });
  await prisma.projectActivity.create({ data: { brandProjectId: link.brandProjectId, type: "APPROVED", metadata: { approvalId: approval.id } } });
  if (input.entityType === "PROJECT") await prisma.brandProject.update({ where: { id: link.brandProjectId }, data: { status: "APPROVED" } });
  revalidatePath(`/share/${token}`);
  return { success: true };
}
