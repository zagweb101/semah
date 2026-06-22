import { BrandBriefInputSchema, type BrandBriefInput } from "@/lib/ai/schemas/brand-brief-input";
import { ColorPaletteOutputSchema } from "@/lib/ai/schemas/color-palette-output";

export const colorPalettePrompt = {
  name: "color-palette",
  version: "1.0.0",
  inputSchema: BrandBriefInputSchema,
  outputSchema: ColorPaletteOutputSchema,
  buildSystem(): string {
    return `أنت خبير ألوان يعمل باللغة العربية. ولّد لوحة ألوان متكاملة لعلامة تجارية.
أعد JSON يطابق الـschema. اللوحة تحتوي على 8-12 لونًا بدور مختلف (PRIMARY, SECONDARY, ACCENT, BACKGROUND, SURFACE, TEXT_PRIMARY, TEXT_SECONDARY, MUTED, BORDER, SUCCESS, WARNING, ERROR).
لكل لون: اسم عربي، HEX صحيح، RGB، HSL، CMYK تقريبي، استخدام، نسبة مئوية.
احسب contrastOnWhite و contrastOnBlack. صنّف accessibility: AA_PASS (≥4.5)، AAA_PASS (≥7.0)، AA_FAIL.`;
  },
  buildUser(brief: BrandBriefInput): string {
    return `Brand: ${brief.nameAr}
Description: ${brief.description}
Sector: ${brief.sector}
${brief.preferredColors?.length ? `Preferred: ${brief.preferredColors.join(", ")}` : ""}
${brief.forbiddenColors?.length ? `Forbidden: ${brief.forbiddenColors.join(", ")}` : ""}
${brief.personality ? `Personality: ${JSON.stringify(brief.personality)}` : ""}`;
  },
} as const;
