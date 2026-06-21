import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { chatCompletion } from "@/lib/openai";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimitResponse(`ai:${session.user.id}`, {
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const result = await chatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    ...messages,
  ]);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ content: result.content });
}
