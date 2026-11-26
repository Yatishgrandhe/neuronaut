"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Undo2, X } from "lucide-react";
import { flashcards, seededShuffle, type StudyCard } from "@neuronaut/core";
import { useProgress } from "./progress";
import "../app/study.css";

type Scope = "finished" | "all";

/**
 * Flashcards in the Quizlet pattern: flip a card, then sort it into "Still learning" or "Know it".
 * Cards you're still learning come back in the next round until the pile is empty.
 */
export function Flashcards() {
  const { state, ready } = useProgress();
  const finished = Object.keys(state.lessons);
  const [scope, setScope] = useState<Scope | null>(null);
  const active: Scope = scope ?? (finished.length ? "finished" : "all");
  const [round, setRound] = useState(1);
  const [deck, setDeck] = useState<StudyCard[] | null>(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learning, setLearning] = useState<StudyCard[]>([]);
  const [known, setKnown] = useState(0);

  const base = useMemo(
    () => (ready ? seededShuffle(flashcards(active === "finished" ? finished : undefined), `${active}-${finished.length}`) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, active, finished.length],
  );
  const cards = deck ?? base;
  const card = cards[i];
  const doneRound = ready && i >= cards.length && cards.length > 0;

  const start = (s: Scope) => {
    setScope(s);
    setDeck(null);
    setI(0);
    setFlipped(false);
    setLearning([]);
    setKnown(0);
    setRound(1);
  };

  const sort = useCallback(
    (know: boolean) => {
      if (!card) return;
      if (know) setKnown((k) => k + 1);
      else setLearning((l) => [...l, card]);
      setFlipped(false);
      setI((n) => n + 1);
    },
    [card],
  );

  const undo = () => {
    if (i === 0) return;
    const prev = cards[i - 1];
    if (learning.at(-1)?.id === prev.id) setLearning((l) => l.slice(0, -1));
    else setKnown((k) => Math.max(0, k - 1));
    setFlipped(false);
    setI(i - 1);
  };

  const again = () => {
    setDeck(learning);
    setLearning([]);
    setI(0);
    setFlipped(false);
    setRound((r) => r + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card || e.target instanceof HTMLButtonElement && e.key === " ") return;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowLeft") sort(false);
      else if (e.key === "ArrowRight") sort(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, sort]);

  return (
    <div className="wrap-narrow study">
      <header className="study-head">
        <Link href="/learn" className="back-link">
          <ArrowLeft size={18} aria-hidden /> Learning path
        </Link>
        <h1>Flashcards</h1>
        <p className="lede">Read the front, say the answer in your head, then flip. Be honest about which pile it goes in.</p>
        <div className="seg" role="group" aria-label="Which cards">
          <button type="button" aria-pressed={active === "finished"} disabled={!finished.length} onClick={() => start("finished")}>
            Lessons I&rsquo;ve done{finished.length ? ` (${finished.length})` : ""}
          </button>
          <button type="button" aria-pressed={active === "all"} onClick={() => start("all")}>
            Whole course
          </button>
        </div>
      </header>

      {!ready ? (
        <div className="fc-card skel" aria-hidden />
      ) : doneRound ? (
        <section className="study-done" role="status">
          <h2>Round {round} done</h2>
          <p className="num">
            {known} known, {learning.length} still learning.
          </p>
          <div className="study-actions">
            {learning.length ? (
              <button type="button" className="btn btn-spark btn-lg" onClick={again}>
                <RotateCcw size={20} aria-hidden /> Study the {learning.length} again
              </button>
            ) : (
              <p className="study-win">You sorted every card into &ldquo;Know it&rdquo;.</p>
            )}
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => start(active)}>
              Start over
            </button>
            <Link className="btn btn-ghost btn-lg" href="/practice">
              Test yourself in Practice
            </Link>
          </div>
        </section>
      ) : card ? (
        <>
          <div className="fc-tally num" aria-live="polite">
            <span className="fc-pile fc-learning">
              <X size={16} aria-hidden /> Still learning {learning.length}
            </span>
            <span>
              {i + 1} / {cards.length}
            </span>
            <span className="fc-pile fc-known">
              <Check size={16} aria-hidden /> Know it {known}
            </span>
          </div>
          <button
            type="button"
            className="fc-card"
            data-flipped={flipped}
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Showing the answer. Press to see the front." : "Showing the front. Press to flip."}
          >
            <span className="fc-face fc-front" aria-hidden={flipped}>
              <span className="fc-kind">{card.kind === "idea" ? "Big idea" : "True or false?"}</span>
              <span className="fc-text">{card.front}</span>
              <span className="fc-from">{card.lesson}</span>
            </span>
            <span className="fc-face fc-back" aria-hidden={!flipped}>
              <span className="fc-text fc-text-sm">{card.back}</span>
              <span className="fc-from">{card.lesson}</span>
            </span>
          </button>
          <div className="fc-actions">
            <button type="button" className="btn btn-lg fc-no" onClick={() => sort(false)}>
              <ArrowLeft size={20} aria-hidden /> Still learning
            </button>
            <button type="button" className="icon-btn" onClick={undo} disabled={i === 0} aria-label="Undo last card">
              <Undo2 aria-hidden />
            </button>
            <button type="button" className="btn btn-lg fc-yes" onClick={() => sort(true)}>
              Know it <ArrowRight size={20} aria-hidden />
            </button>
          </div>
          <p className="study-keys">Space flips the card. Left arrow: still learning. Right arrow: know it.</p>
        </>
      ) : (
        <p>No cards yet.</p>
      )}
    </div>
  );
}
