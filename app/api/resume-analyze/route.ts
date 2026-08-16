import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const maximumFileSize = 5 * 1024 * 1024;

type SerperResult = {
  organic?: Array<{ title?: string; snippet?: string }>;
  message?: string;
};

type GroqResult = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

type ResumeAnalysis = {
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  missingKeywords: string[];
  rewriteSuggestions: Array<{ original: string; improved: string; explanation: string }>;
};

function supportedResumeType(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx");
}

async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.name.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      return (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  }

  return (await mammoth.extractRawText({ buffer })).value;
}

function normalizeAnalysis(value: unknown): ResumeAnalysis | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const stringList = (field: string) =>
    Array.isArray(data[field]) ? data[field].filter((item): item is string => typeof item === "string") : [];
  const rewriteSuggestions = Array.isArray(data.rewriteSuggestions)
    ? data.rewriteSuggestions.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return [];
        const suggestion = item as Record<string, unknown>;
        if (
          typeof suggestion.original !== "string" ||
          typeof suggestion.improved !== "string" ||
          typeof suggestion.explanation !== "string"
        ) return [];
        return [{ original: suggestion.original, improved: suggestion.improved, explanation: suggestion.explanation }];
      })
    : [];

  return {
    strengths: stringList("strengths"),
    weaknesses: stringList("weaknesses"),
    missingSkills: stringList("missingSkills"),
    missingKeywords: stringList("missingKeywords"),
    rewriteSuggestions,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Please sign in to analyze a resume." }, { status: 401 });
  }

  if (!process.env.SERPER_API_KEY || !process.env.GROQ_API_KEY) {
    return Response.json({ error: "Resume analysis is not configured yet." }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const role = formData.get("role");
  const resume = formData.get("resume");
  if (typeof role !== "string" || !role.trim()) {
    return Response.json({ error: "Choose or enter a target role." }, { status: 400 });
  }
  if (!(resume instanceof File) || resume.size === 0 || !supportedResumeType(resume)) {
    return Response.json({ error: "Upload a PDF or DOCX resume." }, { status: 400 });
  }
  if (resume.size > maximumFileSize) {
    return Response.json({ error: "Your resume must be 5 MB or smaller." }, { status: 400 });
  }

  let resumeText: string;
  try {
    resumeText = (await extractResumeText(resume)).trim();
  } catch {
    return Response.json({ error: "We could not read this resume file. Please try another PDF or DOCX." }, { status: 422 });
  }
  if (!resumeText) {
    return Response.json({ error: "No readable text was found in this resume." }, { status: 422 });
  }

  const targetRole = role.trim().slice(0, 160);
  const searchYear = new Date().getFullYear();
  let marketSnippets: string[];
  try {
    const serperResponse = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.SERPER_API_KEY,
      },
      body: JSON.stringify({ q: `${targetRole} job requirements skills ${searchYear}`, num: 5 }),
    });
    const serperData = (await serperResponse.json()) as SerperResult;
    if (!serperResponse.ok) {
      return Response.json({ error: serperData.message ?? "Unable to retrieve current market information." }, { status: 502 });
    }
    marketSnippets = (serperData.organic ?? [])
      .flatMap((result) => result.snippet ? [`${result.title ?? "Market result"}: ${result.snippet}`] : [])
      .slice(0, 5);
  } catch {
    return Response.json({ error: "Unable to retrieve current market information. Please try again." }, { status: 502 });
  }

  if (marketSnippets.length === 0) {
    return Response.json({ error: "No current market results were found for that role. Try a more specific title." }, { status: 404 });
  }

  const prompt = `Analyze this resume against the current market information for the target role. Treat market snippets as current but incomplete evidence; do not claim requirements that they do not support. Be constructive, specific, and honest. Do not fabricate experience from the resume.

Return only valid JSON with exactly this shape:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingSkills": ["..."],
  "missingKeywords": ["..."],
  "rewriteSuggestions": [{ "original": "exact or concise resume excerpt", "improved": "truthful improved version", "explanation": "why this improves alignment" }]
}

Target role: ${targetRole}

Current market snippets:
${marketSnippets.map((snippet, index) => `${index + 1}. ${snippet}`).join("\n")}

Resume text:
${resumeText.slice(0, 45_000)}`;

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        max_tokens: 2_000,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a precise resume and career analyst. Return only the requested JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const groqData = (await groqResponse.json()) as GroqResult;
    if (!groqResponse.ok) {
      return Response.json({ error: groqData.error?.message ?? "Unable to analyze the resume right now." }, { status: 502 });
    }

    const content = groqData.choices?.[0]?.message?.content;
    if (!content) {
      return Response.json({ error: "The resume analyzer returned an empty response." }, { status: 502 });
    }

    const analysis = normalizeAnalysis(JSON.parse(content));
    if (!analysis) {
      return Response.json({ error: "The resume analyzer returned an invalid result. Please try again." }, { status: 502 });
    }
    return Response.json({ analysis, marketSnippets });
  } catch {
    return Response.json({ error: "Unable to analyze the resume. Please try again." }, { status: 502 });
  }
}
