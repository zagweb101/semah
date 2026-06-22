import brandStrategyFixture from "./fixtures/brand-strategy.json";
import visualDirectionsFixture from "./fixtures/visual-directions.json";
import colorPaletteFixture from "./fixtures/color-palette.json";
import typographyFixture from "./fixtures/typography.json";
import logoConceptsFixture from "./fixtures/logo-concepts.json";
import brandSheetFixture from "./fixtures/brand-sheet.json";
import brandBookFixture from "./fixtures/brand-book.json";

const FIXTURES: Record<string, unknown> = {
  BRAND_STRATEGY: brandStrategyFixture,
  AUDIENCE_PERSONAS: brandStrategyFixture,
  VISUAL_DIRECTIONS: visualDirectionsFixture,
  COLOR_PALETTE: colorPaletteFixture,
  TYPOGRAPHY_SYSTEM: typographyFixture,
  LOGO_CONCEPTS: logoConceptsFixture,
  BRAND_SHEET: brandSheetFixture,
  BRAND_BOOK: brandBookFixture,
};

export function loadFixture(generationType?: string, metadata?: Record<string, unknown>): unknown {
  if (!generationType) return { message: "Mock response" };
  const fixture = FIXTURES[generationType];
  if (!fixture) return { message: `Mock response for ${generationType}`, metadata, generatedAt: new Date().toISOString() };
  const projectName = metadata?.projectName as string | undefined;
  if (projectName && typeof fixture === "object" && fixture !== null) {
    return JSON.parse(JSON.stringify(fixture).replace(/\{\{projectName\}\}/g, projectName));
  }
  return fixture;
}
