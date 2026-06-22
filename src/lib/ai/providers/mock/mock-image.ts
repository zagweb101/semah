import type { ImageAIProvider, ImageGenerationInput, ImageGenerationResult, GeneratedImage, ProviderHealth } from "@/lib/ai/core/types";
import { logPrompt } from "@/lib/ai/core/logger";

const PALETTE = ["#6D4AFF", "#F46F5E", "#C99A3D", "#238B68", "#4F35C7"];

export class MockImageProvider implements ImageAIProvider {
  readonly name = "mock";

  async generateImages(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    logPrompt("mock-image", { prompt: input.prompt.slice(0, 200), count: input.count });
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));
    const images: GeneratedImage[] = Array.from({ length: input.count }).map((_, i) => ({
      url: generatePlaceholder(input.width, input.height, i, input.prompt),
      provider: this.name, model: "mock-image-v1",
      generationId: `mock-img-${Date.now()}-${i}`, revisedPrompt: input.prompt,
    }));
    return { images, estimatedCost: 0 };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return { status: "healthy", lastCheckedAt: new Date(), latencyMs: 0 };
  }
}

function generatePlaceholder(w: number, h: number, index: number, prompt: string): string {
  const color = PALETTE[index % PALETTE.length];
  const truncated = prompt.slice(0, 60).replace(/[<>&"']/g, "");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><defs><linearGradient id='g${index}' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:${color};stop-opacity:0.18'/><stop offset='100%' style='stop-color:${color};stop-opacity:0.06'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g${index})'/><rect x='1' y='1' width='${w - 2}' height='${h - 2}' fill='none' stroke='${color}' stroke-width='1' stroke-dasharray='4 4' opacity='0.3'/><text x='50%' y='46%' text-anchor='middle' fill='${color}' font-family='sans-serif' font-size='22' font-weight='bold'>SEMAH Mock</text><text x='50%' y='56%' text-anchor='middle' fill='#746F7B' font-family='sans-serif' font-size='14'>${truncated}</text><text x='50%' y='${h - 20}' text-anchor='middle' fill='#9B95A5' font-family='sans-serif' font-size='11'>${w}×${h}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
