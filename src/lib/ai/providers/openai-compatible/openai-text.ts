import OpenAI from "openai";
import type { TextAIProvider, TextGenerationInput, TextGenerationResult, StructuredGenerationInput, StructuredGenerationResult, ProviderHealth } from "@/lib/ai/core/types";
import { AIProviderError, AITimeoutError, AIRateLimitError, AIAuthenticationError, AIValidationError, AIContentFilterError } from "@/lib/ai/core/errors";
import { withRetry } from "@/lib/ai/core/retry";
import { logPrompt, logGeneration } from "@/lib/ai/core/logger";

export class OpenAICompatibleTextProvider implements TextAIProvider {
  readonly name = "openai-compatible";
  private client: OpenAI;
  private model: string;
  private timeoutMs: number;

  constructor(opts: { apiKey: string; baseUrl?: string; model: string; timeoutMs?: number }) {
    this.client = new OpenAI({ apiKey: opts.apiKey, baseURL: opts.baseUrl, timeout: opts.timeoutMs ?? 120000, maxRetries: 0 });
    this.model = opts.model;
    this.timeoutMs = opts.timeoutMs ?? 120000;
  }

  async generateText(input: TextGenerationInput): Promise<TextGenerationResult> {
    logPrompt("openai-text", { model: this.model });
    return withRetry(async () => {
      try {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages: [{ role: "system", content: input.systemPrompt }, { role: "user", content: input.userPrompt }],
          temperature: input.temperature ?? 0.7, max_tokens: input.maxTokens,
        });
        const result: TextGenerationResult = {
          content: completion.choices[0]?.message?.content ?? "",
          tokensIn: completion.usage?.prompt_tokens ?? 0,
          tokensOut: completion.usage?.completion_tokens ?? 0,
          finishReason: completion.choices[0]?.finish_reason ?? "stop",
          model: this.model, provider: this.name,
          promptVersion: (input.metadata?.promptVersion as string) ?? "1.0.0",
        };
        logGeneration("openai-text", { tokensIn: result.tokensIn, tokensOut: result.tokensOut });
        return result;
      } catch (e) { throw mapError(e, this.timeoutMs); }
    }, { maxAttempts: 3, isRetryable: (e) => e instanceof AITimeoutError || e instanceof AIRateLimitError });
  }

  async generateStructuredData<T>(input: StructuredGenerationInput<T>): Promise<StructuredGenerationResult<T>> {
    logPrompt("openai-structured", { generationType: input.metadata?.generationType });
    return withRetry(async () => {
      try {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages: [{ role: "system", content: input.systemPrompt }, { role: "user", content: input.userPrompt }],
          temperature: input.temperature ?? 0.5,
          response_format: { type: "json_object" },
        });
        const content = completion.choices[0]?.message?.content ?? "{}";
        let parsed: unknown;
        try { parsed = JSON.parse(content); } catch { throw new AIValidationError("Invalid JSON", content); }
        const valid = input.outputSchema.safeParse(parsed);
        if (!valid.success) throw new AIValidationError("Schema validation failed", valid.error.issues);
        return {
          content, structuredData: valid.data,
          tokensIn: completion.usage?.prompt_tokens ?? 0,
          tokensOut: completion.usage?.completion_tokens ?? 0,
          finishReason: completion.choices[0]?.finish_reason ?? "stop",
          model: this.model, provider: this.name,
          promptVersion: (input.metadata?.promptVersion as string) ?? "1.0.0",
        };
      } catch (e) { throw mapError(e, this.timeoutMs); }
    }, { maxAttempts: 3, isRetryable: (e) => e instanceof AITimeoutError || e instanceof AIRateLimitError });
  }

  async healthCheck(): Promise<ProviderHealth> {
    try {
      const start = Date.now();
      await this.client.models.list();
      return { status: "healthy", lastCheckedAt: new Date(), latencyMs: Date.now() - start };
    } catch (e) {
      return { status: "down", lastCheckedAt: new Date(), message: e instanceof Error ? e.message : "Unknown" };
    }
  }
}

function mapError(error: unknown, timeoutMs: number): Error {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401 || error.status === 403) return new AIAuthenticationError();
    if (error.status === 429) return new AIRateLimitError();
    if (error.status === 400 && error.message.includes("content filter")) return new AIContentFilterError();
    return new AIProviderError(error.message, `HTTP_${error.status}`);
  }
  if (error instanceof OpenAI.APIConnectionTimeoutError) return new AITimeoutError(timeoutMs);
  if (error instanceof Error && error.name === "AbortError") return new AITimeoutError(timeoutMs);
  if (error instanceof AIValidationError) return error;
  return new AIProviderError(error instanceof Error ? error.message : "Unknown");
}
