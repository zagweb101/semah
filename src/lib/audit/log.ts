import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const SENSITIVE = ["password", "token", "apikey", "api_key", "secret", "card", "cvv", "ssn", "stripe"];

export interface AuditLogInput {
  organizationId?: string; userId?: string; action: string;
  resourceType: string; resourceId?: string;
  metadata?: Record<string, unknown>; ipHash?: string; userAgent?: string;
}

export async function audit(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId, userId: input.userId, action: input.action,
        resourceType: input.resourceType, resourceId: input.resourceId,
        metadata: redact(input.metadata ?? {}) as never,
        ipHash: input.ipHash, userAgent: input.userAgent,
      },
    });
  } catch (e) { console.error("[Audit] Failed:", e); }
}

function redact(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(data).map(([k, v]) => {
    if (SENSITIVE.some((s) => k.toLowerCase().includes(s))) return [k, "[REDACTED]"];
    if (typeof v === "object" && v !== null && !Array.isArray(v)) return [k, redact(v as Record<string, unknown>)];
    return [k, v];
  }));
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}
