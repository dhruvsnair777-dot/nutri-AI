import { NextResponse } from "next/server";
import type { NutritionTargets, UserProfile } from "@/lib/types";
import {
  buildMealPlanPrompt,
  extractJson,
  normalizeMealPlan,
  safeFallbackPlan,
} from "@/lib/mealPlan";
import { calculateTargets, safeNumber } from "@/lib/nutrition";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface RequestBody {
  profile?: UserProfile;
  targets?: NutritionTargets;
}

async function callGemini(
  apiKey: string,
  system: string,
  prompt: string,
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");
  return text;
}

async function callOpenAI(
  apiKey: string,
  system: string,
  prompt: string,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned no text");
  return text;
}

const SYSTEM_PROMPT =
  "You are a certified nutritionist. You ONLY respond with valid, minified JSON. Never include markdown, code fences, or explanations.";

export async function POST(request: Request) {
  // Parse the incoming body defensively.
  let body: RequestBody = {};
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    body = {};
  }

  const profile = body.profile;
  if (!profile || typeof profile !== "object") {
    return NextResponse.json(
      { error: "Missing profile", source: "error" },
      { status: 400 },
    );
  }

  // Recompute targets server-side as the source of truth with math guards.
  const targets = calculateTargets({
    ...profile,
    weight: safeNumber(profile.weight),
    height: safeNumber(profile.height),
    age: safeNumber(profile.age),
  });

  const prompt = buildMealPlanPrompt(profile, targets);
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  try {
    let text: string;
    if (geminiKey) {
      text = await callGemini(geminiKey, SYSTEM_PROMPT, prompt);
    } else if (openaiKey) {
      text = await callOpenAI(openaiKey, SYSTEM_PROMPT, prompt);
    } else {
      // No key configured: return a deterministic fallback plan.
      return NextResponse.json({
        plan: safeFallbackPlan(profile, targets),
        source: "fallback",
        targets,
      });
    }

    const parsed = extractJson(text);
    const plan = normalizeMealPlan(parsed, targets);
    return NextResponse.json({ plan, source: "ai", targets });
  } catch (error) {
    // JSON parse failure, malformed shape, or provider outage.
    console.error("[meal-plan] generation failed:", error);
    return NextResponse.json({
      plan: safeFallbackPlan(profile, targets),
      source: "fallback",
      targets,
    });
  }
}
