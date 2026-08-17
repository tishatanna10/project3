import { extractResumeText, isSupportedResumeFile, maximumResumeFileSize } from "@/lib/resume/extract";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Exchange = {
  question: string;
  answer: string;
  answerMeta?: { durationSeconds?: number; fillerWords?: Record<string, number>; speechRecognitionUsed?: boolean };
};

type SerperResult = { organic?: Array<{ title?: string; snippet?: string }>; message?: string };
type GroqResult = { choices?: Array<{ message?: { content?: string | null } }>; error?: { message?: string } };

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function validExchange(value: unknown): value is Exchange {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.question === "string" && typeof item.answer === "string";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Please sign in to start an interview." }, { status: 401 });
  if (!process.env.SERPER_API_KEY || !process.env.GROQ_API_KEY) {
    return Response.json({ error: "Interview practice is not configured yet." }, { status: 500 });
  }

  let formData: FormData;
  try { formData = await request.formData(); } catch { return Response.json({ error: "Invalid interview request." }, { status: 400 }); }
  const role = formData.get("role");
  const resume = formData.get("resume");
  const jobDescription = formData.get("jobDescription");
  const conversation = parseJson<unknown[]>(formData.get("conversation"), []);
  const suppliedSnippets = parseJson<unknown[]>(formData.get("marketSnippets"), []);

  if (typeof role !== "string" || !role.trim()) return Response.json({ error: "Choose or enter a target role." }, { status: 400 });
  if (!(resume instanceof File) || resume.size === 0 || !isSupportedResumeFile(resume)) return Response.json({ error: "Upload a PDF or DOCX resume." }, { status: 400 });
  if (resume.size > maximumResumeFileSize) return Response.json({ error: "Your resume must be 5 MB or smaller." }, { status: 400 });
  if (!conversation.every(validExchange) || conversation.length > 7) return Response.json({ error: "Invalid interview transcript." }, { status: 400 });

  if (conversation.length >= 7) return Response.json({ shouldEnd: true });

  let resumeText: string;
  try { resumeText = (await extractResumeText(resume)).trim(); } catch { return Response.json({ error: "We could not read this resume. Please try another PDF or DOCX." }, { status: 422 }); }
  if (!resumeText) return Response.json({ error: "No readable text was found in this resume." }, { status: 422 });

  let marketSnippets = suppliedSnippets.filter((item): item is string => typeof item === "string").slice(0, 5);
  if (marketSnippets.length === 0) {
    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": process.env.SERPER_API_KEY },
        body: JSON.stringify({ q: `${role.trim()} common interview questions`, num: 5 }),
      });
      const data = (await response.json()) as SerperResult;
      if (!response.ok) return Response.json({ error: data.message ?? "Unable to retrieve interview-market context." }, { status: 502 });
      marketSnippets = (data.organic ?? []).flatMap((item) => item.snippet ? [`${item.title ?? "Interview result"}: ${item.snippet}`] : []).slice(0, 5);
    } catch {
      return Response.json({ error: "Unable to retrieve interview-market context. Please try again." }, { status: 502 });
    }
  }

  const transcript = conversation.length
    ? conversation.map((item, index) => `Question ${index + 1}: ${item.question}\nCandidate answer: ${item.answer}`).join("\n\n")
    : "No earlier interview exchanges.";
  const prompt = `Create exactly one next mock-interview question for a ${role.trim()} candidate. This is question ${conversation.length + 1} of 7. Ask only the question, without a preface, coaching, rubric, or multiple questions. Make it natural and specific. Use the resume for project/experience references when relevant, and use the previous answer to ask a useful follow-up where appropriate. Mix resume-specific and role-specific questions across the interview.\n\nJob description:\n${typeof jobDescription === "string" && jobDescription.trim() ? jobDescription.slice(0, 12_000) : "Not provided."}\n\nInterview-question inspiration from current search results:\n${marketSnippets.join("\n")}\n\nResume:\n${resumeText.slice(0, 45_000)}\n\nConversation so far:\n${transcript}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        max_tokens: 350,
        reasoning_effort: "low",
        messages: [
          { role: "system", content: "You are an expert mock interviewer. Ask one fair, job-relevant interview question at a time." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = (await response.json()) as GroqResult;
    if (!response.ok) return Response.json({ error: data.error?.message ?? "Unable to generate an interview question." }, { status: 502 });
    const question = data.choices?.[0]?.message?.content?.trim();
    if (!question) return Response.json({ error: "The interviewer returned an empty question." }, { status: 502 });
    return Response.json({ question, marketSnippets, shouldEnd: false });
  } catch {
    return Response.json({ error: "Unable to generate an interview question. Please try again." }, { status: 502 });
  }
}
