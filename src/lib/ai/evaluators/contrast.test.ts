import { describe, it, expect } from "vitest";
import { contrastRatio, evaluateColor, hexToRgb, rgbToHex, hexToHsl, hexToCmyk } from "./contrast";

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it("returns 1 for identical colors", () => {
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 1);
  });
});

describe("evaluateColor", () => {
  it("suggests black for light colors", () => {
    const result = evaluateColor("#FFFFFF");
    expect(result.suggestedForeground).toBe("#000000");
    expect(result.level).toBe("AAA_PASS");
  });

  it("suggests white for dark colors", () => {
    const result = evaluateColor("#000000");
    expect(result.suggestedForeground).toBe("#FFFFFF");
    expect(result.level).toBe("AAA_PASS");
  });
});

describe("hexToRgb", () => {
  it("converts hex to rgb", () => {
    expect(hexToRgb("#FF5733")).toEqual({ r: 255, g: 87, b: 51 });
  });
});

describe("rgbToHex", () => {
  it("converts rgb to uppercase hex", () => {
    expect(rgbToHex(255, 87, 51)).toBe("#FF5733");
  });
});

describe("hexToHsl", () => {
  it("converts pure red to hsl", () => {
    expect(hexToHsl("#FF0000")).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("converts white to hsl", () => {
    expect(hexToHsl("#FFFFFF")).toEqual({ h: 0, s: 0, l: 100 });
  });
});

describe("hexToCmyk", () => {
  it("converts pure red to cmyk", () => {
    expect(hexToCmyk("#FF0000")).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });

  it("converts black to cmyk", () => {
    expect(hexToCmyk("#000000")).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });
});
