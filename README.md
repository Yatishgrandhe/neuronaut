# Neuronaut

Short lessons for high schoolers on how AI works, how to use it well, and how to use it honestly. The learning engine works out what each learner should see next.

- **Webmaster entry (TSA 2026-27):** an AI learning portal with 3 modules (How AI Works, Using AI Well, AI Ethics & Integrity), 12 lessons, 60 questions, XP, levels, streaks, badges and a progress dashboard. The copyright checklist and work log are linked from every page.
- **Software Development entry (TSA 2026-27):** software that improves how people learn. Lessons teach an idea; a mastery model, adaptive practice and spaced review bring it back until it sticks. See `docs/software-development/`.

> Before entering both events with one project, the advisor must confirm with the event coordinator that this is allowed under the 2026-27 general rules.

## Run it

Needs Node 24+ and pnpm 10.

```bash
pnpm install
```

```bash
pnpm --filter web dev
```

Production build:

```bash
pnpm --filter web build && pnpm --filter web start
```

Ask Pip needs `ANTHROPIC_API_KEY` in `apps/web/.env.local` (see `.env.example`). Everything else works without it.

## Test it

```bash
pnpm --filter @neuronaut/core test
```

The engine has 31 tests. They cover the Bayes formula against hand-worked numbers, property checks over thousands of random cases, the review schedule, streak freezes, damaged and old save files, and merging two saves.

## How it fits together

| Folder | What it is |
|---|---|
| `packages/core` | Pure TypeScript, no browser code. Lessons (`content.ts`), answer checking (`check.ts`), XP, streaks, badges and the Leitner review scheduler (`engine.ts`), the mastery model (`mastery.ts`), and demo data built by running the real engine (`sample.ts`). |
| `apps/web` | Next.js 16 site. Progress is saved in the browser (localStorage); there are no accounts. |
| `apps/web/src/lib/tutor.ts` | Ask Pip: BM25 search over the lesson text, then Claude answers from the passages it finds. |
| `apps/web/planet` | The hero "word planet": Rust compiled to WebAssembly and drawn with WebGL2. |

## The learning engine in one paragraph

Each lesson is a skill with a Bayesian Knowledge Tracing estimate of how likely the learner is to know it. Every first-try answer updates the estimate with Bayes' rule. The guess rate depends on the question type: 50% for true/false, 25% for four options, 5% for ordering and matching. After a 3-day grace period, a forgetting curve with a 21-day half-life lets the estimate fade without practice. Practice picks questions from finished lessons that aren't mastered, weighted by 1 − mastery (minimum weight 0.05). If every finished lesson is mastered, it draws from all of them. Missed questions go into a Leitner review queue that brings them back after 0, 1, 3, 7 and 16 days. A right practice answer on a question that is due counts as reviewing it. The dashboard's "Next" card picks one thing: due reviews first, then practice on a finished lesson below 60%, then the next new lesson, then practice on the weakest lesson not yet mastered. The full explanation is on `/how-we-built-it#mastery`.
