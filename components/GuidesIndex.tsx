import Link from "next/link";
import type { Locale, Messages } from "@/lib/locales";

type GuidesIndexProps = {
  locale: Locale;
  messages: Messages;
};

export default function GuidesIndex({ locale, messages }: GuidesIndexProps) {
  const copy = messages.infoPages.guides;

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-brand-700">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black text-ink-950 sm:text-4xl lg:text-5xl">{copy.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-ink-500">{copy.intro}</p>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-brand-700">{copy.featuredLabel}</p>
          <article className="mt-4 max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-ink-950">{copy.articleTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-ink-500 sm:text-base">{copy.articleDescription}</p>
            <Link
              href={`/${locale}/guides/how-to-calculate-ecommerce-profit-after-ads`}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
            >
              {copy.readGuide}
            </Link>
          </article>

          <div className="mt-12 border-t border-slate-200 pt-8">
            <h2 className="text-xl font-bold text-ink-950">{copy.toolsTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-500">{copy.toolsIntro}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {messages.home.tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={`/${locale}${tool.href}`}
                  className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
                >
                  <h3 className="text-base font-bold text-brand-700">{tool.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 border-t border-slate-200 pt-8">
            <h2 className="text-xl font-bold text-ink-950">{copy.futureTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-500">{copy.futureBody}</p>
          </div>
        </div>
      </section>
    </>
  );
}
