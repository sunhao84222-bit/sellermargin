"use client";

import Link from "next/link";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-16">
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase text-rose-700">Error</p>
        <h1 className="mt-3 text-3xl font-black text-ink-950">Something went wrong</h1>
        <p className="mt-4 text-sm leading-6 text-ink-500">
          The page could not be displayed. Try again or return to the homepage.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
          >
            Try again
          </button>
          <Link
            href="/en"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 px-5 text-sm font-bold text-ink-700 hover:bg-white"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
