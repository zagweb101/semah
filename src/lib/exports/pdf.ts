/**
 * PDF Export Service using pdf-lib + @pdf-lib/fontkit.
 * Generates Arabic RTL Brand Book + Brand Sheet PDFs.
 */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");

async function loadFont(name: string): Promise<Uint8Array> {
  const fp = path.join(FONT_DIR, name);
  await fs.access(fp);
  return new Uint8Array(await fs.readFile(fp));
}

const VIOLET = rgb(0.43, 0.29, 1.0);
const OBSIDIAN = rgb(0.08, 0.07, 0.10);
const MUTED = rgb(0.45, 0.43, 0.48);
const LIGHT_BORDER = rgb(0.89, 0.87, 0.83);

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 50;

function hexToRgbColor(hex?: string) {
  if (!hex) return VIOLET;
  const c = hex.replace("#", "").trim();
  if (c.length !== 6) return VIOLET;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return VIOLET;
  return rgb(r / 255, g / 255, b / 255);
}

export interface BrandBookSectionInput { type: string; title: string; content: Record<string, unknown>; hidden: boolean; order: number; }
export interface BrandBookPdfInput { projectName: string; projectNameEn?: string; layout: string; sections: BrandBookSectionInput[]; colors?: { primary?: string; secondary?: string; accent?: string; }; }
export interface BrandSheetPdfInput { projectName: string; template: string; fields: { logo?: string; primaryColor?: string; secondaryColor?: string; accentColor?: string; arabicFont?: string; englishFont?: string; personality?: string[]; keywords?: string[]; imageStyle?: string; usageExamples?: string[]; }; }

async function getFonts(pdfDoc: PDFDocument) {
  try {
    const regular = await pdfDoc.embedFont(await loadFont("Arabic-Regular.ttf"), { subset: true });
    const bold = await pdfDoc.embedFont(await loadFont("Arabic-Bold.ttf"), { subset: true });
    return { regular, bold };
  } catch {
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    return { regular, bold };
  }
}

export async function generateBrandBookPdf(input: BrandBookPdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  pdfDoc.setTitle(`Brand Book — ${input.projectName}`);
  pdfDoc.setAuthor("SEMAH AI Brand Studio");
  const { regular: regularFont, bold: boldFont } = await getFonts(pdfDoc);
  const primaryColor = hexToRgbColor(input.colors?.primary);

  const cover = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  cover.drawRectangle({ x: 0, y: A4_HEIGHT - 200, width: A4_WIDTH, height: 200, color: primaryColor });
  const mark = input.projectName.charAt(0);
  cover.drawText(mark, { x: A4_WIDTH / 2 - boldFont.widthOfTextAtSize(mark, 72) / 2, y: A4_HEIGHT - 130, size: 72, font: boldFont, color: rgb(1, 1, 1) });
  cover.drawText(input.projectName, { x: A4_WIDTH / 2 - boldFont.widthOfTextAtSize(input.projectName, 40) / 2, y: A4_HEIGHT - 180, size: 40, font: boldFont, color: rgb(1, 1, 1) });
  const label = "Brand Book";
  cover.drawText(label, { x: A4_WIDTH / 2 - boldFont.widthOfTextAtSize(label, 24) / 2, y: A4_HEIGHT - 280, size: 24, font: boldFont, color: OBSIDIAN });

  const visible = input.sections.filter((s) => !s.hidden);
  for (let i = 0; i < visible.length; i++) {
    const section = visible[i];
    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    let y = A4_HEIGHT - MARGIN;
    const num = String(i + 1).padStart(2, "0");
    page.drawText(num, { x: A4_WIDTH - MARGIN - regularFont.widthOfTextAtSize(num, 9), y, size: 9, font: regularFont, color: MUTED });
    y -= 30;
    page.drawText(section.title, { x: A4_WIDTH - MARGIN - boldFont.widthOfTextAtSize(section.title, 24), y, size: 24, font: boldFont, color: OBSIDIAN });
    y -= 50;
    const c = section.content;
    if (c.body) {
      const text = String(c.body);
      page.drawText(text, { x: A4_WIDTH - MARGIN - regularFont.widthOfTextAtSize(text, 12), y, size: 12, font: regularFont, color: OBSIDIAN });
    }
  }

  const back = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  back.drawRectangle({ x: 0, y: 0, width: A4_WIDTH, height: 200, color: primaryColor });
  back.drawText("Thank You", { x: A4_WIDTH / 2 - boldFont.widthOfTextAtSize("Thank You", 28) / 2, y: 130, size: 28, font: boldFont, color: rgb(1, 1, 1) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateBrandSheetPdf(input: BrandSheetPdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  pdfDoc.setTitle(`Brand Sheet — ${input.projectName}`);
  pdfDoc.setAuthor("SEMAH AI Brand Studio");
  const { regular: regularFont, bold: boldFont } = await getFonts(pdfDoc);

  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  let y = A4_HEIGHT - MARGIN;
  const name = input.projectName;
  page.drawText(name, { x: A4_WIDTH / 2 - boldFont.widthOfTextAtSize(name, 36) / 2, y, size: 36, font: boldFont, color: OBSIDIAN });
  y -= 60;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: A4_WIDTH - MARGIN, y }, thickness: 1, color: LIGHT_BORDER });
  y -= 40;

  const f = input.fields;
  if (f.primaryColor || f.secondaryColor || f.accentColor) {
    page.drawText("Colors", { x: A4_WIDTH - MARGIN - boldFont.widthOfTextAtSize("Colors", 11), y, size: 11, font: boldFont, color: MUTED });
    y -= 30;
    const colors = [{ label: "Primary", hex: f.primaryColor }, { label: "Secondary", hex: f.secondaryColor }, { label: "Accent", hex: f.accentColor }].filter((c) => c.hex);
    const swatchSize = 70, gap = 20;
    let x = A4_WIDTH - MARGIN - swatchSize;
    for (const col of colors) {
      page.drawRectangle({ x, y: y - swatchSize, width: swatchSize, height: swatchSize, color: hexToRgbColor(col.hex) });
      page.drawText(col.label, { x: x + swatchSize / 2 - boldFont.widthOfTextAtSize(col.label, 9) / 2, y: y - swatchSize - 15, size: 9, font: boldFont, color: OBSIDIAN });
      x -= swatchSize + gap;
    }
    y -= swatchSize + 40;
  }
  if (f.personality?.length) {
    page.drawText("Personality", { x: A4_WIDTH - MARGIN - boldFont.widthOfTextAtSize("Personality", 11), y, size: 11, font: boldFont, color: MUTED });
    y -= 25;
    const tags = f.personality.join(" · ");
    page.drawText(tags, { x: A4_WIDTH - MARGIN - regularFont.widthOfTextAtSize(tags, 13), y, size: 13, font: regularFont, color: VIOLET });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
