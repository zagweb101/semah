import { Redis } from "ioredis";
import type { RateLimitConfig, RateLimitResult, RateLimitStore } from "./store";

export class RedisRateLimitStore implements RateLimitStore {
  private redis: Redis;
  constructor(url: string) {
    this.redis = new Redis(url, { lazyConnect: true });
  }

  async hit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const redisKey = `ratelimit:${key}`;
    const windowSeconds = Math.ceil(config.windowMs / 1000);

    const pipeline = this.redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.pttl(redisKey);
    pipeline.expire(redisKey, windowSeconds, "NX");

    const results = await pipeline.exec();
    if (!results) {
      return { success: false, limit: config.limit, remaining: 0, resetAt: now + config.windowMs };
    }

    const count = (results[0]?.[1] as number) ?? 1;
    let ttl = (results[1]?.[1] as number) ?? config.windowMs;
    if (ttl < 0) ttl = config.windowMs;

    return {
      success: count <= config.limit,
      limit: config.limit,
      remaining: Math.max(0, config.limit - count),
      resetAt: now + ttl,
    };
  }
}
