import { describe, it, expect } from "vitest";
import { canClient, ClientPermissions } from "./client";

const baseLink = {
  revokedAt: null as Date | null,
  expiresAt: null as Date | null,
  allowDownload: true,
  allowComment: true,
  allowApprove: true,
  passwordHash: null as string | null,
};

describe("canClient", () => {
  it("allows view for active links", () => {
    expect(canClient(baseLink, ClientPermissions.VIEW)).toBe(true);
  });

  it("denies all permissions for revoked links", () => {
    const revoked = { ...baseLink, revokedAt: new Date() };
    expect(canClient(revoked, ClientPermissions.VIEW)).toBe(false);
    expect(canClient(revoked, ClientPermissions.COMMENT)).toBe(false);
    expect(canClient(revoked, ClientPermissions.APPROVE)).toBe(false);
    expect(canClient(revoked, ClientPermissions.DOWNLOAD)).toBe(false);
  });

  it("denies all permissions for expired links", () => {
    const expired = { ...baseLink, expiresAt: new Date(Date.now() - 1000) };
    expect(canClient(expired, ClientPermissions.VIEW)).toBe(false);
    expect(canClient(expired, ClientPermissions.COMMENT)).toBe(false);
  });

  it("respects allowComment for comments and revisions", () => {
    const noComment = { ...baseLink, allowComment: false };
    expect(canClient(noComment, ClientPermissions.COMMENT)).toBe(false);
    expect(canClient(noComment, ClientPermissions.REQUEST_REVISION)).toBe(false);
  });

  it("respects allowApprove", () => {
    const noApprove = { ...baseLink, allowApprove: false };
    expect(canClient(noApprove, ClientPermissions.APPROVE)).toBe(false);
    expect(canClient(noApprove, ClientPermissions.VIEW)).toBe(true);
  });

  it("respects allowDownload", () => {
    const noDownload = { ...baseLink, allowDownload: false };
    expect(canClient(noDownload, ClientPermissions.DOWNLOAD)).toBe(false);
    expect(canClient(noDownload, ClientPermissions.VIEW)).toBe(true);
  });
});
