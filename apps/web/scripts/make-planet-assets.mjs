// Builds the word planet's images with the Rust engine (planet/), in a real browser:
//   1. public/hero/word-surface-{3072,2048}.webp: the word surface, painted by SurfacePainter
//   2. public/hero/word-planet-{1700,1300,900}.webp: the still shown before the live planet loads
// Needs the dev server running. Usage: node scripts/make-planet-assets.mjs [baseUrl]
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3210";
const tmp = mkdtempSync(path.join(tmpdir(), "planet-"));
const py = (code) => execFileSync("python3", ["-I", "-c", code]);
const webp = (src, out, q = "78", extra = []) => execFileSync("cwebp", ["-quiet", "-q", q, "-m", "6", ...extra, src, "-o", out]);

const browser = await chromium.launch();
const open = async (query, viewport) => {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("nn_intro", "1"); } catch {} });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?${query}`, { waitUntil: "networkidle" });
  return page;
};

// 1. Surface
{
  const page = await open("paint-surface=4096", { width: 1440, height: 900 });
  const data = await page.waitForFunction(() => window.__surface, null, { timeout: 120000 }).then((h) => h.jsonValue());
  const png = path.join(tmp, "surface.png");
  writeFileSync(png, Buffer.from(data.split(",")[1], "base64"));
  // Painted at 4096 for clean glyphs, shipped at 3072 (desktop) and 2048 (phones).
  py(`from PIL import Image\nim=Image.open(${JSON.stringify(png)}).convert("RGB")\nfor n in (3072, 2048): im.resize((n, n // 2), Image.LANCZOS).save(${JSON.stringify(tmp)} + "/surface-%d.png" % n)`);
  webp(path.join(tmp, "surface-3072.png"), "public/hero/word-surface-3072.webp", "72");
  webp(path.join(tmp, "surface-2048.png"), "public/hero/word-surface-2048.webp");
  await page.context().close();
}

// 2. Poster: the live planet alone, cut out of its frame
{
  const page = await open("force-planet", { width: 1800, height: 1700 });
  await page.waitForFunction(() => document.querySelector(".he")?.dataset.ready === "true", null, { timeout: 60000 });
  await page.addStyleTag({ content: ".hero-sky,.hero-top,.hero-proof,.hero-pip,.hero-credit,.he-air,.he-still,.site-header,.hero ~ *,footer{visibility:hidden!important} body,.hero{background:#000!important} .hero{overflow:visible!important} .he{bottom:auto!important;height:1275px!important} .he-gl{transition:none!important}" });
  await page.waitForTimeout(2500);
  const raw = path.join(tmp, "raw.png");
  await page.locator(".he").screenshot({ path: raw });
  py(`
from PIL import Image, ImageDraw
im = Image.open(${JSON.stringify(raw)}).convert("RGB"); W, H = im.size; S = 4
m = Image.new("L", (W * S, H * S), 0); ImageDraw.Draw(m).ellipse((0, 0, W * S - 1, W * S - 1), fill=255)
im.putalpha(m.resize((W, H), Image.LANCZOS)); im.save(${JSON.stringify(path.join(tmp, "p1700.png"))})
for n in (900, 1300): im.resize((n, round(H * n / W)), Image.LANCZOS).save(${JSON.stringify(tmp)} + "/p%d.png" % n)
`);
  for (const n of [1700, 1300, 900]) webp(path.join(tmp, `p${n}.png`), `public/hero/word-planet-${n}.webp`, "74", ["-alpha_q", "80"]);
}
await browser.close();
console.log("Saved public/hero/word-surface-{3072,2048}.webp and word-planet-{1700,1300,900}.webp");
