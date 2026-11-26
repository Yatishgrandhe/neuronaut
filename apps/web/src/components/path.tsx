"use client";

import Link from "next/link";
import { Check, Lock, Star } from "lucide-react";
import {
  isLessonUnlocked,
  moduleProgress,
  nextLesson,
  type Module,
} from "@neuronaut/core";
import { Pip } from "./brand";
import { useProgress } from "./progress";

const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];

export function ModulePath({ module, index }: { module: Module; index: number }) {
  const { state, ready } = useProgress();
  const current = ready ? nextLesson(state) : undefined;
  const { done, total } = moduleProgress(state, module.id);

  return (
    <section className="path-module" data-color={module.color} aria-labelledby={`pm-${module.id}`}>
      <header className="path-band">
        <div>
          <h2 id={`pm-${module.id}`}>
            <Link href={`/learn/${module.id}`}>
              <span className="num path-n">{index + 1}.</span> {module.title}
            </Link>
          </h2>
          <p className="path-tag">{module.tagline}</p>
        </div>
        <div className="band-meter" role="img" aria-label={`${done} of ${total} lessons complete`}>
          <span className={`num${ready ? "" : " skel"}`}>
            {done}/{total}
          </span>
          <span className="meter">
            <span style={{ width: `${(done / total) * 100}%` }} />
          </span>
        </div>
      </header>

      <ol className="path-nodes">
        {module.lessons.map((l, i) => {
          const isDone = Boolean(state.lessons[l.id]);
          const open = ready && isLessonUnlocked(state, l.id);
          const isCurrent = current?.id === l.id;
          const perfect = (state.lessons[l.id]?.bestAccuracy ?? 0) === 1;
          const status = isDone ? "done" : open ? "open" : "locked";
          const label = `${l.title}: ${isDone ? "completed" : open ? "ready to start" : "locked, finish the previous lesson first"}`;
          return (
            <li key={l.id} style={{ "--x": `${OFFSETS[(i + index * 2) % OFFSETS.length]}px` } as React.CSSProperties}>
              {!ready ? (
                <span className="node skel" aria-hidden />
              ) : status === "locked" ? (
                <span className="node" data-status="locked" aria-label={label} role="img">
                  <Lock aria-hidden strokeWidth={2.5} />
                </span>
              ) : (
                <Link className="node" data-status={status} data-current={isCurrent} href={`/lesson/${l.id}`} aria-label={label}>
                  {isDone ? perfect ? <Star aria-hidden fill="currentColor" /> : <Check aria-hidden strokeWidth={3} /> : <span className="num">{i + 1}</span>}
                </Link>
              )}
              <span className="node-title">{l.title}</span>
              {isCurrent && (
                <span className="node-pip" aria-hidden>
                  <span className="bubble bubble-sm">Start here</span>
                  <Pip mood="idle" size={64} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
