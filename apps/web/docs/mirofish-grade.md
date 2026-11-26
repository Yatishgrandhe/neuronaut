# MiroFish grade: Neuronaut + Software Dev entry (2026-11-26)

Method: the mirofish-simulation skill run locally. One shared scenario seed, five Haiku personas with conflicting interests, three rounds. Each persona kept its memory between rounds and saw the others' critiques.

## Scores

| Persona | R1 current site | R1 your landing rebuild | R2 (v2) | R3 (v3) |
|---|---|---|---|---|
| TSA Webmaster judge | 5 | 4 | 7 | **8** |
| TSA Software Dev judge (SD entry) | 3 | 2 | 7 | **8** |
| 10th-grade student (site / SD app) | 5 | 3 | 6 / 6 | **8 / 7** |
| Teacher + TSA advisor (site / SD) | 6 | 4 | 7 / 5 | **8 / 7** |
| Design, a11y and perf critic | 6 | 4 | 7 | **8** |
| **Average: Webmaster** | **5.0** | **3.4** | **6.75** | **8.0** |
| **Average: SD** | 3 | 2 | 6.0 | **7.3** |

All five say v3 is acceptable to build.

## What round 1 found
- **Copyright checklist and work log links return 404.** `apps/web/public/docs/` is empty (verified). This is a required Webmaster element.
- The pasted landing order (hero, proof bar, benefits, how it works, testimonials, pricing, FAQ, CTA) is avoid-list #215. Applied as written it needs invented proof (#307–311, #421) and a pricing block for a free school project (#237). Every persona rejected it.
- Keep the self-made word planet as the 3D hero instead of a stock CC0 model. It is original student work, and the poster is already the LCP element.
- The privacy page says no personal info is collected, but Ask Pip sends text to Anthropic. There is no 13+ notice.
- **Dual-entry risk is high** if the SD entry reuses this site, code or content.

## The idea that passed (v3)
## v3 — Webmaster: Neuronaut home = the portal's front door, 5 sections, 5 different layouts
1. **Hero (split)**: the self-made word planet stays, with a static poster as the LCP element; WebGL is only an upgrade on capable GPUs (already gated: reduced motion, ≤2 cores, software GL, Save-Data); Chromebook LCP is measured on the poster. Headline + one CTA "Start lesson 1". Caption line holds the facts and the offer: "Free · no account · 3 modules · 12 lessons · every source cited", numbers generated from content.ts so they can't drift. The inline proof is a real student question answered in 30 seconds: "Can AI write my essay?" → short honest answer + one quiz question.
2. **Your course (list, not cards)**: the three modules as a ruled list, each row shows the learner's real progress from local storage (0/4 lessons, or "Resume: Inside a chatbot"), linking to the module pages. Returning visitors see "Pick up where you left off" at the top.
3. **One lesson, step by step**: 4 real screenshots (read, answer, instant explanation, review later); sticky visual on desktop only, plain stacked below 768px and for reduced motion.
4. **Ask Pip (split, live input)**: Pip tutors and explains but declines to write graded work, and says so on screen. Privacy is an inline notice under the input, always visible, no popup: "Pip sends your question to Anthropic to answer it. Don't type your name or personal info. 13+." The first send shows a one-line inline acknowledgment, not a modal.
5. **Questions people actually ask (plain list, no accordion)**: Is using this cheating? What does Pip see? Can my teacher use it in class? Is AI-written content checked? Who made this? It ends on the closing action "Try the first question" (a different verb from the hero).
Footer: Sources · How we built it · Copyright checklist · Work log · Privacy · Design decisions.
Separate pages (all linked from home): /how-we-built-it (process, AI-use reflection, word-planet provenance: what was built, by whom, when, with Rust/WebAssembly), /sources, /copyright-checklist and /work-log (HTML pages with PDF downloads, so no more 404s), /design-decisions (for the interview).
AI-generated practice questions carry the label "AI-written practice, not teacher-reviewed"; the 12 curated lessons are reviewed by the team.
Build order: compliance pages + privacy fixes in week 1 (live and checkable), home rebuild in weeks 2-3, screenshots and testing in week 4, buffer and interview prep after that.

