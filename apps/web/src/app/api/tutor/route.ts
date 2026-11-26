import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { tutorConfigured, tutorStream } from "@/lib/tutor";

const Body = z.object({
  question: z.string().trim().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(12)
    .default([]),
  lessonId: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  if (!tutorConfigured()) {
    return Response.json({ error: "Ask Pip isn't set up on this server yet." }, { status: 503 });
  }
  if (!rateLimit(`tutor:${clientKey(req)}`, 20, 10 * 60_000)) {
    return Response.json({ error: "You're asking fast! Take a short break and try again in a few minutes." }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "That message couldn't be read." }, { status: 400 });

  try {
    const { stream, lessons } = await tutorStream(parsed.data);
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) controller.enqueue(encoder.encode(chunk));
        } catch (err) {
          console.error("tutor stream error", err);
          controller.enqueue(encoder.encode("\n\n(Pip lost the connection. Please try again.)"));
        } finally {
          controller.close();
        }
      },
    });
    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        // Lessons whose text grounded this answer, for the "From lesson" line. URI-encoded JSON.
        "X-Pip-Lessons": encodeURIComponent(JSON.stringify(lessons)),
      },
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Pip is busy right now. Try again in a minute." }, { status: 429 });
    }
    console.error("tutor error", err);
    return Response.json({ error: "Pip couldn't answer right now. Try again soon." }, { status: 502 });
  }
}
