import { z } from "zod";
const ColorRoleEnum = z.enum(["PRIMARY","SECONDARY","ACCENT","BACKGROUND","SURFACE","TEXT_PRIMARY","TEXT_SECONDARY","MUTED","BORDER","SUCCESS","WARNING","ERROR"]);
const AccessibilityEnum = z.enum(["AA_PASS","AA_FAIL","AAA_PASS"]);
export const ColorSwatchSchema = z.object({
  role: ColorRoleEnum, name: z.string().min(1),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  rgb: z.string(), hsl: z.string(), cmykApprox: z.string(),
  usage: z.string().optional(), percentage: z.number().int().min(0).max(100).optional(),
  contrastOnWhite: z.number().min(0).max(21).optional(),
  contrastOnBlack: z.number().min(0).max(21).optional(),
  accessibility: AccessibilityEnum.optional(),
  suggestedForeground: z.string().optional(),
});
export const ColorPaletteOutputSchema = z.object({
  name: z.string().min(3),
  swatches: z.array(ColorSwatchSchema).min(8).max(12),
});
export type ColorPaletteOutput = z.infer<typeof ColorPaletteOutputSchema>;
export type ColorSwatchOutput = z.infer<typeof ColorSwatchSchema>;
