import type { z } from "zod";

export type HealthStatus = "healthy" | "degraded" | "down" | "unknown";

export interface ProviderHealth {
  status: HealthStatus;
  lastCheckedAt: Date;
  message?: string;
  latencyMs?: number;
}

export interface TextGenerationInput {
  systemPrompt: string;
  userPrompt: string;
  outputSchema?: z.ZodTypeAny;
  temperature?: number;
  maxTokens?: number;
  locale: "ar" | "en";
  metadata?: Record<string, unknown>;
}

export interface TextGenerationResult {
  content: string;
  structuredData?: unknown;
  tokensIn: number;
  tokensOut: number;
  finishReason: string;
  model: string;
  provider: string;
  promptVersion: string;
}

export interface StructuredGenerationInput<T> extends Omit<TextGenerationInput, "outputSchema"> {
  outputSchema: z.ZodType<T>;
}

export interface StructuredGenerationResult<T> extends Omit<TextGenerationResult, "structuredData"> {
  structuredData: T;
}

export interface ImageGenerationInput {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  count: number;
  style?: string;
  seed?: number;
}

export interface GeneratedImage {
  url: string;
  provider: string;
  model: string;
  generationId: string;
  revisedPrompt?: string;
}

export interface ImageGenerationResult {
  images: GeneratedImage[];
  estimatedCost: number;
}

export interface TextAIProvider {
  readonly name: string;
  generateText(input: TextGenerationInput): Promise<TextGenerationResult>;
  generateStructuredData<T>(input: StructuredGenerationInput<T>): Promise<StructuredGenerationResult<T>>;
  healthCheck(): Promise<ProviderHealth>;
}

export interface ImageAIProvider {
  readonly name: string;
  generateImages(input: ImageGenerationInput): Promise<ImageGenerationResult>;
  healthCheck(): Promise<ProviderHealth>;
}
