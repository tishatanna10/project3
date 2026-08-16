import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { profileFromJson } from "@/lib/careers/matching";
import { roadmaps } from "@/lib/roadmaps/roadmaps";
import { careers } from "@/lib/supabase/careers/career";
import { createClient } from "@/lib/supabase/server";

const roadmapLevels = ["beginner", "intermediate", "advanced"] as const;

const levelStyles = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-violet-50 text-violet-700",
};

function formatTag(tag: string) {
  return tag.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function CareerDetailPage({ params }: PageProps<"/careers/[id]">) {
  const { id } = await params;
  const career = careers.find((item) => item.id === id);

  if (!career) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("assessment_completed, skill_profile")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to load your assessment profile: ${profileError.message}`);
  }

  if (profile?.assessment_completed !== true) redirect("/assessment");

  const studentSkills = profileFromJson(profile.skill_profile);
  const skillComparisons = Object.entries(career.idealSkillProfile)
    .map(([tag, targetScore]) => ({
      tag,
      targetScore,
      studentScore: studentSkills[tag] ?? 0,
    }))
    .sort((first, second) => (second.studentScore - second.targetScore) - (first.studentScore - first.targetScore));
  const skillsYouHave = skillComparisons.filter((skill) => skill.studentScore >= skill.targetScore);
  const skillsToDevelop = skillComparisons
    .filter((skill) => skill.studentScore < skill.targetScore)
    .sort((first, second) => (second.targetScore - second.studentScore) - (first.targetScore - first.studentScore));
  const roadmap = roadmaps.find((item) => item.careerId === career.id);

  return (
    <main className="flex flex-1 bg-slate-50 px-4 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <Link href="/dashboard" className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500">
          ← Back to recommendations
        </Link>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-indigo-600">Career guide</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{career.name}</h1>
              <p className="mt-4 leading-7 text-slate-600">{career.shortDescription}</p>
            </div>
            <span className="w-fit shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold capitalize text-emerald-700">
              {career.currentDemand} demand
            </span>
          </div>

          <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Entry salary</p>
              <p className="mt-1 font-semibold text-slate-900">{career.salaryRangeINR.entry}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top titles</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{career.jobTitles.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Industries</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{career.industries.join(", ")}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Education paths</h2>
          <div className="mt-5 space-y-4">
            {career.educationPaths.map((path) => (
              <div key={path.degree} className="rounded-xl bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900">{path.degree}</h3>
                <p className="mt-1 text-sm text-slate-600">Typical duration: {path.typicalDuration}</p>
                {path.entranceExams && path.entranceExams.length > 0 && (
                  <p className="mt-2 text-sm text-slate-600">Entrance exams: {path.entranceExams.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Your assessment compared</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Skills to bring and build</h2>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="font-semibold text-emerald-950">Skills you have</h3>
              {skillsYouHave.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {skillsYouHave.map((skill) => (
                    <li key={skill.tag} className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-emerald-900">{formatTag(skill.tag)}</span>
                      <span className="text-emerald-700">You: {skill.studentScore} · Target: {skill.targetScore}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-sm leading-6 text-emerald-800">Keep building the core skills below; your assessment is a starting point, not a limit.</p>}
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <h3 className="font-semibold text-amber-950">Skills to develop</h3>
              {skillsToDevelop.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {skillsToDevelop.map((skill) => (
                    <li key={skill.tag} className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-amber-900">{formatTag(skill.tag)}</span>
                      <span className="text-amber-800">You: {skill.studentScore} · Target: {skill.targetScore}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-sm leading-6 text-amber-800">You meet every listed target in this assessment. Keep practising to maintain them.</p>}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-indigo-600">Next steps</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Learning roadmap</h2>

          {career.roadmapShUrl ? (
            <div className="mt-5 rounded-xl bg-indigo-50 p-5">
              <p className="text-sm leading-6 text-indigo-900">Explore this role&apos;s interactive roadmap and choose the topics you want to learn next.</p>
              <a href={career.roadmapShUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                View Learning Roadmap on Roadmap.sh
              </a>
            </div>
          ) : roadmap ? (
            <div className="mt-6 space-y-8">
              {roadmapLevels.map((level) => {
                const steps = roadmap.nodes.filter((node) => node.level === level);
                if (steps.length === 0) return null;

                return (
                  <div key={level}>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${levelStyles[level]}`}>{level}</span>
                    <ol className="mt-4 space-y-3">
                      {steps.map((step) => (
                        <li key={step.id} className="rounded-xl border border-slate-200 p-4">
                          <h3 className="font-semibold text-slate-900">{step.title}{step.optional ? " (optional)" : ""}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">A detailed learning roadmap is coming soon.</p>
          )}
        </section>
      </div>
    </main>
  );
}
