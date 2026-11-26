# Neuronaut: one-page summary (Software Development, TSA 2026-27)

> Draft. The team must rewrite this in their own words and fill in every [TEAM] part before uploading it.

**Team:** [TEAM: names and chapter number]  **Live site:** [TEAM: URL]  **Code:** https://github.com/Yatishgrandhe/neuronaut

## The learning problem
High school students use AI for schoolwork every day, but most have never been taught how it works, when it makes things up, or where help turns into cheating. One-off lessons fade within days. We wanted software that teaches AI literacy and also makes it stick.

## Our solution
Neuronaut is a free website with 12 short lessons in three modules: How AI Works, Using AI Well, and AI Ethics & Integrity. Each lesson is two short idea cards and five questions, with instant explanations. After that, the software decides what each learner should do next.

## How the software works
- **Mastery model (Bayesian Knowledge Tracing).** Each lesson is a skill. Every answer updates the probability that the learner knows it, with Bayes' rule. The guess rate depends on the question type, so easy guesses count for less.
- **Forgetting curve.** After 3 days without practice, a mastery estimate decays with a 21-day half-life, so skills a learner is starting to forget come back.
- **Adaptive practice.** A practice set of 5 questions comes from finished lessons that aren't mastered yet. A lesson's chance of being picked is 1 − mastery (at least 0.05), so weak lessons come up most. A right answer on a question that is due for review also counts as reviewing it.
- **Spaced review.** A missed question returns after 0, 1, 3, 7 and 16 days (a Leitner system) until it is answered right five times in a row.
- **"Next."** One recommendation in a fixed order: due reviews, then practice on a finished lesson below 60%, then the next new lesson, then practice on the weakest lesson not yet mastered.
- **Motivation without pressure.** XP, levels, 9 badges, and a streak that is protected by automatic freezes. There are no lives to lose.
- **Ask Pip.** An AI tutor that answers from our own lessons (BM25 search, then Claude). It explains ideas and refuses to write graded work.

## Engineering
TypeScript monorepo. The engine is pure functions in `packages/core`, with the date passed in, so it is fully testable. It has 40 automated tests, including property tests over thousands of random cases. The tests found, and we fixed, three real data-loss bugs in save merging and a gap in Ask Pip's lesson search. One known limit is still there: merging two saves keeps the larger XP total and the larger daily totals rather than adding them together, because a save doesn't record which device earned what. Saved progress is versioned, with a migration from the old format, and imported files are validated so a broken one can't crash the app. No accounts: progress is saved on the device and can be backed up as a file. Lighthouse accessibility, best practices and SEO all scored 100.

## Evidence it helps
[TEAM: results of your classmate test. For example: N students took lesson 1, then a short quiz the same day and again one week later, comparing those who used Practice and Review with those who didn't. Report the real numbers, even if they are small or mixed.]
