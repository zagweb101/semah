export interface RateLimitConfig { limit: number; windowMs: number; }
export interface RateLimitResult { success: boolean; limit: number; remaining: number; resetAt: number; }
export interface RateLimitStore { hit(key: string, config: RateLimitConfig): Promise<RateLimitResult>; }

type Bucket = { count: number; resetAt: number };

export class InMemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, Bucket>();
  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [k, b] of this.buckets) if (b.resetAt <= now) this.buckets.delete(k);
    }, 60_000).unref?.();
  }
  async hit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const b: Bucket = { count: 1, resetAt: now + config.windowMs };
      this.buckets.set(key, b);
      return { success: true, limit: config.limit, remaining: config.limit - 1, resetAt: b.resetAt };
    }
    existing.count += 1;
    return { success: existing.count <= config.limit, limit: config.limit, remaining: Math.max(0, config.limit - existing.count), resetAt: existing.resetAt };
  }
}

let _store: RateLimitStore | null = null;
export function getRateLimitStore(): RateLimitStore {
  if (_store) return _store;
  _store = new InMemoryRateLimitStore();
  return _store;
}

export const RateLimits = {
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 },
  REGISTER: { limit: 3, windowMs: 60 * 60 * 1000 },
  AI_GENERATION: { limit: 20, windowMs: 60 * 1000 },
  IMAGE_GENERATION: { limit: 10, windowMs: 60 * 1000 },
  SHARE_LINK_ACCESS: { limit: 30, windowMs: 60 * 1000 },
  COMMENT: { limit: 30, windowMs: 60 * 1000 },
  EXPORT: { limit: 10, windowMs: 60 * 1000 },
} as const;

export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  return getRateLimitStore().hit(key, config);
}
