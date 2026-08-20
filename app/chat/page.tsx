"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content: message }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "Unable to get a response right now.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.reply! }]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Unable to get a response right now.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="flex flex-1 bg-slate-50 px-4 py-8 sm:py-10">
      <section className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-semibold text-indigo-600">Career assistant</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Talk through your next step</h1>
          <p className="mt-1 text-sm text-slate-600">Ask about careers, subjects, education, or preparing for a goal.</p>
        </header>

        <div className="h-[55vh] min-h-96 space-y-5 overflow-y-auto bg-slate-50 p-5 sm:p-6" aria-live="polite">
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm">
              Hi! I can help you explore careers, education paths, and next steps. What are you thinking about?
            </div>
          </div>
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === "user" ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>
                {message.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">Thinking…</div>
            </div>
          )}
          <div ref={threadEndRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t border-slate-200 p-4 sm:p-5">
          {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <div className="flex gap-3">
            <label className="sr-only" htmlFor="chat-message">Your message</label>
            <input id="chat-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask a career question..." disabled={isSending} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 disabled:bg-slate-50" />
            <Button type="submit" disabled={!input.trim() || isSending}>
              Send
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
