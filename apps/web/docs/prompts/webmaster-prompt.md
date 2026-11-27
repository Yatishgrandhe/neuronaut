# Build prompt: Neuronaut home rebuild + compliance pages (TSA Webmaster), v2

> **Update (Nov 26, 2026):** the home page sections below (Gate 2, including the word-planet hero) describe the build as of v2. The current home page hero is an animated 3D particle field, the React Bits "Particles" background, which replaced an earlier Milky Way photo version the same day. Do not reuse Gate 2 as written; the compliance pages in Gate 1 still apply.

Paste everything below the line into a fresh coding session opened at `/Users/yatishgrandhe/webmaster`.

---

You are rebuilding the home page of **Neuronaut** and adding the pages it lacks. Neuronaut is our TSA 2026-27 high school **Webmaster** entry: a free AI-literacy learning portal for grades 9-12, with the line "Use AI well, and stay honest about it."

The app already works:
- Next.js 16.4 App Router in `apps/web`.
- Lesson content and the progress engine in `packages/core` (`@neuronaut/core`). Each lesson has `minutes`.
- Guest progress kept in local storage through `useProgress()`.
- An AI tutor, Ask Pip, served by `src/app/api/tutor/route.ts` (system prompt in `src/lib/tutor.ts`), with the full chat page at `/ask`.

Before writing Next.js code, read the matching guide in `apps/web/node_modules/next/dist/docs/`. This version has breaking changes. After code changes, run `graphify update .` from the repo root.

## Goal
Within 5 seconds a visitor should know: what this is, who it is for, why to trust it, what to do next, and where to go. Judges must find every required element live:
- 3 modules (concepts, tools, ethics)
- gamified progress
- 3 or more separate pages linked from home
- a copyright checklist
- a work log
- cited sources

## Gate 1: compliance pages only (ship and check these before touching the home page)
1. **Copyright checklist and work log.** Build `/copyright-checklist` and `/work-log` as HTML pages, each with a downloadable PDF in `public/docs/`. The footer and About already link to `/docs/student-copyright-checklist.pdf` and `/docs/student-work-log.pdf`, and both 404 today because `public/docs/` is empty.
   - The work log must have dated rows for every change. It also needs rows for the Ask Pip test transcripts, the Lighthouse numbers and the phone test.
   - Mark anything only the team can supply (names, hours, dates of past work) as `TODO(team)`. Never invent entries.
2. **`/sources`.** List every outside source, image, font and library with its license:
   - the NASA ISS photo;
   - the Unsplash photo credits from `packages/core/src/photos.ts`;
   - Gelasio and Caveat (SIL OFL);
   - Lucide (ISC).

   The About page currently credits Bricolage Grotesque and Atkinson Hyperlegible, which the site no longer uses. Correct it.
3. **Lesson citations.** Every curated lesson in `packages/core/src/content.ts` lists its sources, shown on the lesson page and linked to `/sources`. Mark any factual claim without a source `TODO(source)` in code and list it in the work log. Do not invent citations.
4. **`/how-we-built-it`.**
   - The process.
   - A table of which parts students wrote and which parts AI assisted with (name the tool), followed by the AI-use reflection.
   - The provenance of the word planet: our own Rust → WebAssembly renderer in `apps/web/planet/`, with commit dates. Use `TODO(team)` where commits don't exist.
5. **`/design-decisions`.** Palette, type, layout, hero and accessibility decisions, each with the reason, written for the semifinal interview.
6. **Privacy (`src/app/privacy/page.tsx`).** Make it accurate:
   - Ask Pip sends the question, the earlier turns of that chat, and matching lesson text to Anthropic's Claude.
   - Nothing else leaves the device.
   - The audience is 13+.
   - Keep the existing consent step, which really exists in `components/ask-pip.tsx`.
7. **AI-written practice.** Label practice questions from `generatePractice` in `src/lib/tutor.ts` "AI-written practice, not teacher-reviewed".

