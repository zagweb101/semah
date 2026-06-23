/**
 * PDF Export Service using pdf-lib + @pdf-lib/fontkit.
 * Generates Arabic RTL Brand Book + Brand Sheet PDFs.
 */
import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts } from "pdf-lib";
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
  const primaryColor = hexToRgbColor(input.fields.primaryColor);

  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  let y = A4_HEIGHT - MARGIN;

  // Header: initial mark + project name
  const mark = input.projectName.charAt(0);
  page.drawCircle({ x: A4_WIDTH - MARGIN - 30, y: y - 30, size: 30, color: primaryColor });
  page.drawText(mark, { x: A4_WIDTH - MARGIN - 30 - boldFont.widthOfTextAtSize(mark, 28) / 2, y: y - 40, size: 28, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText(input.projectName, { x: A4_WIDTH - MARGIN - 80 - boldFont.widthOfTextAtSize(input.projectName, 28), y: y - 30, size: 28, font: boldFont, color: OBSIDIAN });
  y -= 90;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: A4_WIDTH - MARGIN, y }, thickness: 1, color: LIGHT_BORDER });
  y -= 35;

  const f = input.fields;
  const rightX = A4_WIDTH - MARGIN;

  // Colors
  if (f.primaryColor || f.secondaryColor || f.accentColor) {
    y = drawRTLText(page, "الألوان", rightX, y, { font: boldFont, size: 13, color: MUTED, lineHeight: 18 });
    y -= 8;
    const colors: { label: string; hex?: string }[] = [
      { label: "أساسي", hex: f.primaryColor },
      { label: "ثانوي", hex: f.secondaryColor },
      { label: "تمييز", hex: f.accentColor },
    ].filter((c) => c.hex);
    const swatchSize = 64;
    const gap = 18;
    let x = rightX - swatchSize;
    for (const col of colors) {
      page.drawRectangle({ x, y: y - swatchSize, width: swatchSize, height: swatchSize, color: hexToRgbColor(col.hex), borderColor: LIGHT_BORDER, borderWidth: 1 });
      page.drawText(col.label, { x: x + swatchSize / 2 - regularFont.widthOfTextAtSize(col.label, 8) / 2, y: y - swatchSize - 14, size: 8, font: regularFont, color: OBSIDIAN });
      page.drawText(col.hex!, { x: x + swatchSize / 2 - regularFont.widthOfTextAtSize(col.hex!, 8) / 2, y: y - swatchSize - 26, size: 8, font: regularFont, color: MUTED });
      x -= swatchSize + gap;
    }
    y -= swatchSize + 50;
  }

  // Fonts
  if (f.arabicFont || f.englishFont) {
    y = drawRTLText(page, "الخطوط", rightX, y, { font: boldFont, size: 13, color: MUTED, lineHeight: 18 });
    y -= 8;
    if (f.arabicFont) y = drawRTLText(page, `عربي: ${f.arabicFont}`, rightX, y, { font: regularFont, size: 12, color: OBSIDIAN, lineHeight: 18 });
    if (f.englishFont) y = drawRTLText(page, `إنجليزي: ${f.englishFont}`, rightX, y, { font: regularFont, size: 12, color: OBSIDIAN, lineHeight: 18 });
    y -= 18;
  }

  // Personality
  if (f.personality?.length) {
    y = drawRTLText(page, "شخصية العلامة", rightX, y, { font: boldFont, size: 13, color: MUTED, lineHeight: 18 });
    y -= 10;
    const tagHeight = 22;
    let x = rightX;
    for (const tag of f.personality) {
      const tagWidth = regularFont.widthOfTextAtSize(tag, 10) + 16;
      if (x - tagWidth < MARGIN) { x = rightX; y -= tagHeight + 8; }
      x -= tagWidth;
      page.drawRectangle({ x, y: y - tagHeight, width: tagWidth, height: tagHeight, color: primaryColor, opacity: 0.12, borderColor: primaryColor, borderWidth: 0.5 });
      page.drawText(tag, { x: x + 8, y: y - tagHeight + 6, size: 10, font: regularFont, color: primaryColor });
    }
    y -= tagHeight + 22;
  }

  // Keywords
  if (f.keywords?.length) {
    y = drawRTLText(page, "كلمات مفتاحية", rightX, y, { font: boldFont, size: 13, color: MUTED, lineHeight: 18 });
    y -= 6;
    y = drawRTLText(page, f.keywords.join(" · "), rightX, y, { font: regularFont, size: 12, color: OBSIDIAN, lineHeight: 18, maxWidth: A4_WIDTH - MARGIN * 2 });
    y -= 14;
  }

  // Image style
  if (f.imageStyle) {
    y = drawRTLText(page, "أسلوب الصور", rightX, y, { font: boldFont, size: 13, color: MUTED, lineHeight: 18 });
    y -= 6;
    y = drawRTLText(page, f.imageStyle, rightX, y, { font: regularFont, size: 11, color: OBSIDIAN, lineHeight: 16, maxWidth: A4_WIDTH - MARGIN * 2 });
    y -= 14;
  }

  // Usage examples
  if (f.usageExamples?.length) {
    y = drawRTLText(page, "أمثلة استخدام", rightX, y, { font: boldFont, size: 13, color: MUTED, lineHeight: 18 });
    y -= 6;
    for (const example of f.usageExamples) {
      y = drawRTLText(page, `• ${example}`, rightX, y, { font: regularFont, size: 11, color: OBSIDIAN, lineHeight: 16, maxWidth: A4_WIDTH - MARGIN * 2 });
    }
  }

  // Footer
  page.drawText("SEMAH AI Brand Studio", { x: A4_WIDTH / 2 - regularFont.widthOfTextAtSize("SEMAH AI Brand Studio", 9) / 2, y: 30, size: 9, font: regularFont, color: MUTED });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function drawRTLText(
  page: PDFPage,
  text: string,
  rightX: number,
  startY: number,
  opts: { font: PDFFont; size: number; color: ReturnType<typeof rgb>; lineHeight: number; maxWidth?: number },
): number {
  const maxWidth = opts.maxWidth ?? A4_WIDTH - MARGIN * 2;
  const words = text.split(/\s+/);
  let line = "";
  let y = startY;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (opts.font.widthOfTextAtSize(test, opts.size) > maxWidth && line) {
      page.drawText(line, { x: rightX - opts.font.widthOfTextAtSize(line, opts.size), y, size: opts.size, font: opts.font, color: opts.color });
      line = word;
      y -= opts.lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    page.drawText(line, { x: rightX - opts.font.widthOfTextAtSize(line, opts.size), y, size: opts.size, font: opts.font, color: opts.color });
    y -= opts.lineHeight;
  }
  return y;
}
