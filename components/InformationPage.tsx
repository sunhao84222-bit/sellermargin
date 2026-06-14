type InformationSection = {
  title: string;
  paragraphs: string[];
  bullets: string[];
};

type InformationPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: InformationSection[];
};

export default function InformationPage({
  eyebrow,
  title,
  intro,
  lastUpdated,
  sections,
}: InformationPageProps) {
  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-brand-700">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black text-ink-950 sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-ink-500">{intro}</p>
          <p className="mt-4 text-xs font-semibold text-ink-500">{lastUpdated}</p>
        </div>
      </section>

      <section className="bg-slate-50">
        <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white px-5 sm:px-8">
            {sections.map((section) => (
              <section key={section.title} className="py-8">
                <h2 className="text-xl font-bold text-ink-950 sm:text-2xl">{section.title}</h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="max-w-3xl text-sm leading-7 text-ink-600 sm:text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets.length > 0 ? (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="border-l-2 border-brand-500 pl-4 text-sm leading-6 text-ink-600">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
