import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { generatePractice, tutorConfigured } from "@/lib/tutor";

const Body = z.object({ lessonId: z.string().max(64) });

export async function POST(req: Request) {
  if (!tutorConfigured()) {
    return Response.json({ error: "Extra practice isn't set up on this server yet." }, { status: 503 });
  }
  if (!rateLimit(`practice:${clientKey(req)}`, 6, 10 * 60_000)) {
    return Response.json({ error: "That's a lot of practice! Try again in a few minutes." }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Unknown lesson." }, { status: 400 });
  try {
    const set = await generatePractice(parsed.data.lessonId);
    return Response.json(set, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("practice error", err);
    return Response.json({ error: "Couldn't make new questions right now. Try again soon." }, { status: 502 });
  }
}
