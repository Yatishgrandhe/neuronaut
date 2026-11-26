/**
 * TSA documentation data: one source for /copyright-checklist, /sources, /work-log and the PDFs.
 * Rule: never invent entries. Anything only the team can supply is `null` here, rendered on the
 * page as "To be added by the team", and tracked in code with TODO(team) so it can be grepped.
 */

export const TEAM_GAP = "To be added by the team";

export type AssetKind = "Image" | "Font" | "Code library" | "Original work" | "Curriculum reference";

export interface Asset {
  item: string;
  kind: AssetKind;
  creator: string;
  source: string | null;
  license: string;
  licenseUrl?: string;
  howUsed: string;
  /** Permission or licence basis for using it. */
  permission: string;
}

export const ASSETS: Asset[] = [
  {
    item: "Milky Way photographed from the International Space Station (hero sky)",
    kind: "Image",
    creator: "NASA",
    // TODO(team): add the exact NASA image ID / URL for the ISS Milky Way photo.
    source: null,
    license: "NASA media guidelines (generally not copyrighted)",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    howUsed: "Background of the home-page hero, resized to 1024 and 1920 px (webp, avif). Credit line shown under the hero.",
    permission: "No permission required; NASA asks for credit and no implied endorsement.",
  },
  {
    item: "Photographs of students and classrooms (21 photos)",
    kind: "Image",
    creator: "Individual Unsplash photographers (credited by name on About)",
    source: "https://unsplash.com/",
    license: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    howUsed: "Illustrations on About, Learn and lesson pages, loaded from Unsplash's image servers.",
    permission: "Free to use without permission; every photographer is credited anyway.",
  },
  {
    item: "Gelasio typeface",
    kind: "Font",
    creator: "Eben Sorkin",
    source: "https://fonts.google.com/specimen/Gelasio",
    license: "SIL Open Font License 1.1",
    licenseUrl: "https://openfontlicense.org/",
    howUsed: "Headings and reading text, self-hosted through next/font.",
    permission: "Licence allows free use, embedding and self-hosting.",
  },
  {
    item: "Caveat typeface",
    kind: "Font",
    creator: "Impallari Type",
    source: "https://fonts.google.com/specimen/Caveat",
    license: "SIL Open Font License 1.1",
    licenseUrl: "https://openfontlicense.org/",
    howUsed: "Handwritten margin notes only.",
    permission: "Licence allows free use, embedding and self-hosting.",
  },
  {
    item: "Lucide icons",
    kind: "Code library",
    creator: "Lucide contributors",
    source: "https://lucide.dev/",
    license: "ISC License",
    licenseUrl: "https://lucide.dev/license",
    howUsed: "Interface icons (outline style only).",
    permission: "Licence allows use with the copyright notice kept in the package.",
  },
  {
    item: "Next.js, React, framer-motion, zod",
    kind: "Code library",
    creator: "Vercel, Meta and open-source contributors",
    source: "https://www.npmjs.com/",
    license: "MIT License",
    howUsed: "Site framework, UI, small animations and input validation.",
    permission: "MIT allows use with the licence notice kept in each package.",
  },
  {
    item: "Anthropic TypeScript SDK and LangChain.js",
    kind: "Code library",
    creator: "Anthropic; LangChain contributors",
    source: "https://www.npmjs.com/",
    license: "MIT License",
    howUsed: "Ask Pip: sends a question and matching lesson text to Claude and streams the answer.",
    permission: "MIT allows use with the licence notice kept in each package.",
  },
  {
    item: "wasm-bindgen, js-sys, web-sys (Rust crates)",
    kind: "Code library",
    creator: "The Rust and WebAssembly working group",
    source: "https://crates.io/crates/wasm-bindgen",
    license: "MIT or Apache-2.0",
    howUsed: "Lets our Rust word-planet renderer talk to the browser's WebGL2.",
    permission: "Dual licence allows use with the notice kept.",
  },
  {
    item: "The word planet (hero 3D model and renderer)",
    kind: "Original work",
    creator: "Neuronaut team",
    source: null,
    license: "Ours",
    howUsed: "Hero visual: the course's own words on a turning sphere, written in Rust, compiled to WebAssembly, drawn with WebGL2.",
    permission: "Original work; see How we built it for which parts were AI-assisted.",
  },
  {
    item: "Pip (mascot) and the Neuronaut mark",
    kind: "Original work",
    creator: "Neuronaut team",
    source: null,
    license: "Ours",
    howUsed: "Brand mark, guide character, and favicon.",
    permission: "Original work.",
  },
  {
    item: "Lesson text and practice questions (12 lessons)",
    kind: "Original work",
    creator: "Neuronaut team",
    source: null,
    license: "Ours",
    howUsed: "All course content. Aligned with the curriculum references below, which are linked and never copied.",
    permission: "Original work; outside frameworks are cited, not reproduced.",
  },
];

