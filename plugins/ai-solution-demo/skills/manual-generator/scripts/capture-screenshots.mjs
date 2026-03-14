#!/usr/bin/env node
/**
 * Screenshot Capture Template for Manual Generator
 *
 * Usage:
 *   node capture-screenshots.mjs [--scenario <name>]
 *
 * Customize CONFIG, login(), and SCENARIOS for each project.
 */
import { chromium } from "playwright";

// ─── Configuration (customize per project) ──────────────────────
const CONFIG = {
  baseUrl: process.env.MANUAL_BASE_URL || "http://localhost:3000",
  viewport: { width: 1280, height: 800 },
  outDir: process.env.MANUAL_SS_DIR || "/tmp/manual-screenshots",
};

// ─── Helper: screenshot ─────────────────────────────────────────
async function ss(page, name) {
  await page.waitForTimeout(600);
  await page.screenshot({
    path: `${CONFIG.outDir}/${name}.png`,
    fullPage: false,
  });
  console.log(`  Screenshot: ${name}`);
}

// ─── Helper: login (customize per project) ──────────────────────
async function login(page) {
  await page.goto(`${CONFIG.baseUrl}/login`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.fill('#email', 'user@example.com');
  await page.fill('#password', 'password');
  await ss(page, "01-login");
  await page.getByRole("button", { name: /ログイン|Login/ }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
}

// ─── Scenarios ──────────────────────────────────────────────────
const SCENARIOS = [
  // {
  //   name: "basic-flow",
  //   label: "基本フロー",
  //   async run(page) {
  //     await login(page);
  //     await page.goto(`${CONFIG.baseUrl}/some-page`);
  //     await page.waitForLoadState("networkidle");
  //     await ss(page, "02-page-view");
  //     // ... more steps
  //   },
  // },
];

// ─── Core ───────────────────────────────────────────────────────
import { execFileSync } from "child_process";

async function main() {
  const args = process.argv.slice(2);
  const scenarioFilter = args.includes("--scenario")
    ? args[args.indexOf("--scenario") + 1]
    : null;

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

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: CONFIG.viewport });
  const page = await context.newPage();

  for (const scenario of scenarios) {
    console.log(`[${scenario.name}] Capturing...`);
    try {
      await scenario.run(page);
      console.log(`[${scenario.name}] Done`);
    } catch (err) {
      console.error(`[${scenario.name}] Error:`, err.message);
    }
  }

  await browser.close();
  console.log(`\nAll screenshots saved to: ${CONFIG.outDir}/`);
}

main().catch(console.error);
