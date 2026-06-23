import { describe, it, expect } from "vitest";
import { InMemoryRateLimitStore, RateLimits } from "./store";

describe("InMemoryRateLimitStore", () => {
  it("allows requests under the limit", async () => {
    const store = new InMemoryRateLimitStore();
    const result = await store.hit("user:1", RateLimits.LOGIN);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(RateLimits.LOGIN.limit - 1);
  });

  it("blocks requests over the limit within the window", async () => {
    const store = new InMemoryRateLimitStore();
    const config = { limit: 2, windowMs: 60_000 };
    await store.hit("key", config);
    await store.hit("key", config);
    const third = await store.hit("key", config);
    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets after the window expires", async () => {
    const store = new InMemoryRateLimitStore();
    const config = { limit: 1, windowMs: 1 };
    await store.hit("key", config);
    await new Promise((r) => setTimeout(r, 10));
    const next = await store.hit("key", config);
    expect(next.success).toBe(true);
    expect(next.remaining).toBe(0);
  });
});
