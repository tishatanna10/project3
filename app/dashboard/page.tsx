import { redirect } from "next/navigation";
import Link from "next/link";
import { getCareerRecommendations, profileFromJson } from "@/lib/careers/matching";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("assessment_completed, skill_profile, interest_profile")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to check assessment status: ${profileError.message}`);
  }

  if (profile?.assessment_completed !== true) {
    redirect("/assessment");
  }

  const recommendations = getCareerRecommendations(
    profileFromJson(profile.skill_profile),
    profileFromJson(profile.interest_profile),
  );

  return (
    <main className="flex flex-1 bg-slate-50 px-4 py-10 sm:py-12">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Your workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-3 text-slate-600">You are signed in as {user.email}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/interview" variant="secondary">Practice interview</Button>
            <Button href="/resume" variant="secondary">Analyze resume</Button>
            <Button href="/chat">Ask the career assistant</Button>
            <form action={signOut}>
              <Button
                type="submit"
                variant="secondary"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600">Your best fits</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Career recommendations</h2>
            </div>
            <p className="text-sm text-slate-500">Based equally on your skills and interests</p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((career, index) => (
              <article key={career.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">#{index + 1} recommendation</p>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">{career.name}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                    {career.matchPercentage}% match
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{career.shortDescription}</p>

                <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-900">Salary range</dt>
                    <dd className="mt-1 text-slate-600">{career.salaryRangeINR.entry} entry · {career.salaryRangeINR.mid} mid · {career.salaryRangeINR.senior} senior</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Top job titles</dt>
                    <dd className="mt-1 text-slate-600">{career.jobTitles.join(", ")}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-semibold text-slate-900">Current demand</dt>
                    <dd className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">{career.currentDemand}</dd>
                  </div>
                </dl>
                <Link href={`/careers/${career.id}`} className="mt-6 inline-flex w-fit text-sm font-semibold text-indigo-600 transition hover:text-indigo-500">
                  View career details →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
