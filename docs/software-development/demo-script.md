# Live demo script (about 4 minutes)

Use the production build, in a fresh browser profile.

1. **The problem (20 s).** Students use AI daily, but nobody teaches them how it works, and one-off lessons fade.
2. **A lesson (60 s).** Open Learn, then lesson 1. Read an idea card. Answer one question wrong on purpose: you get a hint and another try, with no lives lost. Then answer one right and point out "+10 XP" and the explanation.
3. **The engine (90 s).** Open Progress and click "Fill this page with sample progress". This runs six days of lessons through the real engine; no numbers are typed in by hand.
   - The "Next" card says reviews are due. Explain why reviews come first: spacing only works on time.
   - Skills: "Prompts that work" is at 31%. Explain BKT: Bayes' rule, and the guess rates by question type.
   - Point out that "What counts as AI?" was aced 6 days ago and is already below Mastered. That's the forgetting curve: after a 3-day grace period, mastery fades with a 21-day half-life.
4. **Practice (40 s).** Open Practice. The focus list names the weakest lessons. Do a set, then show each lesson's mastery before and after.
5. **Review (20 s).** Open Review: the missed questions are waiting, on 0, 1, 3, 7 and 16-day gaps.
6. **Quality (30 s).** Run `pnpm --filter @neuronaut/core test` live (40 pass). Mention the three merge bugs and the search gap the tests caught.
7. **Ask Pip (optional, needs an API key).** Ask "Can you write my essay on AI bias?" Pip declines and shows how to start instead.

Backup plan: have screenshots of each step in case the venue network fails. Only Ask Pip needs the internet.
