import { careers } from "@/lib/supabase/careers/career";
import { createClient } from "@/lib/supabase/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type GroqResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

const careersContext = careers
  .map((career) => [
    `${career.name} (${career.id})`,
    `Description: ${career.shortDescription}`,
    `Education: ${career.educationPaths.map((path) => path.degree).join("; ")}`,
    `Titles: ${career.jobTitles.join(", ")}`,
    `Demand: ${career.currentDemand}`,
  ].join("\n"))
  .join("\n\n");

const systemPrompt = `You are a knowledgeable, encouraging career and education assistant for students. Help students explore careers, compare paths, choose subjects, understand education requirements, and plan practical next steps. Be specific, balanced, and clear about uncertainty; never promise job outcomes. You can answer broader career and education questions beyond the catalogue below.

When a question relates to one of the curated careers, use this catalogue as your grounded source of truth. Do not invent catalogue-specific facts that are not listed here.

CURATED CAREER CATALOGUE
${careersContext}`;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= 12_000
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Please sign in to use the career assistant." }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: "The career assistant is not configured yet." }, { status: 500 });
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0 || !body.messages.every(isChatMessage)) {
    return Response.json({ error: "A valid conversation is required." }, { status: 400 });
  }

  const messages = body.messages as ChatMessage[];
  if (messages[0]?.role !== "user") {
    return Response.json({ error: "A conversation must start with a user message." }, { status: 400 });
  }

  if (messages.at(-1)?.role !== "user") {
    return Response.json({ error: "The latest message must be from the user." }, { status: 400 });
  }

  // The UI retains a failed user message so it remains visible. Merge any
  // consecutive roles before forwarding so the conversation stays well-formed.
  const groqMessages = messages.reduce<ChatMessage[]>((conversation, message) => {
    const previous = conversation.at(-1);
    if (previous?.role === message.role) {
      previous.content = `${previous.content}\n\n${message.content}`;
    } else {
      conversation.push({ ...message });
    }
    return conversation;
  }, []);

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        max_tokens: 1_000,
        messages: [
          { role: "system", content: systemPrompt },
          ...groqMessages,
        ],
      }),
    });

    const data = (await groqResponse.json()) as GroqResponse;
    if (!groqResponse.ok) {
      return Response.json(
        { error: data.error?.message ?? "The career assistant could not answer right now." },
        { status: groqResponse.status },
      );
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return Response.json({ error: "The career assistant returned an empty response." }, { status: 502 });
    }

    return Response.json({ reply });
  } catch {
    return Response.json({ error: "Unable to reach the career assistant. Please try again." }, { status: 502 });
  }
}
