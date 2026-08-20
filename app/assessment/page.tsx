"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  assessmentQuestions,
  type AssessmentQuestion,
} from "@/lib/supabase/assesment/questions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type AnswerValue = string | string[];
type Profile = Record<string, number>;

const multiSelectLimits: Record<string, number> = { in_06: 3 };

function getSectionTags(section: AssessmentQuestion["section"]) {
  return Array.from(
    new Set(
      assessmentQuestions
        .filter((question) => question.section === section)
        .flatMap((question) => question.options?.flatMap((option) => Object.keys(option.weights)) ?? []),
    ),
  );
}

function calculateProfile(
  section: AssessmentQuestion["section"],
  answers: Record<string, AnswerValue>,
): Profile {
  const tags = getSectionTags(section);
  const totals = Object.fromEntries(tags.map((tag) => [tag, 0])) as Record<string, number>;
  const maximums = Object.fromEntries(tags.map((tag) => [tag, 0])) as Record<string, number>;

  for (const question of assessmentQuestions.filter((item) => item.section === section)) {
    const options = question.options ?? [];
    const selectedIds = answers[question.id];
    const selected = Array.isArray(selectedIds) ? selectedIds : selectedIds ? [selectedIds] : [];

    for (const option of options.filter((item) => selected.includes(item.id))) {
      for (const [tag, weight] of Object.entries(option.weights)) totals[tag] += weight;
    }

    for (const tag of tags) {
      const weights = options.map((option) => option.weights[tag] ?? 0).sort((a, b) => b - a);
      const limit = question.type === "multi_select" ? multiSelectLimits[question.id] ?? weights.length : 1;
      maximums[tag] += weights.slice(0, limit).reduce((sum, weight) => sum + weight, 0);
    }
  }

  return Object.fromEntries(
    tags.map((tag) => [tag, maximums[tag] ? Math.round((totals[tag] / maximums[tag]) * 100) : 0]),
  );
}

function isAnswered(question: AssessmentQuestion, answer: AnswerValue | undefined) {
  return Array.isArray(answer) ? answer.length > 0 : Boolean(answer?.trim());
}

export default function AssessmentPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const question = assessmentQuestions[currentIndex];
  const progress = ((currentIndex + 1) / assessmentQuestions.length) * 100;
  const selectedAnswer = answers[question.id];
  const canContinue = isAnswered(question, selectedAnswer);
  const selectedOptionIds = Array.isArray(selectedAnswer) ? selectedAnswer : [];
  const multiSelectLimit = multiSelectLimits[question.id] ?? question.options?.length ?? 0;

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("assessment_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(`Unable to check your assessment status: ${profileError.message}`);
        setIsLoading(false);
        return;
      }

      if (profile?.assessment_completed === true) {
        router.replace("/dashboard");
        return;
      }

      setIsLoading(false);
    }

    void checkAccess();
  }, [router]);

  function setSingleAnswer(optionId: string) {
    setAnswers((current) => ({ ...current, [question.id]: optionId }));
    setError("");
  }

  function toggleMultiAnswer(optionId: string) {
    setAnswers((current) => {
      const currentAnswer = current[question.id];
      const selected: string[] = Array.isArray(currentAnswer) ? currentAnswer : [];
      const next = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : selected.length < multiSelectLimit
          ? [...selected, optionId]
          : selected;
      return { ...current, [question.id]: next };
    });
    setError("");
  }

  async function continueAssessment() {
    if (!canContinue) return;
    if (question.type === "multi_select" && selectedOptionIds.length !== multiSelectLimit) {
      setError(`Please choose ${multiSelectLimit} options to continue.`);
      return;
    }

    if (currentIndex < assessmentQuestions.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    setIsSubmitting(true);
    setError("");
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Your session has ended. Please sign in again.");
      setIsSubmitting(false);
      return;
    }

    const skillProfile = calculateProfile("skill", answers);
    const interestProfile = calculateProfile("interest", answers);
    const responseRows = assessmentQuestions.map((item) => ({
      user_id: user.id,
      question_id: item.id,
      answer: {
        section: item.section,
        type: item.type,
        value: answers[item.id],
      },
      created_at: new Date().toISOString(),
    }));

    try {
      const { error: responsesError } = await supabase
        .from("assessment_responses")
        .upsert(responseRows, { onConflict: "user_id,question_id" });

      if (responsesError) {
        throw new Error(`Unable to save your answers: ${responsesError.message}`);
      }

      const { data: savedProfile, error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            assessment_completed: true,
            skill_profile: skillProfile,
            interest_profile: interestProfile,
          },
          { onConflict: "id" },
        )
        .select("assessment_completed")
        .single();

      if (profileError) {
        throw new Error(`Unable to mark the assessment complete: ${profileError.message}`);
      }

      if (savedProfile.assessment_completed !== true) {
        throw new Error("The assessment was saved, but completion could not be confirmed. Please try again.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save your assessment. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <main className="flex flex-1 items-center justify-center bg-slate-50 text-sm text-slate-600">Loading assessment...</main>;
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex items-center justify-between gap-4 text-sm">
          <p className="font-semibold text-indigo-600">Career assessment</p>
          <p className="text-slate-500">{currentIndex + 1} of {assessmentQuestions.length}</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`${Math.round(progress)}% complete`}>
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-9">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {question.section === "skill" ? "How you work" : "What interests you"}
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">{question.prompt}</h1>
          {question.helperText && <p className="mt-3 text-sm text-slate-600">{question.helperText}</p>}

          <div className="mt-7 space-y-3">
            {question.type === "open_text" ? (
              <textarea
                value={typeof selectedAnswer === "string" ? selectedAnswer : ""}
                onChange={(event) => {
                  setAnswers((current) => ({ ...current, [question.id]: event.target.value }));
                  setError("");
                }}
                rows={6}
                placeholder="Write your answer here..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
              />
            ) : (
              question.options?.map((option) => {
                const isMultiSelect = question.type === "multi_select";
                const checked = isMultiSelect ? selectedOptionIds.includes(option.id) : selectedAnswer === option.id;
                return (
                  <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${checked ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}>
                    <input
                      type={isMultiSelect ? "checkbox" : "radio"}
                      name={question.id}
                      checked={checked}
                      onChange={() => isMultiSelect ? toggleMultiAnswer(option.id) : setSingleAnswer(option.id)}
                      className="mt-0.5 h-4 w-4 accent-indigo-600"
                    />
                    <span className="text-sm leading-6 text-slate-800">{option.text}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {error && <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

        <div className="mt-8 flex items-center justify-between gap-4">
          <Button type="button" variant="secondary" onClick={() => setCurrentIndex((index) => index - 1)} disabled={currentIndex === 0 || isSubmitting}>
            Back
          </Button>
          <Button type="button" onClick={() => void continueAssessment()} disabled={!canContinue || isSubmitting}>
            {isSubmitting ? "Saving..." : currentIndex === assessmentQuestions.length - 1 ? "Finish assessment" : "Continue"}
          </Button>
        </div>
      </section>
    </main>
  );
}
