"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { LessonWindow } from "@/components/home/lesson-screens";
import { LESSON_STEPS, type StepIndex } from "@/components/home/lesson-steps";
import "@/app/home-carousel.css";

const COUNT = LESSON_STEPS.length;
/** A card's animations run once at least this share of it is visible. */
const PLAY_RATIO = 0.6;

type CarouselView = { visible: boolean[]; active: number };

const INITIAL_VIEW: CarouselView = {
  visible: LESSON_STEPS.map(() => false),
  active: 0,
};

/** Mobile (< 768px) swipe carousel for "How a lesson works". Hidden on desktop via CSS. */
export function LessonCarousel() {
  const reduced = useReducedMotion() ?? false;
  const scrollerRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [view, setView] = useState<CarouselView>(INITIAL_VIEW);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const ratios = LESSON_STEPS.map(() => 0);
    const indexOf = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = indexOf.get(entry.target);
          if (index === undefined) continue;
          ratios[index] = entry.isIntersecting ? entry.intersectionRatio : 0;
        }
        const nextVisible = ratios.map((r) => r >= PLAY_RATIO);
        let best = 0;
        for (let i = 1; i < ratios.length; i++) {
          if (ratios[i] > ratios[best]) best = i;
        }
        setView((prev) => {
          const same =
            prev.active === best && prev.visible.every((v, i) => v === nextVisible[i]);
          return same ? prev : { visible: nextVisible, active: best };
        });
      },
      { root, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      indexOf.set(el, i);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      const card = cardRefs.current[index];
      if (!scroller || !card) return;
      const pad = parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
      scroller.scrollTo({
        left: card.offsetLeft - pad,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [reduced],
  );

  return (
    <section className="lc" aria-roledescription="carousel" aria-label="How a lesson works">
      <ul ref={scrollerRef} className="lc-track" aria-label="Lesson steps, swipe for more" tabIndex={0}>
        {LESSON_STEPS.map((s, i) => {
          const step = i as StepIndex;
          return (
            <li
              key={s.num}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="lc-card"
              aria-roledescription="slide"
              aria-label={`Step ${i + 1} of ${COUNT}`}
            >
              <LessonWindow
                step={step}
                playing={view.visible[i]}
                reduced={reduced}
                compact
                fit="auto"
                onNext={i < COUNT - 1 ? () => goTo(i + 1) : undefined}
              />
              <div className="lc-text">
                <span className="lc-num">{s.num}</span>
                <h3 className="lc-title">{s.title}</h3>
                <p className="lc-body">{s.body}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="lc-dots">
        {LESSON_STEPS.map((s, i) => {
          const isActive = view.active === i;
          return (
            <button
              key={s.num}
              type="button"
              className={isActive ? "lc-dot is-active" : "lc-dot"}
              aria-label={`Go to step ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => goTo(i)}
            />
          );
        })}
      </div>
    </section>
  );
}
