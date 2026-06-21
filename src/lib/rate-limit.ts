import { NextResponse } from "next/server";

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 10,
  windowMs: 60 * 1000,
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}, 60 * 1000);

export function rateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): { success: boolean; limit: number; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = { count: 1, resetAt: now + config.windowMs };
    buckets.set(key, bucket);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: bucket.resetAt,
    };
  }

  existing.count += 1;

  return {
    success: existing.count <= config.limit,
    limit: config.limit,
    remaining: Math.max(0, config.limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export function rateLimitResponse(
  key: string,
  config?: RateLimitConfig,
): NextResponse | null {
  const result = rateLimit(key, config);
  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetAt),
        },
      },
    );
  }
  return null;
}
