"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const content = {
  en: {
    title: "Something went wrong",
    body: "The page could not be displayed. You can try again or return to the homepage.",
    retry: "Try again",
    home: "Return home",
  },
  zh: {
    title: "页面出现问题",
    body: "当前页面暂时无法显示。你可以重试，或返回首页。",
    retry: "重试",
    home: "返回首页",
  },
  es: {
    title: "Algo ha salido mal",
    body: "La página no se ha podido mostrar. Puedes intentarlo de nuevo o volver al inicio.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
} as const;

export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const safeLocale = locale === "zh" || locale === "es" ? locale : "en";
  const copy = content[safeLocale];

  return (
    <section className="bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase text-rose-700">Error</p>
        <h1 className="mt-3 text-3xl font-black text-ink-950">{copy.title}</h1>
        <p className="mt-4 text-sm leading-6 text-ink-500">{copy.body}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
          >
            {copy.retry}
          </button>
          <Link
            href={`/${safeLocale}`}
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 px-5 text-sm font-bold text-ink-700 hover:bg-white"
          >
            {copy.home}
          </Link>
        </div>
      </div>
    </section>
  );
}
