// Captures the four real screenshots for the home page's "One lesson, step by step" section.
// Usage: start the site, then node scripts/capture-lesson-steps.mjs [baseUrl]
// Writes public/home/step-{1..4}.webp (each must stay under 150 KB).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] ?? "http://localhost:3210";
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "home");
const TMP = mkdtempSync(path.join(tmpdir(), "nn-steps-"));
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 760, height: 640 }, deviceScaleFactor: 1.5, reducedMotion: "reduce" });
await ctx.addInitScript(() => {
  try {
    sessionStorage.setItem("nn_intro", "1");
  } catch {}
});
const page = await ctx.newPage();
const shot = async (n) => {
  // Hide Next.js dev-mode badges; scroll to the top so every capture is framed the same.
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const png = path.join(TMP, `step-${n}.png`);
  await page.screenshot({ path: png });
  const webp = path.join(OUT, `step-${n}.webp`);
  execFileSync("cwebp", ["-quiet", "-q", "74", "-m", "6", "-resize", "1140", "0", png, "-o", webp]);
  const kb = Math.round(statSync(webp).size / 1024);
  console.log(`step-${n}.webp ${kb} KB${kb > 150 ? "  <-- over the 150 KB budget" : ""}`);
};

// 1. Read: the first idea card of lesson 1.
await page.goto(`${BASE}/lesson/f1-what-is-ai`, { waitUntil: "networkidle" });
await shot(1);

// 2. Answer: the first question with an option chosen.
for (let i = 0; i < 2; i++) await page.locator(".cards-actions .btn-spark").click();
await page.locator(".runner-prompt").waitFor();
// Options are shuffled per visit, so pick the right answer by its text.
await page.locator(".option", { hasText: "A spam filter that sorts your email" }).click();
await shot(2);

// 3. Instant explanation: after Check.
await page.getByRole("button", { name: "Check" }).click();
await page.locator(".fb-explain").waitFor();
await shot(3);

// 4. Review later: a missed question waiting on the Review page.
await page.evaluate(() => {
  const KEY = "neuronaut.progress.v1";
  const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
  const today = new Date();
  const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const base = s ?? { version: 1, xp: 0, lessons: {}, streak: { current: 0, longest: 0, lastActiveDay: null, freezes: 0 }, review: {}, badges: {}, history: {}, weeklyGoal: 50, updatedAt: new Date().toISOString() };
  base.lessons["f1-what-is-ai"] = { completedAt: new Date().toISOString(), bestAccuracy: 0.8, attempts: 1 };
  base.review["f1-what-is-ai:q3"] = { key: "f1-what-is-ai:q3", box: 1, due: day };
  localStorage.setItem(KEY, JSON.stringify(base));
});
await page.goto(`${BASE}/review`, { waitUntil: "networkidle" });
await shot(4);

await browser.close();
