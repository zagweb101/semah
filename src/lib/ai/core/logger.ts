import { shouldLogPrompts } from "@/lib/ai/utils";
const SENSITIVE = ["password", "token", "apikey", "api_key", "secret", "card", "cvv", "ssn", "stripe"];

export function redactForLog(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(redactForLog);
  return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => {
    if (SENSITIVE.some((s) => k.toLowerCase().includes(s))) return [k, "[REDACTED]"];
    return [k, redactForLog(v)];
  }));
}

export function logPrompt(label: string, data: unknown): void {
  if (!shouldLogPrompts()) return;
  console.log(`[AI:${label}]`, JSON.stringify(redactForLog(data)));
}
export function logGeneration(label: string, data: unknown): void {
  if (!shouldLogPrompts()) return;
  console.log(`[AI:${label}:result]`, JSON.stringify(redactForLog(data)));
}
