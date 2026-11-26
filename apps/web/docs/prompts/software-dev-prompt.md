# Build prompt: "Explain It Back" (TSA Software Development), v2

Paste everything below the line into a fresh coding session opened in a **new, empty folder outside this repo**, for example `~/explain-it-back`. Explain It Back is a separate product: its own repo and deployment, with no Neuronaut code, lessons, mascot, design tokens or shared docs. This file is kept here for reference only. Move it out before the SD repo goes public.

---

You are building **Explain It Back**, our TSA 2026-27 high school **Software Development** entry. The event asks for software with educational or social value. We submit executable code at a public URL, a one-page summary, and an AI Reflection Form.

## What it does
It is an offline, installable web app that turns the self-explanation (Feynman) study technique into a two-minute loop for any class.
1. **First launch.** A short sample note is already loaded, and one tap opens the first concept. That first concept asks for a single sentence, so the first win takes under 30 seconds. A full round with no setup takes under two minutes.
2. **Paste notes.** Students paste their own notes, or import a .txt or .md file.
3. **Concepts.** The app extracts key concepts on the device. They appear **pre-selected**, and the student unticks the bad ones and can rename or merge concepts.
4. **Explain.** The app picks one concept, and the student explains it in their own words by typing or with optional speech-to-text.
5. **Coverage.** The app shows which facts from the notes the explanation covered and which it missed, quoting the matching line from the notes for each one.
   - It shows at most three "You covered" and three "Not yet" quotes, plus a "Show all" control.
   - Each "Not yet" line has a "This is wrong. I covered it" button.
     - One tap moves the fact to covered for that attempt.
     - It records a private mismatch on the device, with no network call.
     - The mismatch log can be exported and fed into the evaluation as extra labelled cases.
   - It never shows a percentage, a grade or red marks.
   - Results stay private on the device.
   - Example wording: "You covered how chlorophyll absorbs light. Not yet: where the glucose goes."
6. **Later.** Concepts with gaps come back. The home screen shows one button, "Do 3 due now (about 5 min)", with the names of those three concepts listed under it. The full schedule is one tap away.

It is not flashcards and has no AI-literacy content. There is no account. All data stays on the device unless the student exports it.

## Scope by gate (hold this order strictly)

### Gate A: MVP, end of week 4
- Paste notes, extract concepts, explain, show coverage. The app works offline at a public URL.
- **Extractor:** tokenizer, a fixed stopword list, our own simple suffix stemmer, and TF-IDF ranking across the student's notes plus a bundled background frequency list. No POS chunker yet.
- **Scorer:** stem matching plus a synonym map of 50 entries or fewer.
- **Storage:** IndexedDB with export.
- If Gate A misses, stop and defer the SD entry. Do not take time from the Webmaster entry.

### Gate B: weeks 5-6
- Noun-phrase chunking.
- The Leitner revisit scheduler, with boxes at 1, 2, 4, 8 and 16 days. Date math is safe across time zones, and it is deterministic when given a clock.
- Speech-to-text through the Web Speech API, labelled "your browser may send audio to its speech service; typing keeps everything on this device".
  - The mic path is an optional add-on outside the core flow. The core flow (paste, extract, type, coverage, revisit) makes no network calls. Test this with the network blocked and the mic unused.
- Import and export.
- Usability testing.

### Gate C: week 7
- Feature freeze, then the docs and the evaluation write-up.

## The original engineering (what judges grade; document it)
**`packages/engine`** is pure TypeScript with no DOM, documented as a library with its README and API docs.

The **coverage scorer** is our main contribution. Document it in `docs/coverage-scorer.md` with the algorithm, worked examples and its known failure cases.
- **Units:** a note is split into sentence-level **facts**. Each concept owns the facts that mention it.
- **Matching:** a fact counts as covered when the explanation contains a phrase window that matches at least the fact's key terms, after stemming and synonym mapping. Set the threshold as a named constant, document it, and tune it on the tuning set only.
- **Output:** `{ covered: Fact[], missing: Fact[], evidence: Span[] }`. No user-facing number.

## Data, licensing and consent (do this before the first build)
- **`docs/sources.md`:**
  - the background frequency list and synonym map, each with source, license and link;
  - fonts: Atkinson Hyperlegible Next (Braille Institute, SIL OFL) and Bricolage Grotesque (SIL OFL);
  - Lucide (ISC) and every npm dependency's license.
- **Fixtures** live in the repo:
  - at least 3 note sets of 300 words or more, written by the team;
  - at least 10 explanations whose quality is known (good, partial, wrong).
- **Real classmate notes** are allowed only with written student and guardian consent, anonymised. Record the retention rule in `docs/data.md`.

## Tests and evaluation
- **Tests:** Vitest unit tests for every engine function, plus property-based tests with fast-check:
  - `covered` and `missing` never overlap and together equal all facts;
  - the result is stable under casing, whitespace and the order of repeated words;
  - the scheduler never schedules in the past;
  - the scheduler stays correct across DST and time zones.
