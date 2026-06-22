import { prisma } from "@/lib/prisma";
import type { GenerationType } from "@/generated/prisma/client";

export interface UsageRecord {
  organizationId: string; userId: string; aiJobId?: string;
  generationType: GenerationType; provider: string; model: string;
  tokensIn: number; tokensOut: number; imagesGenerated: number; costEstimate: number;
}

export async function recordUsage(input: UsageRecord): Promise<void> {
  try { await prisma.aIUsage.create({ data: input }); }
  catch (e) { console.error("[AI Usage] Failed:", e); }
}
