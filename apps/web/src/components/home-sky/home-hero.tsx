import type { ReactNode } from "react";
import Link from "next/link";
import { firstLessonHref, lessonLength } from "./content";

/**
 * Night sky hero: the ISS photograph, the headline, the start button and the facts.
 * `backdrop` replaces the photo (for a 3D or canvas background); the gradient shade stays above it.
 */
export function HomeHero({ backdrop }: { backdrop?: ReactNode }) {
  return (
    <section className="home-sky-hero" aria-labelledby="hero-h">
      {backdrop ? (
        <div className="home-sky-backdrop">{backdrop}</div>
      ) : (
        <picture className="home-sky-photo">
          <source
            type="image/avif"
            srcSet="/hero/iss-milky-way-1024.avif 1024w, /hero/iss-milky-way-1920.avif 1920w"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/hero/iss-milky-way-1024.webp 1024w, /hero/iss-milky-way-1920.webp 1920w"
            sizes="100vw"
          />
          {/* The photo is the LCP element: eager, high priority, sized so the layout never shifts. */}
          <img src="/hero/iss-milky-way-1920.webp" alt="" width={1920} height={1280} fetchPriority="high" />
        </picture>
      )}
      <div className="home-sky-shade" aria-hidden />

      <div className="home-sky-hero-text">
        <h1 id="hero-h">
          Short lessons on how AI works, and how to use it <em>honestly</em>.
        </h1>
        <p className="home-sky-sub">
          For high schoolers. Use AI well, and stay honest about it: how chatbots work, how to prompt them, and how to use
          them for school without cheating.
        </p>
        <div className="home-sky-actions">
          <Link id="hero-cta" href={firstLessonHref} className="home-sky-btn">
            Start lesson 1
          </Link>
          <Link href="/ask" className="home-sky-ask">
            or ask Pip a question
          </Link>
        </div>
        <ul className="home-sky-facts">
          <li>Free</li>
          <li>No account</li>
          <li>{lessonLength} lessons</li>
        </ul>
      </div>

      {!backdrop && (
        <p className="home-sky-credit">Sky: the Milky Way photographed from the International Space Station (NASA).</p>
      )}
    </section>
  );
}
