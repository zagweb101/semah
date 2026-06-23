import type { TextAIProvider, TextGenerationInput, TextGenerationResult, StructuredGenerationInput, StructuredGenerationResult, ProviderHealth } from "@/lib/ai/core/types";
import { logPrompt } from "@/lib/ai/core/logger";
import { loadFixture } from "./fixtures";

export class MockTextProvider implements TextAIProvider {
  readonly name = "mock";

  async generateText(input: TextGenerationInput): Promise<TextGenerationResult> {
    logPrompt("mock-text", { userPrompt: input.userPrompt.slice(0, 200) });
    await simulateLatency();
    return {
      content: `[Mock] ${input.userPrompt.slice(0, 100)}`,
      tokensIn: Math.ceil(input.systemPrompt.length / 4) + Math.ceil(input.userPrompt.length / 4),
      tokensOut: 200,
      finishReason: "stop",
      model: "mock-text-v1",
      provider: this.name,
      promptVersion: (input.metadata?.promptVersion as string) ?? "1.0.0",
    };
  }

  async generateStructuredData<T>(input: StructuredGenerationInput<T>): Promise<StructuredGenerationResult<T>> {
    logPrompt("mock-structured", { generationType: input.metadata?.generationType });
    await simulateLatency();
    const generationType = input.metadata?.generationType as string | undefined;
    const fixture = loadFixture(generationType, input.metadata);
    const parsed = input.outputSchema.safeParse(fixture);
    if (!parsed.success) console.warn("[MockTextProvider] Fixture validation failed:", parsed.error.issues);
    return {
      content: JSON.stringify(fixture),
      structuredData: (parsed.success ? parsed.data : fixture) as T,
      tokensIn: 500, tokensOut: 1500,
      finishReason: "stop", model: "mock-text-v1", provider: this.name,
      promptVersion: (input.metadata?.promptVersion as string) ?? "1.0.0",
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return { status: "healthy", lastCheckedAt: new Date(), latencyMs: 0, message: "Mock provider" };
  }
}

function simulateLatency(): Promise<void> {
  return new Promise((r) => setTimeout(r, 300 + Math.random() * 700));
}
