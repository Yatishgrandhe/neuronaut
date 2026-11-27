import Link from "next/link";
import { first, headline, sub } from "./data";

const start = `/lesson/${first.id}`;

function Nav({ cls, cta = "Start lesson 1" }: { cls: string; cta?: string }) {
  return (
    <header className={`${cls}-nav`}>
      <Link href="/" className={`${cls}-mark`}>
        Neuronaut
      </Link>
      <nav aria-label="Main">
        <Link href="/learn">Learn</Link>
        <Link href="/practice">Practice</Link>
        <Link href="/ask">Ask Pip</Link>
        <Link href="/about">About</Link>
      </nav>
      <Link href={start} className={`${cls}-navcta`}>
        {cta}
      </Link>
    </header>
  );
}

/** Night-sky site header. Shared by every Night sky version. */
export function SkyNav() {
  return <Nav cls="sk" />;
}

/** Night-sky hero: the ISS photograph, the headline, and the start button. */
export function SkyHero() {
  return (
    <section className="sk-hero">
      <div className="sk-photo" aria-hidden />
      <div className="sk-hero-text">
        <h1>{headline}</h1>
        <p>{sub}</p>
        <Link href={start} className="sk-btn">
          Start lesson 1
        </Link>
      </div>
      <p className="sk-credit">The Milky Way from the International Space Station. NASA.</p>
    </section>
  );
}
