export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  isRetryable?: (error: unknown) => boolean;
}

const DEFAULT: Required<RetryOptions> = { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 10000, isRetryable: () => true };

export async function withRetry<T>(op: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const o = { ...DEFAULT, ...opts };
  let last: unknown;
  for (let i = 1; i <= o.maxAttempts; i++) {
    try { return await op(); } catch (e) {
      last = e;
      if (i === o.maxAttempts) break;
      if (!o.isRetryable(e)) throw e;
      await new Promise((r) => setTimeout(r, Math.min(o.baseDelayMs * Math.pow(2, i - 1), o.maxDelayMs) + Math.random() * 250));
    }
  }
  throw last;
}
