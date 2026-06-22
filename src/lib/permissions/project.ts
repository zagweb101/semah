export const ProjectPermissions = {
  VIEW: "project.view", CREATE: "project.create", UPDATE: "project.update",
  ARCHIVE: "project.archive", DELETE: "project.delete",
  BRIEF_VIEW: "brief.view", BRIEF_UPDATE: "brief.update",
  STRATEGY_VIEW: "strategy.view", STRATEGY_GENERATE: "strategy.generate", STRATEGY_UPDATE: "strategy.update",
  VISUAL_DIRECTION_VIEW: "visualDirection.view", VISUAL_DIRECTION_GENERATE: "visualDirection.generate",
  VISUAL_DIRECTION_UPDATE: "visualDirection.update", VISUAL_DIRECTION_APPROVE: "visualDirection.approve",
  MOODBOARD_VIEW: "moodboard.view", MOODBOARD_GENERATE: "moodboard.generate", MOODBOARD_UPDATE: "moodboard.update",
  PALETTE_VIEW: "palette.view", PALETTE_GENERATE: "palette.generate", PALETTE_UPDATE: "palette.update",
  TYPOGRAPHY_VIEW: "typography.view", TYPOGRAPHY_GENERATE: "typography.generate", TYPOGRAPHY_UPDATE: "typography.update",
  LOGO_VIEW: "logo.view", LOGO_GENERATE: "logo.generate", LOGO_UPDATE: "logo.update",
  BRAND_BOOK_VIEW: "brandBook.view", BRAND_BOOK_GENERATE: "brandBook.generate",
  BRAND_BOOK_UPDATE: "brandBook.update", BRAND_BOOK_EXPORT: "brandBook.export",
  CLIENT_SHARE: "client.share", CLIENT_COMMENT: "client.comment",
  CLIENT_REQUEST_REVISION: "client.requestRevision", CLIENT_APPROVE: "client.approve",
  ASSET_UPLOAD: "asset.upload", ASSET_DOWNLOAD: "asset.download", ASSET_DELETE: "asset.delete",
} as const;

export type ProjectRole = "PROJECT_OWNER" | "CREATIVE_DIRECTOR" | "DESIGNER" | "CONTRIBUTOR";
const ALL = Object.values(ProjectPermissions) as readonly string[];
const MATRIX: Record<ProjectRole, readonly string[]> = {
  PROJECT_OWNER: ALL,
  CREATIVE_DIRECTOR: [ProjectPermissions.VIEW, ProjectPermissions.UPDATE, ProjectPermissions.BRIEF_VIEW, ProjectPermissions.BRIEF_UPDATE, ProjectPermissions.STRATEGY_VIEW, ProjectPermissions.STRATEGY_GENERATE, ProjectPermissions.STRATEGY_UPDATE, ProjectPermissions.VISUAL_DIRECTION_VIEW, ProjectPermissions.VISUAL_DIRECTION_GENERATE, ProjectPermissions.VISUAL_DIRECTION_UPDATE, ProjectPermissions.VISUAL_DIRECTION_APPROVE, ProjectPermissions.MOODBOARD_VIEW, ProjectPermissions.MOODBOARD_GENERATE, ProjectPermissions.MOODBOARD_UPDATE, ProjectPermissions.PALETTE_VIEW, ProjectPermissions.PALETTE_GENERATE, ProjectPermissions.PALETTE_UPDATE, ProjectPermissions.TYPOGRAPHY_VIEW, ProjectPermissions.TYPOGRAPHY_GENERATE, ProjectPermissions.TYPOGRAPHY_UPDATE, ProjectPermissions.LOGO_VIEW, ProjectPermissions.LOGO_GENERATE, ProjectPermissions.LOGO_UPDATE, ProjectPermissions.BRAND_BOOK_VIEW, ProjectPermissions.BRAND_BOOK_GENERATE, ProjectPermissions.BRAND_BOOK_UPDATE, ProjectPermissions.BRAND_BOOK_EXPORT, ProjectPermissions.CLIENT_SHARE, ProjectPermissions.CLIENT_COMMENT, ProjectPermissions.CLIENT_REQUEST_REVISION, ProjectPermissions.CLIENT_APPROVE, ProjectPermissions.ASSET_UPLOAD, ProjectPermissions.ASSET_DOWNLOAD, ProjectPermissions.ASSET_DELETE],
  DESIGNER: [ProjectPermissions.VIEW, ProjectPermissions.BRIEF_VIEW, ProjectPermissions.BRIEF_UPDATE, ProjectPermissions.STRATEGY_VIEW, ProjectPermissions.STRATEGY_GENERATE, ProjectPermissions.VISUAL_DIRECTION_VIEW, ProjectPermissions.VISUAL_DIRECTION_GENERATE, ProjectPermissions.VISUAL_DIRECTION_UPDATE, ProjectPermissions.MOODBOARD_VIEW, ProjectPermissions.MOODBOARD_GENERATE, ProjectPermissions.MOODBOARD_UPDATE, ProjectPermissions.PALETTE_VIEW, ProjectPermissions.PALETTE_GENERATE, ProjectPermissions.PALETTE_UPDATE, ProjectPermissions.TYPOGRAPHY_VIEW, ProjectPermissions.TYPOGRAPHY_GENERATE, ProjectPermissions.TYPOGRAPHY_UPDATE, ProjectPermissions.LOGO_VIEW, ProjectPermissions.LOGO_GENERATE, ProjectPermissions.LOGO_UPDATE, ProjectPermissions.BRAND_BOOK_VIEW, ProjectPermissions.BRAND_BOOK_GENERATE, ProjectPermissions.BRAND_BOOK_UPDATE, ProjectPermissions.BRAND_BOOK_EXPORT, ProjectPermissions.ASSET_UPLOAD, ProjectPermissions.ASSET_DOWNLOAD],
  CONTRIBUTOR: [ProjectPermissions.VIEW, ProjectPermissions.BRIEF_VIEW, ProjectPermissions.STRATEGY_VIEW, ProjectPermissions.VISUAL_DIRECTION_VIEW, ProjectPermissions.MOODBOARD_VIEW, ProjectPermissions.PALETTE_VIEW, ProjectPermissions.TYPOGRAPHY_VIEW, ProjectPermissions.LOGO_VIEW, ProjectPermissions.BRAND_BOOK_VIEW, ProjectPermissions.ASSET_DOWNLOAD],
};

export function canProject(role: ProjectRole, permission: string): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}
