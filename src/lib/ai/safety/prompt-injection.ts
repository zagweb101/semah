const SUSPICIOUS = [/ignore (the )?(above|previous|all) (instructions?|prompts?)/i, /disregard (the )?(above|previous|all)/i, /you are (now )?a /i, /forget your (instructions|rules)/i, /system prompt/i, /<\/?(system|assistant|user)>/i];
const MAX = 10000;

export function checkPromptSafety(text: string): { isSafe: boolean; reason?: string } {
  if (text.length > MAX) return { isSafe: false, reason: `Input exceeds ${MAX} chars` };
  for (const p of SUSPICIOUS) if (p.test(text)) return { isSafe: false, reason: "Potential prompt injection" };
  return { isSafe: true };
}

export function sanitizeUserInput(text: string): string {
  return text.replace(/```/g, "``").replace(/<\/?(system|assistant|user)>/gi, "").trim().slice(0, MAX);
}
