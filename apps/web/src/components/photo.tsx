import { photoCredit, photoUrl, photos, type PhotoKey } from "@neuronaut/core";

/** Unsplash photo with responsive sizes. Credit appears on /about. */
export function Photo({
  name,
  width,
  height,
  className,
  priority,
  sizes = "(max-width: 720px) 100vw, 50vw",
}: {
  name: PhotoKey;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const p = photos[name];
  const srcSet = [0.5, 1, 1.5, 2]
    .map((m) => `${photoUrl(p, Math.round(width * m), Math.round(height * m))} ${Math.round(width * m)}w`)
    .join(", ");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Unsplash's CDN resizes; hotlinking is required by their guidelines.
    <img
      className={className}
      src={photoUrl(p, width, height)}
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      alt={p.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
}

export function PhotoCredit({ name }: { name: PhotoKey }) {
  const p = photos[name];
  const c = photoCredit(p);
  return (
    <>
      Photo by <a href={c.photographerUrl}>@{p.by}</a> on <a href={c.photoUrl}>Unsplash</a>
    </>
  );
}
