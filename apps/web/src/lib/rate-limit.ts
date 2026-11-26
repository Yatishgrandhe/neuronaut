import "server-only";

/**
 * Small in-memory sliding-window limiter (per server instance).
 *
 * Two limits protect the Anthropic bill: one per visitor, and one shared by everyone, so even a
 * visitor who changes IP for every request can't spend more than the global cap.
 */
const hits = new Map<string, number[]>();
const MAX_KEYS = 5000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.delete(key); // re-insert so Map order stays least-recently-used first
  hits.set(key, list);
  // Evict the oldest keys only. (Clearing the whole map would reset every visitor's limit.)
  while (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value as string);
  return true;
}

/**
 * The visitor's IP as seen by the hosting platform. `x-real-ip` is set by the platform (Vercel)
 * and not taken from the client. With only `x-forwarded-for`, use the right-most entry: the hop
 * added by our own proxy. The left-most entries are whatever the client chose to send.
 */
export function clientKey(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const hops = req.headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return hops?.length ? hops[hops.length - 1] : "local";
}
