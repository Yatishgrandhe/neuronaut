"use client";

import Link from "next/link";
import { BookOpen, Check, Dumbbell, Flame, Layers, Lock, Puzzle, Repeat2, Star } from "lucide-react";
import {
  dayKey,
  dueReviewKeys,
  isLessonUnlocked,
  levelProgress,
  masteryLabel,
  masteryOf,
  moduleProgress,
  modules,
  nextLesson,
  visibleStreak,
} from "@neuronaut/core";
import { GOALS, useDailyGoal } from "./daily-goal";
import { useProgress } from "./progress";
import "../app/path.css";

/** How far each node sits from the centre line, in steps. The path winds like a trail. */
const WIND = [0, 1, 1.6, 1, 0, -1, -1.6, -1];

/** One vertical path through every unit, with the current lesson raised and marked "Start". */
export function LearnPath() {
  const { state, ready } = useProgress();
  const today = ready ? dayKey() : "1970-01-01";
  const current = ready ? nextLesson(state) : undefined;
  let step = 0;

  return (
    <ol className="trail" aria-label="Learning path">
      {modules.map((m, mi) => {
        const { done, total } = moduleProgress(state, m.id);
        const practiceOpen = ready && done > 0;
        return (
          <li key={m.id} className="trail-unit">
            <header className="unit-card">
              <div>
                <p className="unit-n num">Unit {mi + 1}</p>
                <h2>{m.title}</h2>
                <p className="unit-tag">{m.tagline}</p>
              </div>
              <div className="unit-side">
                <span className={`num unit-count${ready ? "" : " skel"}`}>
                  {done}/{total}
                </span>
                <Link className="unit-guide" href={`/learn/${m.id}`}>
                  <BookOpen size={18} aria-hidden /> Guide
                </Link>
              </div>
            </header>

            <ol className="trail-nodes">
              {m.lessons.map((l) => {
                const x = WIND[step++ % WIND.length];
                const rec = state.lessons[l.id];
                const open = ready && isLessonUnlocked(state, l.id);
                const isCurrent = current?.id === l.id;
                const status = rec ? "done" : open ? "open" : "locked";
                const mastery = rec ? masteryOf(state, l.id, today) : 0;
                const level = rec ? masteryLabel(mastery) : null;
                const label = `${l.title}: ${rec ? `completed, ${level}` : open ? "ready to start" : "locked, finish the lesson before it first"}`;
                return (
                  <li key={l.id} className="trail-step" style={{ "--x": x } as React.CSSProperties} data-current={isCurrent || undefined}>
                    {isCurrent ? (
                      <span className="trail-start" aria-hidden>
                        {rec ? "Practise" : "Start"}
                      </span>
                    ) : null}
                    {!ready ? (
                      <span className="trail-node skel" aria-hidden />
                    ) : status === "locked" ? (
                      <span className="trail-node" data-status="locked" role="img" aria-label={label}>
                        <Lock aria-hidden />
                      </span>
                    ) : (
                      <Link
                        className="trail-node"
                        data-status={status}
                        href={`/lesson/${l.id}`}
                        aria-label={label}
                        style={rec ? ({ "--m": `${Math.round(mastery * 100)}%` } as React.CSSProperties) : undefined}
                      >
                        {rec ? rec.bestAccuracy === 1 ? <Star aria-hidden fill="currentColor" /> : <Check aria-hidden strokeWidth={3} /> : <Star aria-hidden />}
                      </Link>
                    )}
                    <span className="trail-label">
                      <span className="trail-title">{l.title}</span>
                      {level ? <span className="trail-level">{level}</span> : null}
                    </span>
                  </li>
                );
              })}
              <li className="trail-step trail-check" style={{ "--x": WIND[step++ % WIND.length] } as React.CSSProperties}>
                {practiceOpen ? (
                  <Link className="trail-node" data-status="check" href="/practice" aria-label={`Practice ${m.title}: questions from your weakest lessons`}>
                    <Dumbbell aria-hidden />
                  </Link>
                ) : (
                  <span className="trail-node" data-status="locked" role="img" aria-label={`Practice ${m.title}: opens after your first lesson in this unit`}>
                    <Dumbbell aria-hidden />
                  </span>
                )}
                <span className="trail-label">
                  <span className="trail-title">Unit practice</span>
                </span>
              </li>
            </ol>
          </li>
        );
      })}
    </ol>
  );
}

/** Side panel next to the path: streak, level, daily goal, review and study modes. */
export function PathRail() {
  const { state, ready } = useProgress();
  const [goal, setGoal] = useDailyGoal();
  const today = ready ? dayKey() : "1970-01-01";
  const streak = ready ? visibleStreak(state, today) : 0;
  const lp = levelProgress(state.xp);
  const todayXp = ready ? (state.history[today] ?? 0) : 0;
  const pct = Math.min(1, todayXp / goal);
  const due = ready ? dueReviewKeys(state, today).length : 0;
  const anyDone = Object.keys(state.lessons).length > 0;
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <aside className="rail" aria-label="Your day">
      <dl className="rail-stats">
        <div>
          <dt>
            <Flame size={18} aria-hidden /> Streak
          </dt>
          <dd className="num">
            {streak} {streak === 1 ? "day" : "days"}
          </dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd className="num">
            {lp.level} <span className="rail-sub">{lp.into}/{lp.span} XP</span>
          </dd>
        </div>
      </dl>

      <section className="rail-card" aria-labelledby="goal-h">
        <div className="goal-row">
          <svg className="goal-ring" viewBox="0 0 80 80" role="img" aria-label={`${todayXp} of ${goal} XP today`}>
            <circle cx="40" cy="40" r={R} className="goal-track" />
            <circle cx="40" cy="40" r={R} className="goal-fill" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
          </svg>
          <div>
            <h2 id="goal-h">Daily goal</h2>
            <p className="num">
              {pct >= 1 ? "Done for today. Nice." : `${todayXp} of ${goal} XP today`}
            </p>
          </div>
        </div>
        <div className="goal-pick" role="group" aria-label="Choose a daily goal">
          {GOALS.map((g) => (
            <button key={g.xp} type="button" aria-pressed={goal === g.xp} onClick={() => setGoal(g.xp)}>
              <span>{g.label}</span>
              <span className="num rail-sub">{g.xp} XP</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rail-card" aria-labelledby="study-h">
        <h2 id="study-h">Study modes</h2>
        <ul className="rail-links">
          <li>
            <Link href="/review">
              <Repeat2 size={20} aria-hidden />
              <span>
                Review
                <span className="rail-sub">{due ? `${due} due now` : "Nothing due"}</span>
              </span>
            </Link>
          </li>
          <li>
            <Link href="/practice/flashcards">
              <Layers size={20} aria-hidden />
              <span>
                Flashcards
                <span className="rail-sub">{anyDone ? "Flip through the big ideas" : "Every lesson's big ideas"}</span>
              </span>
            </Link>
          </li>
          <li>
            <Link href="/practice/match">
              <Puzzle size={20} aria-hidden />
              <span>
                Match
                <span className="rail-sub">Pair terms with their meaning</span>
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </aside>
  );
}