- **Coverage reporting:** write the line-coverage HTML report to `docs/coverage/`.
- **Evaluation in `docs/evaluation.md`:**
  - Write the labelling rubric before any scoring.
  - Hand-label 30 or more (explanation, notes) pairs at the fact level, as covered or missing.
  - Two team members label every pair, tuning and held-out, independently. Report Cohen's kappa for their agreement, and settle disagreements by discussion.
  - Freeze all labels, and commit them with a date, before any threshold tuning begins.
  - Split them into 15 or more for tuning and 15 or more held out.
  - Report precision and recall on the held-out set, with n and the pair counts.
  - Use the numbers we actually measured, and say plainly if they are weak.

## App stack
- Vite + React + TypeScript (strict).
- `vite-plugin-pwa` for offline support and install.
- IndexedDB via `idb`.
- One public URL (Vercel or GitHub Pages) and a public repo. Exactly one deliverable: no native app, and no CLI beyond `pnpm` scripts.

## Screens (design every state: empty, loading, error, offline)
- **Today:**
  - first launch with the sample note ready;
  - "Do 3 due now (about 5 min)";
  - an empty state when nothing is due.
- **Notes:**
  - a paste area with a visible label;
  - an import error that names the cause ("This file isn't text").
- **Concepts:** a pre-selected list with untick, rename, merge, and select-all or none.
- **Explain:**
  - a large text area;
  - a labelled mic button;
  - "Check my explanation", disabled when the area is empty, with the reason shown.
- **Coverage:**
  - "You covered" and "Not yet" lists, each with the quoted line from the notes;
  - "Try again" and "Next concept".
- **Schedule:**
  - upcoming concepts;
  - export and import;
  - "Delete everything", behind a confirm step that says it cannot be undone.

## Design system (its own identity, not Neuronaut's; tokens only)
- **Light colors:**
  - background `#f7f8f6`, surface `#ffffff`;
  - ink `#17191c`, secondary ink `#4a4f57`;
  - one accent, deep green `#0f6b4f`, for primary actions and "covered";
  - "Not yet" in amber `#8a5a00`, always with an icon and text, never red, never color alone.
- **Dark colors:** background `#121416`, surface `#1b1e21`, ink `#e8eae6`, secondary `#b4b9b2`, accent `#5cc39a`, amber `#e0a93b`. Check that every text pair reaches 4.5:1 in both schemes.
- **Type:**
  - Atkinson Hyperlegible Next for UI and body; Bricolage Grotesque for headings only. Self-host both with `font-display: swap`.
  - Body 17px, line-height 1.6, 65ch measure.
  - Scale: 14 / 17 / 21 / 27 / 33. Sentence case.
- **Shape:**
  - One 8px radius.
  - 1px borders only where they separate content.
  - No shadows except on the install prompt.
- **Spacing:** an 8pt spacing scale. Every target at least 44×44px.
- **Icons:** lucide-react only, outline style, each with a label or an `aria-label`.
- **Motion:** 200ms ease-out for state changes only. Honour `prefers-reduced-motion`. No confetti, no streak flames.

## Banned
- **Color and surface:** purple, indigo or violet; gradients; glassmorphism.
- **Layout:** three equal cards; bento grids.
- **Pressure and fake proof:** streak or XP pressure; leaderboards; fake testimonials or stats.
- **UI details:** emoji icons; toasts that vanish before they can be read; placeholder-only labels; generic "Something went wrong" errors.
- **Network:** any network call in the core flow.

## Submission documents (in `docs/submission/`, written in original words, not reused from the Webmaster entry)
- **`summary.md`.** One page, about 450 words, with these sections:
  - Problem (60 words)
  - Who it's for (40 words)
  - How it works (80 words)
  - Original engineering (120 words)
  - Testing and evaluation results (80 words, with the real numbers)
  - Limitations (40 words)
  - AI use (30 words)
- **`ai-reflection.md`.** What AI tools were used, for what, what we changed, and what we wrote ourselves. At most 4 pages.
- **`user-testing.md`.** Five to eight classmates, with written permission and no personal data stored: the tasks, what they struggled with, and what we changed as a result.

## Acceptance checks (run them and report real output)
1. `pnpm test` passes. The property tests are included. `docs/coverage/` exists.
2. `docs/evaluation.md` has the rubric, the tuning/held-out split, the held-out precision and recall, and n.
3. The app installs as a PWA, and the whole flow works with the network off.
4. **First-round time.** A first-time user on a fresh profile finishes a round with the sample note in under 2 minutes. The first one-sentence win comes in under 30 seconds.
   - Measure it with a screen recording, timed from first paint to the coverage screen.
   - Do 3 runs and take the median.
   - Record each time and the median in `docs/user-testing.md`.
5. axe reports zero serious or critical issues. Focus is visible. The app works at 320px width and at 200% zoom, in light and dark modes.
6. Lighthouse on mobile shows LCP under 2.5s, and the PWA checks pass.
7. The separation check returns nothing:
   `grep -rniE "neuronaut|\bpip\b|gelasio|caveat|c2410c" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude='*.lock' --exclude='pnpm-lock.yaml' --exclude='package-lock.json'`
   This runs from the repo root, so root files such as `package.json` and `README.md` are included.
   Also confirm `docs/sources.md` lists every license.

Do not commit or deploy unless asked.
