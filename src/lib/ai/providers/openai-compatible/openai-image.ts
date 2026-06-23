import OpenAI from "openai";
import type { ImageAIProvider, ImageGenerationInput, ImageGenerationResult, GeneratedImage, ProviderHealth } from "@/lib/ai/core/types";
import { AIProviderError, AITimeoutError, AIRateLimitError, AIAuthenticationError, AIContentFilterError } from "@/lib/ai/core/errors";
import { withRetry } from "@/lib/ai/core/retry";
import { logPrompt } from "@/lib/ai/core/logger";

export class OpenAICompatibleImageProvider implements ImageAIProvider {
  readonly name = "openai-compatible-image";
  private client: OpenAI;
  private model: string;
  private timeoutMs: number;

  constructor(opts: { apiKey: string; baseUrl?: string; model: string; timeoutMs?: number }) {
    this.client = new OpenAI({ apiKey: opts.apiKey, baseURL: opts.baseUrl, timeout: opts.timeoutMs ?? 120000, maxRetries: 0 });
    this.model = opts.model;
    this.timeoutMs = opts.timeoutMs ?? 120000;
  }

  async generateImages(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    logPrompt("openai-image", { prompt: input.prompt.slice(0, 200), count: input.count });
    const size = pickSize(this.model, input.width, input.height);
    const images: GeneratedImage[] = [];
    let estimatedCost = 0;

    // DALL·E 3 only supports n=1 per request.
    const batchSize = this.model.includes("dall-e-3") ? 1 : Math.min(input.count, 4);
    const batches = Math.ceil(input.count / batchSize);

    for (let i = 0; i < batches; i++) {
      const count = Math.min(batchSize, input.count - images.length);
      const result = await withRetry(async () => {
        try {
          return await this.client.images.generate({
            model: this.model,
            prompt: input.prompt,
            n: count,
            size: size as OpenAI.Images.ImageGenerateParams["size"],
            quality: this.model.includes("dall-e-3") ? "standard" : undefined,
          });
        } catch (e) { throw mapError(e, this.timeoutMs); }
      }, { maxAttempts: 3, isRetryable: (e) => e instanceof AITimeoutError || e instanceof AIRateLimitError });

      result.data?.forEach((img, idx) => {
        if (img.url) {
          images.push({
            url: img.url,
            provider: this.name,
            model: this.model,
            generationId: `openai-img-${Date.now()}-${i}-${idx}`,
            revisedPrompt: img.revised_prompt ?? input.prompt,
          });
        }
      });
      estimatedCost += estimateCost(this.model, size);
    }

    return { images, estimatedCost };
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

function pickSize(model: string, width: number, height: number): string {
  if (model.includes("dall-e-3")) {
    if (width > height) return "1792x1024";
    if (height > width) return "1024x1792";
    return "1024x1024";
  }
  // DALL·E 2
  const requested = Math.max(width, height);
  if (requested <= 256) return "256x256";
  if (requested <= 512) return "512x512";
  return "1024x1024";
}

function estimateCost(model: string, size: string): number {
  if (model.includes("dall-e-3")) {
    return size === "1024x1024" ? 0.04 : 0.08;
  }
  if (model.includes("dall-e-2")) {
    return size === "1024x1024" ? 0.02 : size === "512x512" ? 0.018 : 0.016;
  }
  return 0;
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
  return new AIProviderError(error instanceof Error ? error.message : "Unknown");
}
