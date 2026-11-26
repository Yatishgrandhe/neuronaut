"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Download, Dumbbell, Flame, Play, Repeat2, RotateCcw, Snowflake, Sparkles, Upload, Zap } from "lucide-react";
import {
  BADGES,
  MAX_FREEZES,
  dayKey,
  levelProgress,
  masteryLabel,
  masteryOf,
  moduleProgress,
  modules,
  weekDays,
  recommendNext,
  sampleProgress,
  visibleStreak,
  weekXp,
} from "@neuronaut/core";
import { BadgeGlyph } from "./badge";
import { Pip } from "./brand";
import { useProgress } from "./progress";

const EPOCH = new Date(0);
const SAMPLE_FLAG = "neuronaut.sample";

export function Dashboard() {
  const { state, ready, exportJson, importJson, reset, setState } = useProgress();
  // Time-dependent values are computed only on the client (never during prerender).
  const now = ready ? new Date() : EPOCH;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsSample(localStorage.getItem(SAMPLE_FLAG) === "1"));
    return () => cancelAnimationFrame(id);
  }, []);
  const clearSample = () => {
    localStorage.removeItem(SAMPLE_FLAG);
    setIsSample(false);
    reset();
    setMsg("Sample progress cleared.");
  };

  const lp = levelProgress(state.xp);
  const streak = ready ? visibleStreak(state, dayKey(now)) : 0;
  const days = weekDays(state, now);
  const maxDay = Math.max(20, ...days.map((d) => d.xp));
  const week = weekXp(state, now);
  const lessonsDone = Object.keys(state.lessons).length;
  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  const earnedCount = BADGES.filter((b) => state.badges[b.id]).length;
  const today = dayKey(now);
  const rec = ready ? recommendNext(state, today) : null;

  const download = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `neuronaut-progress-${dayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg("Backup downloaded. Import it on another device to carry your progress over.");
  };

  return (
    <div className="wrap dash">
      <header className="page-head dash-head">
        <div>
          <h1>My progress</h1>
          <p className="lede">
            {lessonsDone === 0
              ? "Finish your first lesson to start your streak and earn your first badge."
              : `${lessonsDone} of ${totalLessons} lessons complete. Keep going.`}
          </p>
        </div>
        <Pip mood={lessonsDone ? "happy" : "idle"} size={96} />
      </header>

      {isSample && lessonsDone > 0 ? (
        <p className="sample-banner" role="status">
          <span>
            <strong>This is sample progress</strong>, not yours: six days of lessons run through the real engine.
          </span>
          <button type="button" className="btn btn-ghost" onClick={clearSample}>
            Clear sample
          </button>
        </p>
      ) : null}
      {rec ? <NextUp rec={rec} /> : null}
      {ready && lessonsDone === 0 ? (
        <p className="dash-sample">
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setState(sampleProgress());
              localStorage.setItem(SAMPLE_FLAG, "1");
              setIsSample(true);
            }}
          >
            <Sparkles size={16} aria-hidden /> See this page with sample progress
          </button>
        </p>
      ) : null}

      <section className="dash-top" aria-label="Summary">
        <div className="dash-level">
          <p className="dash-label">Level</p>
          <p className={`dash-big num${ready ? "" : " skel"}`}>{lp.level}</p>
          <div className="meter meter-lg">
            <span style={{ width: `${(lp.into / lp.span) * 100}%` }} />
          </div>
          <p className="dash-sub num">
            {lp.span - lp.into} XP to level {lp.level + 1}
          </p>
        </div>
        <div className="dash-tile tile-xp">
          <Zap aria-hidden />
          <p className={`dash-big num${ready ? "" : " skel"}`}>{state.xp}</p>
          <p className="dash-label">Total XP</p>
        </div>
        <div className="dash-tile tile-streak">
          <Flame aria-hidden />
          <p className={`dash-big num${ready ? "" : " skel"}`}>{streak}</p>
          <p className="dash-label">Day streak. Best: {state.streak.longest}</p>
          <p className="freezes" aria-label={`${state.streak.freezes} of ${MAX_FREEZES} streak freezes`}>
            {Array.from({ length: MAX_FREEZES }, (_, k) => (
              <Snowflake key={k} size={18} aria-hidden data-on={k < state.streak.freezes} />
            ))}
            <span>Freezes cover missed days automatically</span>
          </p>
        </div>
      </section>

      <section className="dash-week" aria-labelledby="wk-h">
        <div className="week-head">
          <h2 id="wk-h">This week</h2>
          <p className="num">
            {week} / {state.weeklyGoal} XP goal
          </p>
        </div>
        <div className="meter meter-lg goal-meter">
          <span style={{ width: `${Math.min(week / state.weeklyGoal, 1) * 100}%` }} />
        </div>
        {week === 0 ? (
          <p className="week-empty">No XP yet this week. One lesson earns about 75 XP, so the goal is two lessons away.</p>
        ) : null}
        {week === 0 ? null : (
        <ol className="bars" aria-label="XP earned each day this week">
          {days.map((d) => {
            const date = new Date(`${d.day}T12:00:00`);
            return (
              <li key={d.day} aria-label={`${date.toLocaleDateString(undefined, { weekday: "long" })}: ${d.xp} XP`}>
                <span className="bar-val num">{d.xp || ""}</span>
                <span className="bar" style={{ height: `${(d.xp / maxDay) * 100}%` }} data-today={d.day === dayKey(now)} data-future={d.future} />
                <span className="bar-day">{date.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
              </li>
            );
          })}
        </ol>
        )}
      </section>

      <section className="dash-modules" aria-labelledby="mod-h">
        <div className="week-head">
          <h2 id="mod-h">Skills</h2>
          <Link href="/how-we-built-it#mastery" className="small">
            How mastery is worked out
          </Link>
        </div>
        <p className="dash-note">
          Each lesson is one skill. The estimate rises with first-try answers, falls with misses, and fades if you haven&rsquo;t
          practised it for a while.
        </p>
        {modules.map((m) => {
          const p = moduleProgress(state, m.id);
          return (
            <div key={m.id} className="skill-mod">
              <h3>
                <Link href={`/learn/${m.id}`}>{m.title}</Link> <span className="num muted">{p.done}/{p.total} lessons</span>
              </h3>
              {m.lessons.every((l) => state.mastery[l.id] === undefined) ? (
                <p className="skill-none">Not started yet. Your first lesson here adds {m.lessons.length} skills to track.</p>
              ) : (
              <ul className="skills">
                {m.lessons.map((l) => {
                  const started = state.mastery[l.id] !== undefined;
                  const v = masteryOf(state, l.id, today);
                  const label = masteryLabel(started ? v : undefined);
                  return (
                    <li key={l.id} data-level={label}>
                      <span className="skill-name">{l.title}</span>
                      <span
                        className="meter"
                        role="meter"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={started ? Math.round(v * 100) : 0}
                        aria-label={`${l.title} mastery`}
                      >
                        <span style={{ width: `${started ? v * 100 : 0}%` }} />
                      </span>
                      <span className="skill-label">
                        {label}
                        {started ? <span className="skill-pct num">{Math.round(v * 100)}%</span> : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
              )}
            </div>
          );
        })}
      </section>

      <section className="dash-badges" aria-labelledby="bd-h">
        <h2 id="bd-h">
          Badges <span className="num muted">{earnedCount} of {BADGES.length}</span>
        </h2>
        <ul className="badge-grid">
          {BADGES.map((b) => {
            const at = state.badges[b.id];
            return (
              <li key={b.id} data-earned={Boolean(at)}>
                <BadgeGlyph glyph={b.glyph} earned={Boolean(at)} />
                <p className="badge-name">{b.name}</p>
                <p className="badge-desc">{at ? `Earned ${new Date(at).toLocaleDateString()}` : b.description}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="dash-data" aria-labelledby="data-h">
        <h2 id="data-h">Your data</h2>
        <p>
          Progress is stored only in this browser. Download a backup to keep it safe or move it to another device.
        </p>
        <div className="data-actions">
          <button type="button" className="btn btn-ghost" onClick={download}>
            <Download size={18} aria-hidden /> Download backup
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={18} aria-hidden /> Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setMsg(importJson(await f.text()) ? "Backup imported." : "That file isn't a Neuronaut backup.");
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn btn-ghost danger"
            onClick={() => {
              if (confirm("Erase all progress on this device? This can't be undone unless you have a backup.")) {
                localStorage.removeItem(SAMPLE_FLAG);
                setIsSample(false);
                reset();
                setMsg("Progress erased.");
              }
            }}
          >
            <RotateCcw size={18} aria-hidden /> Start over
          </button>
        </div>
        {msg && (
          <p className="data-msg" role="status">
            {msg}
          </p>
        )}
      </section>
    </div>
  );
}

function NextUp({ rec }: { rec: ReturnType<typeof recommendNext> }) {
  const body =
    rec.kind === "review"
      ? { icon: <Repeat2 aria-hidden />, title: `${rec.count} question${rec.count > 1 ? "s" : ""} due for review`, why: "Reviewing on the day it's due is what makes it stick.", href: "/review", cta: "Start review" }
      : rec.kind === "practice"
        ? { icon: <Dumbbell aria-hidden />, title: `Practise ${rec.lesson.title}`, why: `Your mastery there is ${Math.round(rec.mastery * 100)}%, your lowest.`, href: "/practice", cta: "Practise now" }
        : rec.kind === "lesson"
          ? { icon: <Play aria-hidden />, title: rec.lesson.title, why: `Next new lesson, about ${rec.lesson.minutes} minutes.`, href: `/lesson/${rec.lesson.id}`, cta: "Start lesson" }
          : { icon: <Sparkles aria-hidden />, title: "Everything is mastered", why: "Come back in a week: practice will bring back anything you start to forget.", href: "/learn", cta: "Browse lessons" };
  return (
    <section className="next-up" aria-labelledby="next-h">
      <span className="next-icon">{body.icon}</span>
      <div>
        <h2 id="next-h">Next: {body.title}</h2>
        <p className="next-why">{body.why}</p>
      </div>
      <Link className="btn btn-spark" href={body.href}>
        {body.cta} <ArrowRight size={18} aria-hidden />
      </Link>
    </section>
  );
}
