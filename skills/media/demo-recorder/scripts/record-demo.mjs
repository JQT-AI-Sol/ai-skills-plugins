#!/usr/bin/env node
/**
 * Demo recorder - Playwright video recording script template.
 *
 * Usage:
 *   node record-demo.mjs [--scenario <name>] [--out <dir>] [--concat]
 *
 * Environment:
 *   Requires `playwright` npm package (installed locally or globally).
 *   Requires `ffmpeg` for MP4 conversion and concatenation.
 */
import { chromium } from "playwright";
import { resolve, basename } from "path";
import { rename, writeFile } from "fs/promises";
import { execFileSync } from "child_process";

// ─── Configuration (to be customised per project) ──────────────────
const CONFIG = {
  baseUrl: process.env.DEMO_BASE_URL || "http://localhost:3000",
  viewport: { width: 1280, height: 1200 },
  slowMo: 350,
  outDir: process.env.DEMO_OUT_DIR || "/tmp/demo-videos",
  // キャプションのスタイル設定 (CSS値)
  captions: {
    fontSize: "28px",
    fontColor: "#ffffff",
    bgColor: "rgba(0, 0, 0, 0.75)",
    bold: true,
    padding: "12px 28px",
    borderRadius: "8px",
    bottom: "40px",          // 下端からの距離
  },
};

/**
 * Define scenarios here. Each scenario is an object with:
 *   name  - short kebab-case identifier (used as filename)
 *   label - human-readable description
 *   run   - async function(page, caption) implementing the browser steps
 *           caption.show(text) / caption.hide() でテキストオーバーレイを制御
 */
const SCENARIOS = [
  // {
  //   name: "example-flow",
  //   label: "Example user flow",
  //   async run(page, caption) {
  //     await caption.show("ログインページを開く");
  //     await page.goto(`${CONFIG.baseUrl}/login`);
  //     await page.waitForLoadState("networkidle");
  //     await page.waitForTimeout(1500);
  //
  //     await caption.show("メールアドレスを入力");
  //     await page.fill('#email', 'user@example.com');
  //     await page.waitForTimeout(1500);
  //
  //     await caption.show("送信ボタンをクリック");
  //     await page.click('button[type="submit"]');
  //     await page.waitForTimeout(2000);
  //
  //     await caption.hide();
  //   },
  // },
];

// ─── Caption overlay (DOM injection) ────────────────────────────────

function createCaptionHelpers(page) {
  const { fontSize, fontColor, bgColor, bold, padding, borderRadius, bottom } = CONFIG.captions;
  const fontWeight = bold ? "bold" : "normal";

  return {
    async show(text) {
      await page.evaluate(
        ({ text, style }) => {
          let el = document.getElementById("__demo-caption");
          if (!el) {
            el = document.createElement("div");
            el.id = "__demo-caption";
            Object.assign(el.style, {
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: "2147483647",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              transition: "opacity 0.2s ease",
              ...style,
            });
            document.body.appendChild(el);
          }
          el.textContent = text;
          el.style.opacity = "1";
          el.style.display = "block";
        },
        {
          text,
          style: {
            fontSize,
            color: fontColor,
            backgroundColor: bgColor,
            fontWeight,
            padding,
            borderRadius,
            bottom,
          },
        },
      );
    },

    async hide() {
      await page.evaluate(() => {
        const el = document.getElementById("__demo-caption");
        if (el) el.style.display = "none";
      });
    },
  };
}

// ─── Core recording logic (do not modify) ──────────────────────────

async function recordScenario(browser, scenario, index, total) {
  const prefix = `[${index + 1}/${total} ${scenario.name}]`;
  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    recordVideo: {
      dir: CONFIG.outDir,
      size: CONFIG.viewport,
    },
  });
  const page = await context.newPage();
  const caption = createCaptionHelpers(page);

  try {
    console.log(`${prefix} Recording...`);
    await scenario.run(page, caption);
    console.log(`${prefix} Done`);
  } catch (err) {
    console.error(`${prefix} Error:`, err.message);
  } finally {
    await page.waitForTimeout(1000);
    const videoPath = await page.video().path();
    await context.close();

    const dest = resolve(CONFIG.outDir, `${scenario.name}.webm`);
    try {
      await rename(videoPath, dest);
    } catch {
      /* already renamed or same path */
    }
    console.log(`${prefix} Video: ${dest}`);
    return dest;
  }
}

function toMp4(webmPath) {
  const mp4Path = webmPath.replace(/\.webm$/, ".mp4");
  execFileSync("ffmpeg", [
    "-y", "-i", webmPath,
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    mp4Path,
  ], { stdio: "ignore" });
  console.log(`  Converted: ${basename(mp4Path)}`);
  return mp4Path;
}

async function concatMp4s(mp4Paths, outputName = "demo-all.mp4") {
  const listFile = resolve(CONFIG.outDir, "concat.txt");
  const content = mp4Paths.map((p) => `file '${basename(p)}'`).join("\n");
  await writeFile(listFile, content);

  const outPath = resolve(CONFIG.outDir, outputName);
  execFileSync("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0",
    "-i", listFile,
    "-c", "copy",
    outPath,
  ], { stdio: "ignore" });
  console.log(`  Concatenated: ${outPath}`);
  return outPath;
}

// ─── CLI ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const scenarioFilter = args.includes("--scenario")
    ? args[args.indexOf("--scenario") + 1]
    : null;
  const shouldConcat = args.includes("--concat");

  if (args.includes("--out")) {
    CONFIG.outDir = args[args.indexOf("--out") + 1];
  }

  execFileSync("mkdir", ["-p", CONFIG.outDir]);

  let scenarios = SCENARIOS;
  if (scenarioFilter) {
    scenarios = SCENARIOS.filter((s) => s.name === scenarioFilter);
    if (scenarios.length === 0) {
      console.error(`Scenario "${scenarioFilter}" not found.`);
      console.error("Available:", SCENARIOS.map((s) => s.name).join(", "));
      process.exit(1);
    }
  }

  if (scenarios.length === 0) {
    console.error("No scenarios defined. Edit SCENARIOS in this script.");
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: CONFIG.slowMo,
  });

  const webmPaths = [];
  for (let i = 0; i < scenarios.length; i++) {
    const path = await recordScenario(browser, scenarios[i], i, scenarios.length);
    webmPaths.push(path);
  }
  await browser.close();

  console.log("\nConverting to MP4...");
  const mp4Paths = webmPaths.map(toMp4);

  if (shouldConcat && mp4Paths.length > 1) {
    console.log("\nConcatenating...");
    await concatMp4s(mp4Paths);
  }

  console.log(`\nAll videos saved to: ${CONFIG.outDir}/`);
}

main().catch(console.error);
