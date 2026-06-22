export interface ContrastResult { ratio: number; level: "AA_PASS" | "AA_FAIL" | "AAA_PASS"; suggestedForeground: string; }

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function evaluateColor(hex: string): ContrastResult {
  const onWhite = contrastRatio(hex, "#FFFFFF");
  const onBlack = contrastRatio(hex, "#000000");
  const bestRatio = Math.max(onWhite, onBlack);
  const suggestedForeground = onWhite >= onBlack ? "#FFFFFF" : "#000000";
  let level: ContrastResult["level"] = "AA_FAIL";
  if (bestRatio >= 7) level = "AAA_PASS";
  else if (bestRatio >= 4.5) level = "AA_PASS";
  return { ratio: Math.round(bestRatio * 100) / 100, level, suggestedForeground };
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const rL = channelLuminance(r / 255);
  const gL = channelLuminance(g / 255);
  const bL = channelLuminance(b / 255);
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

function channelLuminance(c: number): number {
  if (c <= 0.03928) return c / 12.92;
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace("#", "");
  return { r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN: h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6; break;
      case gN: h = ((bN - rN) / d + 2) / 6; break;
      case bN: h = ((rN - gN) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hexToCmyk(hex: string): { c: number; m: number; y: number; k: number } {
  const { r, g, b } = hexToRgb(hex);
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const k = 1 - Math.max(rN, gN, bN);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rN - k) / (1 - k)) * 100),
    m: Math.round(((1 - gN - k) / (1 - k)) * 100),
    y: Math.round(((1 - bN - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}
