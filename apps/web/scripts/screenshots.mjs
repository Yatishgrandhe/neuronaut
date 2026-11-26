// Responsive viewport screenshots of the home page. Usage: node scripts/screenshots.mjs [baseUrl]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3210";
const OUT = path.resolve("screenshots");
const SIZES = [[360, 780], [390, 844], [768, 1024], [1024, 768], [1280, 800], [1280, 720], [1440, 900], [1920, 1080]];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];
for (const [width, height] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("nn_intro", "1"); } catch {} });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${width}: ${m.text().slice(0, 200)}`); });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector(".he")?.dataset.ready === "true", null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) errors.push(`${width}: horizontal overflow ${overflow}px`);
  await page.screenshot({ path: path.join(OUT, `${width}x${height}.png`) });
  if (width === 1440 || width === 390) await page.screenshot({ path: path.join(OUT, `${width}-full.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "no console errors/warnings, no horizontal overflow");