## v3 — Software Development: a clearly different product, one deliverable
**"Explain It Back"**: an installable, offline PWA for the Feynman/self-explanation technique, which is evidence-based (self-explanation and retrieval practice). A student pastes their own class notes; the app pulls out the key concepts on-device; the student explains a concept in their own words (typed, or speech-to-text); the app scores coverage — which key concepts and links they hit or missed — and brings weak concepts back later.
- Not flashcards and not AI-literacy content: no Neuronaut lessons, mascot, code or review engine. Separate repo and deployment; built from scratch.
- No AI by default. The engineering is original and testable: a keyphrase/concept extractor (TF-IDF + noun-phrase chunking), a coverage scorer with synonym/stem matching, a small Leitner revisit scheduler (parameters documented), and offline storage with export.
- Evidence of value: a usability test with 5-8 classmates (written permission, no personal data stored), plus before/after quiz results on one unit.
- Tests: unit and property-based tests for the extractor and scorer, a fixture corpus of real (anonymised, permitted) notes, and a coverage report.
- One deliverable: a live public URL plus a public repo.
- Schedule: starts week 2, after the Webmaster compliance work ships. MVP (paste notes → explain → coverage) by week 4, testing in weeks 5-6, freeze in week 7. If the MVP misses week 4, the team defers SD rather than risking the Webmaster entry.

## Conditions the personas attached to "yes"
1. Ship the compliance pages first: copyright checklist, work log, sources, how we built it, design decisions. Each must return 200 and be linked from home.
2. Test Pip's "won't write graded work, will show you how" behaviour with real homework prompts before claiming it, and show one tested example on the page.
3. Put a dated lesson-review record and the word-planet provenance (commits, dates) in the work log.
4. Vary section padding per section (one `--sec-pad` everywhere today). The Ask Pip composer must not grow over content or auto-scroll at 375px.
5. Measure LCP on the poster under throttled mobile / Chromebook and keep it under 2.5s.
6. SD: keep the coverage score private (no red marks or percentages), get written guardian permission before any classmate testing or fixture notes, publish evaluation numbers for the coverage scorer, keep the week-4 MVP gate, and keep shared Webmaster docs out of the SD repo.
7. Still unverified: the 2026-27 TSA GenAI rule and the exact rubric (the guide is behind member login). The advisor should confirm both.

Seeds and round files: `scratchpad/mirofish/seed.md`, `v2.md`, `v3.md` (session scratchpad).

## Rounds 4-8: grading the build prompts (bar 9.5)

Files graded: `docs/prompts/webmaster-prompt.md` and `docs/prompts/software-dev-prompt.md`. Each round's edits were applied before the next round.

| Persona | R4 | R5 | R6 | R7 | R8 |
|---|---|---|---|---|---|
| Webmaster judge (WM prompt) | 8.5 | 9.2 | 9.4 | **9.5** | |
| Design critic (WM prompt) | 8 | 9 | 9.4 | **9.5** | |
| Teacher (WM / SD) | 8 / 7 | 9 / 9 | 9.4 / 9.4 | **9.5 / 9.5** | |
| Student (WM / SD) | 8 / 7 | 9 / 8.5 | 9.5 / 9 | **9.5** / 9 | **9.5** |
| SD judge (SD prompt) | 8 | 9 | 9.5 | **9.5** | |
| **Average WM / SD** | 8.1 / 7.3 | 9.05 / 8.8 | 9.43 / 9.3 | **9.5** / 9.33 | **9.5 / 9.5** |

Main edits by round:
- **R4 → v2.** Gate 1 is compliance only; the Ask Pip route is named; dark tokens added; AI-answer label, uncertainty note, copy/retry and source line; perf budget; guest-flow check; lesson citations; MVP cut list; fact-level held-out evaluation; fixture minimums; submission formats; licensing up front.
- **R5.** No visible TODO on live pages; provenance via git/stat; font loading with fallback metrics; poster under 100 KB; Lighthouse at 4× CPU, two runs; three FAQ items on home; copy/retry only after streaming; two labellers with kappa; timed first win; scoped grep; mic path outside the core flow; coverage capped at 3+3.
- **R6–R8.** Lesson-length range computed from data; transcripts carry the model ID and build; essay sign-off dated 2026-12-18; every TODO closed before submission; labels frozen before tuning; grep from the repo root; three due concepts named; "This is wrong" override on coverage.