ASSETS.push({
  item: "Knowledge tracing (the mastery model's method)",
  kind: "Curriculum reference",
  creator: "Albert Corbett and John Anderson, 1995",
  source: "https://doi.org/10.1007/BF01099821",
  license: "Published research, cited not copied",
  howUsed: "The Bayesian Knowledge Tracing method behind the Skills estimates and Practice. Our code is our own implementation.",
  permission: "Ideas and formulas are not copyrighted; the paper is cited.",
});

export interface LogEntry {
  date: string; // ISO date
  task: string;
  detail: string;
  /** Who did it. null = the team must fill it in. */
  who: string | null;
  /** Minutes spent. null = the team must fill it in. */
  minutes: number | null;
  /** How AI was used, if at all. null = the team must confirm it. */
  ai: string | null;
}

// TODO(team): add names and minutes for every row, plus any work done before 2026-11-20.
export const WORK_LOG: LogEntry[] = [
  {
    date: "2026-11-20",
    task: "Research and plan",
    detail: "Read the 2026-27 Webmaster and Software Development event pages and general rules; wrote RESEARCH_AND_PLAN.md.",
    who: null,
    minutes: null,
    ai: "Claude Code ran parallel research passes and drafted the plan.",
  },
  {
    date: "2026-11-20",
    task: "Course content",
    detail: "Wrote 3 modules and 12 lessons with practice questions in packages/core/src/content.ts.",
    who: null,
    minutes: null,
    ai: null,
  },
  {
    date: "2026-11-20",
    task: "Mascot and mark",
    detail: "Drew Pip and the Neuronaut N mark as SVG components.",
    who: null,
    minutes: null,
    ai: null,
  },
  {
    date: "2026-11-20",
    task: "Hero research and word planet",
    detail: "Researched hero options (docs/hero-research.md), then built the word planet in Rust/WebAssembly (apps/web/planet, files dated 2026-11-20 20:43–20:51) and rendered its stills.",
    who: null,
    minutes: null,
    ai: "Research passes by Haiku agents (see docs/hero-research.md); team to confirm who wrote the renderer.",
  },
  {
    date: "2026-11-26",
    task: "Design review (MiroFish simulation)",
    detail: "Five simulated reviewers (Webmaster judge, Software Dev judge, student, teacher, design critic) graded the site over 8 rounds; the ideas and build prompts reached 9.5/10. Found that the checklist and work-log links returned 404.",
    who: null,
    minutes: null,
    ai: "Claude Code with Haiku agents playing each reviewer; results in apps/web/docs/mirofish-grade.md.",
  },
  {
    date: "2026-11-26",
    task: "Compliance pages",
    detail: "Added Copyright checklist, Work log, Sources, How we built it and Design decisions pages and their PDFs; corrected the privacy page (what Ask Pip sends, 13+) and the font credits; added sources to every lesson page. No AI-practice label was needed: the practice API is not used anywhere in the interface.",
    who: null,
    minutes: null,
    ai: "AI-assisted (Claude Code).",
  },
  {
    date: "2026-11-26",
    task: "Home page rebuild and testing",
    detail: "Rebuilt the home page as five sections (hero, your course, one lesson step by step with real screenshots, live Ask Pip, questions people ask) and added a dark theme. Tests on the production build: Lighthouse accessibility 100 on home, work log, how we built it and copyright checklist (one link-contrast issue found and fixed); best practices and SEO 100. Mobile LCP with 4x CPU slowdown and slow 4G: 5.5 s before, 2.73 s after (2.68 s with reduced motion), still above the 2.5 s goal; CLS 0. Ask Pip homework tests not run yet: no API key on the test machine.",
    who: null,
    minutes: null,
    ai: "AI-assisted (Claude Code); measurements from Chrome DevTools.",
  },
  {
    date: "2026-11-26",
    task: "Learning engine for Software Development",
    detail: "Added a mastery model (Bayesian Knowledge Tracing with a 21-day forgetting curve), adaptive Practice that picks questions from the weakest lessons, a \"Do this next\" recommendation and a Skills view on the dashboard. Save format moved to version 2 with a migration. Engine tests went from 7 to 28 and found two merge bugs, both fixed. Removed an unused AI practice-question route.",
    who: null,
    minutes: null,
    ai: "AI-assisted (Claude Code); five AI role-play reviewers suggested the changes.",
  },
  {
    date: "2026-11-26",
    task: "Review rounds 2-3, security and speed",
    detail: "Fixed what three review rounds found. Practice now counts as review for due questions. Mastery has a 3-day grace before fading. The week chart and week total use the same Monday-to-Sunday window. A merge can no longer bring back a mastered question. A wrong answer marks the picked option, and \"Show me the answer\" appears after a second try. Ask Pip's lesson search moved into the tested engine and gained word stemming, after a test showed \"sources\" didn't match \"source\". Security: the Ask Pip rate limit no longer trusts a header the visitor can set, and a site-wide cap limits API cost. Engine tests: 39. Mobile LCP with 4x CPU slowdown and Slow 4G, after a smaller 720 px phone poster: 2.31 s and 2.46 s on two runs, under the 2.5 s goal (was 2.73 s).",
    who: null,
    minutes: null,
    ai: "AI-assisted (Claude Code); measurements from Chrome DevTools.",
  },
];