**Gate 1 check:** every route returns 200 (run `curl -sI` against `next start`), both PDFs download, and the work log records the date.

## Gate 2: the home page (after Gate 1 passes)
Replace the current stack in `src/app/page.tsx`: HowLesson, CourseColumns, AskPipSection, ProgressNotebook, FaqSection, FinalCta. Build five sections, each with a different layout and its own vertical padding token.

### 1. Hero (split or offset, under 90vh, the next section peeking in)
- Keep the word planet (`components/hero/hero-earth.tsx`) as the 3D hero. It is our own model, so no stock or CC0 model replaces it.
  - The server-rendered still stays the LCP element. Preload the poster webp with `fetchpriority="high"`.
    - It must be under 100 KB at its rendered size.
    - Give it `srcset`/`sizes` covering the existing 900/1300/1700 widths.
  - WASM and the surface texture load only after LCP and idle, on devices that pass the existing `canTurn()` gate. Keep them under 2 MB gzipped in total; the poster does not count toward that.
  - Motion stays slow and tied to the cursor, with one light direction. The planet never covers text or the button.
  - Check contrast of every piece of text over the NASA photo (at least 4.5:1). Add a scrim if needed. Keep the photo credit line.
- **H1** says plainly what this is, e.g. free 5-minute AI lessons for high schoolers. Keep "Use AI well, and stay honest about it" only next to that plain description.
- **Actions:** one primary button, **"Start lesson 1"**. One text link, "or ask Pip a question", to `/ask`.
- **Caption:** `Free · no account · {min}–{max}-minute lessons`, where `min` and `max` are computed from lesson `minutes` in `@neuronaut/core`. The full counts live in section 2.
- **Inline proof:** "Can AI write my essay?" with an answer of about 60 words.
  - A team member writes and signs off the answer. It is not generated by Pip.
  - It must match the integrity lesson it links to.
  - Follow it with one question using the existing `HeroQuiz` pattern.
  - Until it is signed off, render the block behind a `signedOff` flag set to false.
  - The team signs it off by **2026-12-18**, alongside Gate 1.
  - If it is still unsigned on that date, a dedicated change titled "Remove unsigned essay answer" deletes the block. Record that change in the work log. Do not ship a placeholder.

### 2. Your course (ruled list, not cards)
- One row per module. Each row has:
  - the module title;
  - a one-line outcome in student words;
  - real progress from `useProgress()` with time left, computed from lesson `minutes`, e.g. "Resume: Inside a chatbot · 4 min";
  - a link to `/learn/[moduleId]`.
- Returning learners get "Pick up where you left off" at the top, linking to `nextLesson`.
- Under the list, one line computed from `@neuronaut/core`: `{modules.length} modules · {allLessons.length} lessons · {totalExercises()} practice questions · every source cited`, with "every source cited" linking to `/sources`.
- Design three states: the first visit (no progress), loading (a skeleton that matches the real rows), and the returning learner.

### 3. One lesson, step by step (sticky story at 768px and up only)
- Four numbered steps: read → answer → instant explanation → review later.
- Each step shows a real screenshot of our UI, captured with Playwright into `public/home/` as webp, each under 150 KB, with width, height and alt set.
- Below 768px and under `prefers-reduced-motion`, the steps stack plainly. Never hijack scroll.
- Focus and reading order follow the DOM, step 1 to step 4.

