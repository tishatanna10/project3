"use client";

import { FormEvent, useMemo, useState } from "react";
import { careers } from "@/lib/supabase/careers/career";
import { Button } from "@/components/ui/Button";

type ResumeAnalysis = {
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  missingKeywords: string[];
  rewriteSuggestions: Array<{ original: string; improved: string; explanation: string }>;
};

const customRoleValue = "__custom_role__";

export default function ResumePage() {
  const jobTitles = useMemo(() => Array.from(new Set(careers.flatMap((career) => career.jobTitles))).sort(), []);
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [marketSnippets, setMarketSnippets] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetRole = selectedRole === customRoleValue ? customRole.trim() : selectedRole;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resume || !targetRole) {
      setError("Choose a target role and upload your resume.");
      return;
    }

    setError("");
    setAnalysis(null);
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("role", targetRole);
    formData.set("resume", resume);

    try {
      const response = await fetch("/api/resume-analyze", { method: "POST", body: formData });
      const data = (await response.json()) as { analysis?: ResumeAnalysis; marketSnippets?: string[]; error?: string };
      if (!response.ok || !data.analysis) throw new Error(data.error ?? "Unable to analyze the resume.");
      setAnalysis(data.analysis);
      setMarketSnippets(data.marketSnippets ?? []);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Unable to analyze the resume.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 bg-slate-50 px-4 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold text-indigo-600">Resume analyzer</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Check your resume against today&apos;s market</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Upload a PDF or DOCX and choose a role. We&apos;ll compare your experience against live job-market search results.</p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Target role
              <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100">
                <option value="">Choose a role</option>
                {jobTitles.map((title) => <option key={title} value={title}>{title}</option>)}
                <option value={customRoleValue}>Other — type a role</option>
              </select>
            </label>

            {selectedRole === customRoleValue ? (
              <label className="block text-sm font-medium text-slate-700">
                Custom role
                <input value={customRole} onChange={(event) => setCustomRole(event.target.value)} placeholder="e.g. Cybersecurity Analyst" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" />
              </label>
            ) : <div className="hidden sm:block" />}

            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Resume file
              <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setResume(event.target.files?.[0] ?? null)} className="mt-2 block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100" />
              <span className="mt-2 block text-xs font-normal text-slate-500">PDF or DOCX, up to 5 MB{resume ? ` · ${resume.name}` : ""}</span>
            </label>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2" role="alert">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={!resume || !targetRole || isSubmitting}>
                {isSubmitting ? "Analyzing current market..." : "Analyze resume"}
              </Button>
            </div>
          </form>
        </section>

        {analysis && (
          <section className="mt-6 space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <ResultList title="Strengths" items={analysis.strengths} tone="emerald" />
              <ResultList title="Areas to strengthen" items={analysis.weaknesses} tone="amber" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <TagCard title="Missing skills" tags={analysis.missingSkills} />
              <TagCard title="Keywords to consider" tags={analysis.missingKeywords} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Rewrite suggestions</h2>
              {analysis.rewriteSuggestions.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {analysis.rewriteSuggestions.map((suggestion, index) => (
                    <article key={`${suggestion.original}-${index}`} className="rounded-xl border border-slate-200 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Before</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{suggestion.original}</p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-indigo-600">After</p>
                      <p className="mt-1 text-sm leading-6 text-slate-900">{suggestion.improved}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{suggestion.explanation}</p>
                    </article>
                  ))}
                </div>
              ) : <p className="mt-4 text-sm text-slate-600">No targeted rewrites were suggested.</p>}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Market signals used</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {marketSnippets.map((snippet, index) => <li key={`${snippet}-${index}`}>{snippet}</li>)}
              </ul>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ResultList({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "amber" }) {
  const classes = tone === "emerald" ? "border-emerald-100 bg-emerald-50 text-emerald-950" : "border-amber-100 bg-amber-50 text-amber-950";
  return (
    <section className={`rounded-2xl border p-6 shadow-sm ${classes}`}>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {items.length > 0 ? <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-4 text-sm">No specific items identified.</p>}
    </section>
  );
}

function TagCard({ title, tags }: { title: string; tags: string[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
      {tags.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">{tag}</span>)}</div> : <p className="mt-4 text-sm text-slate-600">No specific items identified.</p>}
    </section>
  );
}
