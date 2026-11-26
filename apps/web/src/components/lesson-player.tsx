"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Flame, Lock, Snowflake, Target, Zap } from "lucide-react";
import {
  completeLesson,
  getLesson,
  getModule,
  isLessonUnlocked,
  levelProgress,
  type ProgressEvent,
} from "@neuronaut/core";
import { Pip } from "./brand";
import { BadgeGlyph } from "./badge";
import { useProgress } from "./progress";
import { Runner, type RunResult } from "./runner";

type Phase = "cards" | "quiz" | "done";

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)!;
  const mod = getModule(lesson.moduleId)!;
  const { state, setState, ready } = useProgress();
  const [phase, setPhase] = useState<Phase>("cards");
  const [card, setCard] = useState(0);
  const [outcome, setOutcome] = useState<{ events: ProgressEvent[]; accuracy: number } | null>(null);

  if (ready && !isLessonUnlocked(state, lessonId) && phase !== "done") {
    return (
      <div className="wrap-narrow locked-screen">
        <Pip mood="think" size={112} />
        <h1>This lesson is still locked</h1>
        <p>Finish the lesson before it in {mod.title} first. Lessons build on each other.</p>
        <Link className="btn btn-spark btn-lg" href={`/learn/${mod.id}`}>
          <Lock size={18} aria-hidden /> Back to {mod.title}
        </Link>
      </div>
    );
  }

  const finish = (results: RunResult[]) => {
    const r = completeLesson(
      state,
      lesson,
      results.map((x) => ({ exerciseId: x.key.split(":")[1], correct: x.correct, retried: x.retried })),
    );
    setState(r.state);
    setOutcome({ events: r.events, accuracy: r.accuracy });
    setPhase("done");
  };

  if (phase === "cards") {
    const c = lesson.cards[card];
    const last = card === lesson.cards.length - 1;
    return (
      <div className="cards-screen" data-color={mod.color}>
        <div className="wrap-narrow">
          <Link href={`/learn/${mod.id}`} className="back-link">
            <ArrowLeft size={18} aria-hidden /> {mod.title}
          </Link>
          <p className="module-step num">
            Idea {card + 1} of {lesson.cards.length}
          </p>
          <div className="idea-card" key={card}>
            <h1>{c.title}</h1>
            <p>{c.body}</p>
          </div>
          <div className="cards-foot">
            <Pip mood={last ? "happy" : "idle"} size={72} />
            <div className="cards-actions">
              {card > 0 && (
                <button type="button" className="btn btn-ghost" onClick={() => setCard(card - 1)}>
                  Back
                </button>
              )}
              <button
                type="button"
                className="btn btn-spark btn-lg"
                autoFocus
                onClick={() => (last ? setPhase("quiz") : setCard(card + 1))}
              >
                {last ? "Start practice" : "Next idea"} <ArrowRight size={20} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    return (
      <Runner
        items={lesson.exercises.map((e) => ({ key: `${lesson.id}:${e.id}`, exercise: e }))}
        exitHref={`/learn/${mod.id}`}
        onFinish={finish}
      />
    );
  }

  const events = outcome?.events ?? [];
  const xp = events.filter((e) => e.type === "xp").reduce((n, e) => n + (e.type === "xp" ? e.amount : 0), 0);
  const badges = events.flatMap((e) => (e.type === "badge" ? [e.badge] : []));
  const streakEv = events.find((e) => e.type === "streak");
  const levelUp = events.find((e) => e.type === "level");
  const lp = levelProgress(state.xp);
  const pct = Math.round((outcome?.accuracy ?? 0) * 100);

  return (
    <div className="done-screen">
      <div className="wrap-narrow done-inner">
        <div className="burst" aria-hidden>
          {Array.from({ length: 14 }, (_, k) => (
            <span key={k} style={{ "--k": k } as React.CSSProperties} />
          ))}
        </div>
        <Pip mood="cheer" size={132} className="done-pip" />
        <h1>{pct === 100 ? "Flawless!" : "Lesson complete!"}</h1>
        <p className="lede">{lesson.title}</p>

        <dl className="done-stats">
          <div className="stat stat-xp">
            <dt>
              <Zap aria-hidden size={18} /> XP earned
            </dt>
            <dd className="num">+{xp}</dd>
          </div>
          <div className="stat stat-acc">
            <dt>
              <Target aria-hidden size={18} /> First-try accuracy
            </dt>
            <dd className="num">{pct}%</dd>
          </div>
          <div className="stat stat-streak">
            <dt>
              {streakEv?.type === "streak" && streakEv.usedFreeze ? <Snowflake aria-hidden size={18} /> : <Flame aria-hidden size={18} />} Streak
            </dt>
            <dd className="num">{state.streak.current} {state.streak.current === 1 ? "day" : "days"}</dd>
          </div>
        </dl>
        {streakEv?.type === "streak" && streakEv.usedFreeze && (
          <p className="done-note">A streak freeze covered the day you missed. No stress.</p>
        )}

        <div className="level-row" aria-label={`Level ${lp.level}, ${lp.into} of ${lp.span} XP to next level`}>
          <span className="level-badge num">Lv {lp.level}</span>
          <span className="meter meter-lg">
            <span style={{ width: `${(lp.into / lp.span) * 100}%` }} />
          </span>
          {levelUp?.type === "level" && <span className="level-up">Level up!</span>}
        </div>

        {badges.length > 0 && (
          <section className="new-badges" aria-labelledby="nb-h">
            <h2 id="nb-h">New badge{badges.length > 1 ? "s" : ""}</h2>
            <ul>
              {badges.map((b) => (
                <li key={b.id}>
                  <BadgeGlyph glyph={b.glyph} earned size={64} />
                  <div>
                    <p className="badge-name">{b.name}</p>
                    <p className="badge-desc">{b.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="done-actions">
          <Link className="btn btn-spark btn-lg btn-block" href="/learn">
            Continue <ArrowRight size={20} aria-hidden />
          </Link>
          {pct < 100 && (
            <Link className="btn btn-ghost btn-lg btn-block" href="/review">
              Review mistakes
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
