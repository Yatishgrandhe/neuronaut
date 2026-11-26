// Prints the TSA documentation pages to the PDFs the site links to.
// Usage: start the site (next start or next dev), then
//   node scripts/make-docs-pdf.mjs [baseUrl]   (default http://localhost:3210)
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3210";
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "docs");
const docs = [
  ["/copyright-checklist", "student-copyright-checklist.pdf"],
  ["/work-log", "student-work-log.pdf"],
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [route, file] of docs) {
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: path.join(out, file),
    format: "Letter",
    printBackground: true,
    margin: { top: "0.6in", bottom: "0.6in", left: "0.6in", right: "0.6in" },
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#666">Neuronaut · ${route.slice(1)} · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
  });
  console.log("wrote", file);
}
await browser.close();
