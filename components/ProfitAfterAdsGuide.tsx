import Link from "next/link";
import type { Locale, Messages } from "@/lib/locales";

type ProfitAfterAdsGuideProps = {
  locale: Locale;
  messages: Messages;
};

export default function ProfitAfterAdsGuide({ locale, messages }: ProfitAfterAdsGuideProps) {
  const copy = messages.infoPages.profitAfterAdsGuide;
  const sections = copy.sections;

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-brand-700">{copy.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black text-ink-950 sm:text-4xl lg:text-5xl">{copy.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-ink-500">{copy.intro}</p>
          <p className="mt-4 text-xs font-semibold text-ink-500">{copy.lastUpdated}</p>
        </div>
      </section>

      <article className="bg-slate-50 py-12">
        <div className="mx-auto max-w-5xl space-y-12 px-4 sm:px-6 lg:px-8">
          <ArticleSection title={sections.introduction.title} paragraphs={sections.introduction.paragraphs} />
          <ArticleSection title={sections.grossProfit.title} paragraphs={sections.grossProfit.paragraphs} />

          <section>
            <h2 className="text-2xl font-bold text-ink-950">{sections.keyCosts.title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink-600">{sections.keyCosts.intro}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {sections.keyCosts.items.map((item) => (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
                  <h3 className="text-base font-bold text-ink-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-950">{sections.formula.title}</h2>
            <div className="mt-5 space-y-3 border-l-2 border-brand-500 bg-white px-5 py-5">
              {sections.formula.lines.map((line) => (
                <p key={line} className="text-sm font-semibold leading-6 text-ink-700">
                  {line}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-950">{sections.example.title}</h2>
            {sections.example.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 max-w-3xl text-base leading-7 text-ink-600">
                {paragraph}
              </p>
            ))}
            <ol className="mt-6 space-y-3">
              {sections.example.steps.map((step, index) => (
                <li key={step} className="flex gap-4 text-sm leading-6 text-ink-600">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-950 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-950">{sections.calculators.title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink-600">{sections.calculators.intro}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {sections.calculators.links.map((link) => (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
                >
                  <h3 className="text-base font-bold text-brand-700">{link.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{link.body}</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-950">{sections.mistakes.title}</h2>
            <ul className="mt-5 space-y-3">
              {sections.mistakes.items.map((item) => (
                <li key={item} className="border-l-2 border-rose-300 pl-4 text-sm leading-6 text-ink-600">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-950">{sections.faq.title}</h2>
            <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200 bg-white">
              {sections.faq.items.map((item) => (
                <details key={item.question} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none pr-8 text-base font-bold text-ink-950">
                    {item.question}
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="border-y border-slate-200 bg-white px-5 py-7 sm:px-7">
            <h2 className="text-2xl font-bold text-ink-950">{sections.cta.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-600">{sections.cta.body}</p>
            <Link
              href={`/${locale}${sections.cta.href}`}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
            >
              {sections.cta.label}
            </Link>
          </section>

          <section className="border-y border-amber-200 bg-amber-50 px-5 py-6">
            <h2 className="text-2xl font-bold text-amber-950">{sections.disclaimer.title}</h2>
            <div className="mt-4 space-y-3">
              {sections.disclaimer.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-amber-950">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        </div>
      </article>
    </>
  );
}

function ArticleSection({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-ink-950">{title}</h2>
      <div className="mt-4 space-y-4">
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="max-w-3xl text-base leading-7 text-ink-600">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
