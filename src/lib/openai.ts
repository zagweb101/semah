import OpenAI from "openai";

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function chatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
) {
  if (!openai) {
    return {
      error: "OpenAI API key not configured. Set OPENAI_API_KEY in .env",
    };
  }

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages,
  });

  return {
    content: completion.choices[0]?.message?.content ?? "",
  };
}
