import { prisma } from "@/lib/prisma";
import type { GenerationType } from "@/generated/prisma/client";
import { createHash } from "crypto";

export interface EnqueueJobInput {
  organizationId: string; brandProjectId?: string; userId: string;
  generationType: GenerationType; inputMetadata: Record<string, unknown>;
  idempotencyKey: string; reservedCredits: number; promptVersion?: string;
}

export async function enqueueJob(input: EnqueueJobInput) {
  const existing = await prisma.aIJob.findUnique({ where: { idempotencyKey: input.idempotencyKey }, select: { id: true } });
  if (existing) return { jobId: existing.id, alreadyExists: true };
  const inputHash = createHash("sha256").update(JSON.stringify(input.inputMetadata)).digest("hex");
  const job = await prisma.aIJob.create({
    data: {
      organizationId: input.organizationId, brandProjectId: input.brandProjectId ?? null,
      userId: input.userId, generationType: input.generationType,
      provider: "", model: "", inputHash, idempotencyKey: input.idempotencyKey,
      inputMetadata: input.inputMetadata as never, reservedCredits: input.reservedCredits,
      maxAttempts: Number(process.env.AI_MAX_RETRIES ?? 3), promptVersion: input.promptVersion,
      status: "QUEUED",
    },
  });
  return { jobId: job.id, alreadyExists: false };
}
