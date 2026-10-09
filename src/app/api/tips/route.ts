import { NextResponse } from "next/server";
import { DAILY_TIPS, randomTip } from "@/lib/tips";

export const dynamic = "force-dynamic";

/**
 * Returns a daily tip. Uses Anthropic-style curated tips by default and can be
 * upgraded to an LLM provider via OPENAI_API_KEY / GEMINI_API_KEY.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exclude = searchParams.get("exclude") ?? undefined;
  const goal = searchParams.get("goal") ?? "general";
  const restriction = searchParams.get("restriction") ?? "none";

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({
      tip: randomTip(exclude),
      source: "curated",
    });
  }

  const prompt = `Give one short, practical nutrition tip (max 28 words) for someone whose goal is "${goal}" and dietary restriction is "${restriction}". Respond with ONLY the tip text, no quotes.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.9,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("No tip returned");
    return NextResponse.json({
      tip: { id: `ai_${Date.now()}`, text, tag: "AI" },
      source: "ai",
    });
  } catch {
    return NextResponse.json({
      tip: randomTip(exclude),
      source: "curated",
    });
  }
}

export async function POST() {
  return NextResponse.json({ tips: DAILY_TIPS, source: "curated" });
}
