export const OrgPermissions = {
  VIEW: "organization.view", UPDATE: "organization.update", DELETE: "organization.delete",
  MEMBERS_VIEW: "organization.members.view", MEMBERS_INVITE: "organization.members.invite",
  MEMBERS_UPDATE: "organization.members.update", MEMBERS_REMOVE: "organization.members.remove",
  BILLING_VIEW: "organization.billing.view", BILLING_MANAGE: "organization.billing.manage",
  PROJECTS_VIEW: "organization.projects.view", PROJECTS_CREATE: "organization.projects.create",
  CREDITS_VIEW: "organization.credits.view", AI_USAGE_VIEW: "organization.ai.usage.view",
  AUDIT_VIEW: "organization.audit.view",
} as const;

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";
const ALL = Object.values(OrgPermissions) as readonly string[];
const MATRIX: Record<OrganizationRole, readonly string[]> = {
  OWNER: ALL,
  ADMIN: [OrgPermissions.VIEW, OrgPermissions.UPDATE, OrgPermissions.MEMBERS_VIEW, OrgPermissions.MEMBERS_INVITE, OrgPermissions.MEMBERS_UPDATE, OrgPermissions.MEMBERS_REMOVE, OrgPermissions.BILLING_VIEW, OrgPermissions.PROJECTS_VIEW, OrgPermissions.PROJECTS_CREATE, OrgPermissions.CREDITS_VIEW, OrgPermissions.AI_USAGE_VIEW],
  MEMBER: [OrgPermissions.VIEW, OrgPermissions.PROJECTS_VIEW, OrgPermissions.PROJECTS_CREATE],
};

export function canOrg(role: OrganizationRole, permission: string): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}