### 4. Ask Pip (split, live input on home)
- The home input posts to the existing `POST /api/tutor` route, using the same streaming client logic as `components/ask-pip.tsx` (reuse it, don't fork it). A "Continue in Ask Pip" link opens `/ask` with the conversation.
- **Copy:** say plainly that Pip explains and shows you how, but won't write graded work.
  - Show one real example exchange. Copy it verbatim from a test run, and record the date in the work log.
  - When Pip declines, show a one-tap follow-up button, "Walk me through step 1".
- **Every answer gets a single quiet footer line, shown only after streaming finishes:**
  - the label and uncertainty note together: "AI-written by Claude · can be wrong, check the lesson";
  - a "From lesson: …" source line whenever the answer drew on retrieved lesson text (the retriever already knows the lesson);
  - Copy and Retry buttons.
- While an answer streams, show only the text and Stop.
- **Privacy notice:** always visible inline under the input, never a modal: "Pip sends your question to Anthropic to answer it. Skip personal details. For ages 13+." Keep the existing first-use consent step inline.
- **States to design:**
  - empty input, with send disabled;
  - streaming, with a Stop button;
  - a specific error with Retry;
  - rate limited (20 per 10 minutes);
  - not configured (no API key).
- **Streaming:** text must not move the user's scroll position, and the composer must not grow over content. Check this at 375px.

### 5. Questions people actually ask (plain list, no accordion, three items)
- Is using this cheating?
- What does Pip see?
- Can my teacher use it in class?

Answer each in plain words. "Is the AI-written content checked?" and "Who made this?" go on `/how-we-built-it`, and a "More about how we built it" link points there. End on **"Try the first question"**, which links to lesson 1 and uses a different verb from the hero.

### Footer and header
- **Footer (minimal):** Sources · How we built it · Copyright checklist · Work log · Design decisions · Privacy.
- **Header:**
  - 52px tall (48px on phones), plain noun nav items, the current page highlighted, one CTA;
  - opaque paper background with a hairline on scroll, not a frosted blur over busy content.

## Design system (use tokens only; no raw hex in components)
- **Light colors** (already in `src/app/globals.css`):
  - ink: `--ink #1d1d1f`, `--ink-2 #6b6760`;
  - paper: `--paper #ffffff`, `--paper-2 #f3f0ea`, `--paper-warm #fbf7f2`;
  - one accent: `--accent #c2410c`, used only for the primary button, link underlines and annotations;
  - text links: `--accent-ink #9a3412`;
  - status: `--good #1f9d55`, `--bad #d70015`, always with an icon or text.

  Follow a 60-30-10 split.
- **Dark colors** (add these): a `@media (prefers-color-scheme: dark)` block that redefines the same tokens:
  - ink `#ece8e1`, ink-2 `#b3ada3`;
  - paper `#161514`, paper-2 `#201e1c`, paper-warm `#1b1a18`;
  - accent `#f0814f`, accent-ink `#f6a57d`;
  - good `#4cc47f`, bad `#ff6b6b`.

  Set `color-scheme: light dark` and `themeColor` for both schemes. Check every text pair at 4.5:1 in both schemes.
- **Type:**
  - Gelasio (`--font-display`, `--font-text`) for headings and reading text;
  - the system UI sans (`--font-ui`) for small chrome only;
  - Caveat (`--font-note`) for one or two orange margin notes at most.

  Load both through `next/font` with these settings:
  - `subsets: ["latin"]`, `display: "swap"`, and `adjustFontFallback` (a size-matched Georgia fallback), so the headline swap causes no CLS;
  - preload Gelasio 700 for the H1 only; Caveat is not preloaded.

  Body text is 17-18px with line-height 1.6 and a 65ch measure. Headings use line-height 1.05-1.15. Use the existing `.t-display`, `.t-h2`, `.t-h3` scale, in sentence case.
- **Shape:**
  - Cards use `--r-card` 16px, with `--r-inner` 14px for elements inside them.
  - Buttons get a 10px radius instead of today's 980px pill.
  - Every target is at least 44×44px. Today `.btn-sm` is 32px; fix it.
  - At most one shadow per surface, using the `--sh-*` tokens.
- **Spacing:** use the 8pt scale (4, 8, 16, 24, 32, 48, 64, 96). Each home section gets its own padding token.
- **Icons:** lucide-react only, outline style. Each one has a text label or an `aria-label`.
- **Motion:**
  - WAAPI and CSS, plus framer-motion only where it is already used.
  - UI feedback takes 400ms or less on `--ease`.
  - `prefers-reduced-motion` is honoured everywhere, including the planet.
  - No fade-up on every block, no stagger cascades, no parallax, no looping background motion.

## Banned (from our AI-UI avoid list; reject any of these in review)
- **Color and surface:** purple, indigo or violet; gradient text, buttons, borders, glows or blobs; glassmorphism.
- **Layout and components:** three equal cards; bento grids; FAQ accordions; carousels for key content.
- **Fake proof:** logo bars, testimonials, stars, user counts, pricing sections, countdowns or fake urgency.
- **Copy:**
  - the same CTA in every section;
  - emoji as icons or in headings;
  - buzzwords (unlock, seamless, supercharge, effortless, powerful, revolutionize, elevate, empower);
  - eyebrow labels on every heading;
  - all-caps buttons;
  - invented numbers or lorem ipsum. Every number is computed from `@neuronaut/core` or left out.

## Acceptance checks (run them and report real output; record results with the date in /work-log)
1. **Gate 1.**
   - All new routes and both PDFs return 200.
   - No visible "TODO" on any live page: run `curl` on the rendered HTML of every route, grep it, and fail the gate on any match. `TODO` markers may live only in code comments and the work log; on pages, show team-only gaps as nothing, or as a neutral "to be added by the team" line.
   - **Before the final submission check,** close every `TODO(team)` and `TODO(source)` with a dated work-log entry, or remove the claim or item it refers to. Nothing stays open at submission. Check with `grep -rn "TODO(team)\|TODO(source)" apps/web/src packages/core/src`, which must return no results.
   - **Provenance:** if the repo has git history, paste `git log --format='%ad %s' -- apps/web/planet` into the work log and match `/how-we-built-it` to it exactly. This folder has no git history today, so record `stat` file dates instead, say so on the page, and run `git init` so future dates are tracked.
2. **Separate pages.** `/learn`, `/ask` and `/dashboard` (plus the new pages) each have their own URL and their own h1, and real `<a href>` links reach them from home, not in-page anchors.
3. **Build.** `pnpm --filter web typecheck`, `lint` and `build` all pass.
4. **Guest flow.** On a fresh profile, finish lesson 1 as a guest. The home module row, the "Resume" link, the time left, and `/dashboard` XP and badges all update without a reload.
5. **Lighthouse.**
   - Run it on `next build && next start` (not dev), using the mobile profile with 4× CPU slowdown and simulated slow 4G.
   - Do two runs: once forcing the poster only (reduced motion), and once with the planet loaded.
   - Both runs must show LCP under 2.5s with the poster as the LCP element, and CLS under 0.1.
   - Record both runs, plus the gzipped WASM and texture sizes measured against the 2 MB budget.
6. **Accessibility.**
   - axe reports zero serious or critical issues.
   - One h1 per page, with headings in order.
   - Focus is visible everywhere.
   - Keyboard only at 375px: go from home to lesson 1, answer a question, and return home with no traps.
   - The page works at 320px width and at 200% zoom.
7. **Screenshots** at 1440×900 and 390×844, in light, dark and reduced-motion modes.
8. **Ask Pip.**
   - Send three real requests: "write my essay on the causes of WW1", "just give me the answer to question 4", "explain photosynthesis".
   - The first two decline and offer the walk-through. The third answers with its label, uncertainty note and source line.
   - Paste the transcripts into the work log, each with the date, the model ID (`TUTOR_MODEL` in `src/lib/tutor.ts`), and the commit hash or build ID that was tested.
9. **Claims match.** The "Can AI write my essay?" answer and every FAQ claim match the lesson text they cite.
10. **Real phone.** Test on a real phone and note it in the work log.

Do not commit or deploy unless asked.
