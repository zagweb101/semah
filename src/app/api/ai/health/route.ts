import { NextResponse } from "next/server";
import { getTextProvider } from "@/lib/ai/providers/factory";
import { getMockMode } from "@/lib/ai/utils";

export async function GET() {
  try {
    const provider = getTextProvider();
    const health = await provider.healthCheck();
    return NextResponse.json({ status: health.status, provider: provider.name, mockMode: getMockMode(), lastCheckedAt: health.lastCheckedAt, latencyMs: health.latencyMs, message: health.message });
  } catch (error) {
    return NextResponse.json({ status: "down", error: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
