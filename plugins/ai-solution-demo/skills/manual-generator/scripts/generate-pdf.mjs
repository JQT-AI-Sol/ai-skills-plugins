#!/usr/bin/env node
/**
 * Manual PDF Generator
 * スクリーンショット + 手順テキストからA4 PDFマニュアルを生成
 *
 * Usage:
 *   node generate-pdf.mjs --config manual-config.json --out output.pdf
 *
 * Config JSON format:
 * {
 *   "title": "操作マニュアル",
 *   "subtitle": "機能フロー説明",
 *   "company": "JQIT株式会社",
 *   "date": "2026年2月28日",
 *   "system": "LAbel（https://label.jqit.co.jp）",
 *   "accentColor": "#319795",
 *   "screenshotsDir": "/tmp/my-project/screenshots",
 *   "sections": [
 *     {
 *       "title": "1. ログイン",
 *       "steps": [
 *         { "img": "01-login", "text": "メールアドレスとパスワードを入力してログインします。" }
 *       ]
 *     }
 *   ]
 * }
 */
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { resolve } from "path";

// --- CLI args ---
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
}

const configPath = getArg("--config");
const outPath = getArg("--out") || "manual.pdf";

if (!configPath) {
  console.error("Usage: node generate-pdf.mjs --config <config.json> [--out <output.pdf>]");
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, "utf-8"));
const ssDir = config.screenshotsDir || ".";
const accent = config.accentColor || "#319795";

function imgBase64(name) {
  const buf = readFileSync(resolve(ssDir, `${name}.png`));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

// --- HTML generation ---
let html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8">
<style>
  @page { size: A4; margin: 12mm 14mm 15mm 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Hiragino Sans", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif;
    color: #1a202c; line-height: 1.6; font-size: 10pt; margin: 0; padding: 0;
  }
  .cover {
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    height: 90vh; text-align: center; page-break-after: always;
  }
  .cover h1 { font-size: 26pt; color: ${accent}; margin-bottom: 8px; line-height: 1.3; }
  .cover .subtitle { font-size: 13pt; color: #4a5568; margin-bottom: 36px; }
  .cover .meta { font-size: 9pt; color: #718096; line-height: 1.8; }
  .section-title {
    font-size: 15pt; color: ${accent}; border-bottom: 3px solid ${accent};
    padding-bottom: 5px; margin-top: 8px; margin-bottom: 12px; page-break-after: avoid;
  }
  .step { margin-bottom: 14px; page-break-inside: avoid; }
  .step-text {
    font-size: 9.5pt; color: #2d3748; margin-bottom: 6px; white-space: pre-line;
    background: #f7fafc; border-left: 3px solid ${accent}; padding: 7px 10px;
    border-radius: 3px; line-height: 1.6; page-break-after: avoid;
  }
  .step img {
    width: 100%; max-height: 360px; object-fit: contain; object-position: top left;
    border: 1px solid #e2e8f0; border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: block;
  }
  .footer { text-align: center; font-size: 7.5pt; color: #a0aec0; margin-top: 20px; }
</style>
</head>
<body>

<div class="cover">
  <h1>${config.title || "操作マニュアル"}</h1>
  <div class="subtitle">${config.subtitle || ""}</div>
  <div class="meta">
    ${config.company || ""}<br>
    ${config.date ? `作成日: ${config.date}` : ""}<br>
    ${config.system ? `対象システム: ${config.system}` : ""}
  </div>
</div>
`;

for (const sec of config.sections) {
  html += `<h2 class="section-title">${sec.title}</h2>\n`;
  for (const step of sec.steps) {
    html += `<div class="step">\n`;
    html += `  <div class="step-text">${step.text}</div>\n`;
    if (step.img) {
      html += `  <img src="${imgBase64(step.img)}" />\n`;
    }
    html += `</div>\n`;
  }
}

html += `
<div class="footer">${config.title || "操作マニュアル"} &copy; ${new Date().getFullYear()} ${config.company || ""}</div>
</body></html>`;

// --- HTML → PDF ---
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({
  path: outPath,
  format: "A4",
  margin: { top: "12mm", bottom: "15mm", left: "14mm", right: "14mm" },
  printBackground: true,
});
await browser.close();
console.log(`PDF generated: ${outPath}`);
