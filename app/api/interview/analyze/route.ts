import { createClient } from "@/lib/supabase/server";

type GroqResult = { choices?: Array<{ message?: { content?: string | null } }>; error?: { message?: string } };

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Please sign in to analyze an interview." }, { status: 401 });
  if (!process.env.GROQ_API_KEY) return Response.json({ error: "Interview analysis is not configured yet." }, { status: 500 });

  let body: { role?: unknown; transcript?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid interview report request." }, { status: 400 }); }
  if (typeof body.role !== "string" || !Array.isArray(body.transcript) || body.transcript.length !== 10) return Response.json({ error: "A completed ten-question interview is required." }, { status: 400 });

  const prompt = `Assess this mock interview for the target role of ${body.role}. Be encouraging but candid, specific, and evidence-based. Evaluate observable communication patterns only; never diagnose emotions, personality, health, or mental state. Treat speech and presence metadata as imperfect, optional signals and describe only observable patterns.

Score realistically and strictly. Irrelevant answers, evasions, non-answers, unsupported claims, and answers showing no real understanding should be low scores, not lenient middle scores. Reward genuine role-relevant substance, accurate reasoning, concrete examples, and clear structure. State plainly in feedback when an answer dodges or fails to answer the question.

Return only valid JSON with exactly this shape:\n{\n  "overallScore": 0,\n  "categoryScores": { "communication": 0, "answerQuality": 0, "roleKnowledge": 0, "clarity": 0, "conciseness": 0 },\n  "finalReview": "...",\n  "strengths": ["..."],\n  "weaknesses": ["..."],\n  "topImprovements": ["..."],\n  "speechPatterns": ["..."],\n  "perQuestionFeedback": [{ "question": "...", "answer": "...", "whatWentWell": "...", "whatCouldBeBetter": "...", "betterApproach": "...", "presencePatterns": ["..."] }]\n}\n
Scores must be integers from 0 to 100. finalReview is the closing review: write multiple readable paragraphs that identify the 2–4 biggest weaknesses across the entire interview, citing the relevant question number/topic and a short quote or accurate paraphrase from the candidate's answer as evidence. For each weakness, explain a concrete way to handle it next time using specific techniques, answer structures, frameworks, or preparation topics tailored to ${body.role}. End finalReview with a short, clearly labelled "Action plan:" followed by a few concrete practice steps before the next interview. Do not make finalReview generic: name the actual missing concepts, skills, frameworks, or reasoning patterns from the answers.

Every perQuestionFeedback item must be specific and evidence-based for that exact question and answer:
- whatCouldBeBetter must quote a short phrase from the answer or accurately paraphrase its actual content, then explain exactly why that content was wrong, off-target, unsupported, incomplete, or weak. Never give a generic critique that could apply to another answer.
- betterApproach must prescribe a concrete answer structure and exact content tailored to the question and ${body.role}: name the specific concepts, frameworks, decisions, evidence, or technical details a strong answer should cover. Include a brief role-relevant example phrasing when useful.
- Do not use generic filler such as "could be improved," "needs more detail," "be more specific," or "elaborate" unless it is immediately followed by the precise missing content.
- If an answer is topically off-target, factually wrong, evasive, or does not answer the question, explicitly say so in whatCouldBeBetter and score it low regardless of fluent delivery.

Each presencePatterns array must contain only descriptive, observable statements supported by that answer's presenceMetrics (for example, "looked away from the camera frequently during this answer" or "noticeably more movement than other answers"). Never infer emotion or confidence. If no presenceMetrics are supplied, return an empty array.\n\nTranscript:\n${JSON.stringify(body.transcript).slice(0, 60_000)}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", max_tokens: 4_500, reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "system", content: "You are a fair, evidence-based interview coach. Return only JSON." }, { role: "user", content: prompt }] }),
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
