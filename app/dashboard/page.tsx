import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Your workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-3 text-slate-600">You are signed in as {user.email}.</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-3 focus:ring-slate-200"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-xl bg-indigo-50 p-5">
          <h2 className="font-semibold text-indigo-950">You&apos;re all set.</h2>
          <p className="mt-1 text-sm leading-6 text-indigo-800">
            This page is protected on the server and is only available to authenticated users.
          </p>
        </div>
      </section>
    </main>
  );
}
