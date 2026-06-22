export const ClientPermissions = {
  VIEW: "client.view", COMMENT: "client.comment",
  REQUEST_REVISION: "client.requestRevision", APPROVE: "client.approve", DOWNLOAD: "client.download",
} as const;

export interface ShareLinkContext {
  revokedAt: Date | null; expiresAt: Date | null;
  allowDownload: boolean; allowComment: boolean; allowApprove: boolean; passwordHash: string | null;
}

export function canClient(link: ShareLinkContext, permission: string): boolean {
  if (link.revokedAt) return false;
  if (link.expiresAt && link.expiresAt < new Date()) return false;
  switch (permission) {
    case ClientPermissions.VIEW: return true;
    case ClientPermissions.COMMENT: case ClientPermissions.REQUEST_REVISION: return link.allowComment;
    case ClientPermissions.APPROVE: return link.allowApprove;
    case ClientPermissions.DOWNLOAD: return link.allowDownload;
    default: return false;
  }
}
