"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Download, Flame, RotateCcw, Snowflake, Upload, Zap } from "lucide-react";
import {
  BADGES,
  MAX_FREEZES,
  dayKey,
  levelProgress,
  moduleProgress,
  modules,
  recentDays,
  visibleStreak,
  weekXp,
} from "@neuronaut/core";
import { BadgeGlyph } from "./badge";
import { Pip } from "./brand";
import { useProgress } from "./progress";

const EPOCH = new Date(0);

export function Dashboard() {
  const { state, ready, exportJson, importJson, reset } = useProgress();
  // Time-dependent values are computed only on the client (never during prerender).
  const now = ready ? new Date() : EPOCH;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const lp = levelProgress(state.xp);
  const streak = ready ? visibleStreak(state, dayKey(now)) : 0;
  const days = recentDays(state, 7, now);
  const maxDay = Math.max(20, ...days.map((d) => d.xp));
  const week = weekXp(state, now);
  const lessonsDone = Object.keys(state.lessons).length;
  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  const earnedCount = BADGES.filter((b) => state.badges[b.id]).length;

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
          <p className="dash-label">Day streak · best {state.streak.longest}</p>
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
        <ol className="bars" aria-label="XP earned on each of the last 7 days">
          {days.map((d) => {
            const date = new Date(`${d.day}T12:00:00`);
            return (
              <li key={d.day} aria-label={`${date.toLocaleDateString(undefined, { weekday: "long" })}: ${d.xp} XP`}>
                <span className="bar-val num">{d.xp || ""}</span>
                <span className="bar" style={{ height: `${(d.xp / maxDay) * 100}%` }} data-today={d.day === dayKey(now)} />
                <span className="bar-day">{date.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="dash-modules" aria-labelledby="mod-h">
        <h2 id="mod-h">Modules</h2>
        <ul>
          {modules.map((m) => {
            const p = moduleProgress(state, m.id);
            return (
              <li key={m.id} data-color={m.color}>
                <Link href={`/learn/${m.id}`}>
                  <span className="dm-title">{m.title}</span>
                  <span className="meter">
                    <span style={{ width: `${(p.done / p.total) * 100}%` }} />
                  </span>
                  <span className="num dm-count">
                    {p.done}/{p.total}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
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
