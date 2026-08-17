import { createClient } from "@/lib/supabase/server";

type GroqResult = { choices?: Array<{ message?: { content?: string | null } }>; error?: { message?: string } };

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Please sign in to analyze an interview." }, { status: 401 });
  if (!process.env.GROQ_API_KEY) return Response.json({ error: "Interview analysis is not configured yet." }, { status: 500 });

  let body: { role?: unknown; transcript?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid interview report request." }, { status: 400 }); }
  if (typeof body.role !== "string" || !Array.isArray(body.transcript) || body.transcript.length !== 7) return Response.json({ error: "A completed seven-question interview is required." }, { status: 400 });

  const prompt = `Assess this mock interview for the target role of ${body.role}. Be encouraging but candid. Evaluate observable communication patterns only; never diagnose emotions, personality, health, or mental state. Treat speech metadata as imperfect and describe it only as patterns. Return only valid JSON with exactly this shape:\n{\n  "overallScore": 0,\n  "categoryScores": { "communication": 0, "answerQuality": 0, "roleKnowledge": 0, "clarity": 0, "conciseness": 0 },\n  "strengths": ["..."],\n  "weaknesses": ["..."],\n  "topImprovements": ["..."],\n  "speechPatterns": ["..."],\n  "perQuestionFeedback": [{ "question": "...", "answer": "...", "whatWentWell": "...", "whatCouldBeBetter": "...", "betterApproach": "..." }]\n}\nScores must be integers from 0 to 100.\n\nTranscript:\n${JSON.stringify(body.transcript).slice(0, 60_000)}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", max_tokens: 3_000, reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "system", content: "You are a fair, evidence-based interview coach. Return only JSON." }, { role: "user", content: prompt }] }),
    });
    const data = (await response.json()) as GroqResult;
    if (!response.ok) return Response.json({ error: data.error?.message ?? "Unable to analyze the interview." }, { status: 502 });
    const content = data.choices?.[0]?.message?.content;
    if (!content) return Response.json({ error: "The interview analyzer returned an empty response." }, { status: 502 });
    return Response.json({ report: JSON.parse(content) });
  } catch {
    return Response.json({ error: "Unable to analyze the interview. Please try again." }, { status: 502 });
  }
}
