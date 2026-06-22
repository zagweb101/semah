/** SEMAH AI utilities — shared helpers. */
export function getMockMode(): boolean {
  if (process.env.AI_MOCK_MODE === "true") return true;
  if (!process.env.AI_TEXT_API_KEY && !process.env.OPENAI_API_KEY) return true;
  return false;
}
export function isDev(): boolean { return process.env.NODE_ENV === "development"; }
export function shouldLogPrompts(): boolean { return isDev() || process.env.AI_LOG_PROMPTS === "true"; }
