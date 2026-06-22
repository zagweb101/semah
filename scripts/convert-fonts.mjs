import * as wawoff2 from "wawoff2";
import { promises as fs } from "fs";
import path from "path";

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const sources = [
  { url: "https://cdn.jsdelivr.net/npm/@fontsource/reem-kufi@5.0.13/files/reem-kufi-arabic-400-normal.woff2", out: "Arabic-Regular.ttf" },
  { url: "https://cdn.jsdelivr.net/npm/@fontsource/reem-kufi@5.0.13/files/reem-kufi-arabic-700-normal.woff2", out: "Arabic-Bold.ttf" },
];

for (const s of sources) {
  console.log(`Downloading ${s.url}...`);
  const res = await fetch(s.url);
  if (!res.ok) { console.error(`Failed: ${res.status}`); continue; }
  const woff2Buffer = new Uint8Array(await res.arrayBuffer());
  const ttfBuffer = await wawoff2.decompress(woff2Buffer);
  const ttfPath = path.join(FONT_DIR, s.out);
  await fs.writeFile(ttfPath, ttfBuffer);
  console.log(`✓ ${ttfPath} (${ttfBuffer.length} bytes)`);
}
