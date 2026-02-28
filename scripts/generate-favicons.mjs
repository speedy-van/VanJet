/**
 * Generate favicon assets from brand SVGs.
 * Source: public/images/icon-192.svg (VJ logo #1D4ED8)
 * Outputs: favicon.ico (16,32,48), icon.png (48), apple-touch-icon.png (180)
 *
 * Run: node scripts/generate-favicons.mjs
 * Requires: npm install --save-dev sharp to-ico
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SRC_SVG = path.join(PUBLIC, "images", "icon-192.svg");

async function main() {
  if (!fs.existsSync(SRC_SVG)) {
    console.error("Source not found:", SRC_SVG);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SRC_SVG);

  // Resize SVG to PNG at various sizes
  const sizes = {
    ico: [16, 32, 48],
    iconPng: 48,
    appleTouch: 180,
  };

  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();

  // favicon.ico: multi-size 16, 32, 48
  const icoBuffer = await toIco([png16, png32, png48]);
  const faviconPath = path.join(PUBLIC, "favicon.ico");
  fs.writeFileSync(faviconPath, icoBuffer);

  // icon.png: 48x48
  const iconPath = path.join(PUBLIC, "icon.png");
  fs.writeFileSync(iconPath, png48);

  // apple-touch-icon.png: 180x180
  const applePath = path.join(PUBLIC, "apple-touch-icon.png");
  fs.writeFileSync(applePath, png180);

  // Report
  const report = [
    { file: "public/favicon.ico", bytes: icoBuffer.length, sizes: "16, 32, 48" },
    { file: "public/icon.png", bytes: png48.length, sizes: "48×48" },
    { file: "public/apple-touch-icon.png", bytes: png180.length, sizes: "180×180" },
  ];
  console.log("Generated favicon assets from public/images/icon-192.svg:\n");
  report.forEach(({ file, bytes, sizes }) => {
    console.log(`  ${file}  ${bytes} bytes  (${sizes})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
