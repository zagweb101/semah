import type { TextAIProvider, ImageAIProvider } from "@/lib/ai/core/types";
import { MockTextProvider } from "./mock/mock-text";
import { MockImageProvider } from "./mock/mock-image";
import { OpenAICompatibleTextProvider } from "./openai-compatible/openai-text";
import { OpenAICompatibleImageProvider } from "./openai-compatible/openai-image";
import { getMockMode } from "@/lib/ai/utils";

let _text: TextAIProvider | null = null;
let _image: ImageAIProvider | null = null;

export function getTextProvider(): TextAIProvider {
  if (_text) return _text;
  if (getMockMode()) { _text = new MockTextProvider(); return _text; }
  const provider = process.env.AI_TEXT_PROVIDER ?? "openai-compatible";
  const apiKey = process.env.AI_TEXT_API_KEY ?? process.env.OPENAI_API_KEY;
  const model = process.env.AI_TEXT_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  if (!apiKey) { console.warn("[AI] No API key — using Mock"); _text = new MockTextProvider(); return _text; }
  if (provider === "openai-compatible") {
    _text = new OpenAICompatibleTextProvider({ apiKey, baseUrl: process.env.AI_TEXT_BASE_URL, model, timeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 120000) });
    return _text;
  }
  throw new Error(`Unknown AI_TEXT_PROVIDER: ${provider}`);
}

export function getImageProvider(): ImageAIProvider {
  if (_image) return _image;
  if (getMockMode()) { _image = new MockImageProvider(); return _image; }
  const provider = process.env.AI_IMAGE_PROVIDER ?? "mock";
  if (provider === "mock") { _image = new MockImageProvider(); return _image; }
  if (provider === "openai-compatible" || provider === "openai") {
    const apiKey = process.env.AI_IMAGE_API_KEY ?? process.env.OPENAI_API_KEY;
    const model = process.env.AI_IMAGE_MODEL ?? "dall-e-3";
    if (!apiKey) { console.warn("[AI] No image API key — using Mock"); _image = new MockImageProvider(); return _image; }
    _image = new OpenAICompatibleImageProvider({ apiKey, baseUrl: process.env.AI_IMAGE_BASE_URL, model, timeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 120000) });
    return _image;
  }
  throw new Error(`AI_IMAGE_PROVIDER=${provider} not yet implemented. Use 'mock' or 'openai-compatible'.`);
}

export function _resetProviders(): void { _text = null; _image = null; }
