import Link from "next/link";
import type { Locale, Messages } from "@/lib/locales";

type ToolCardProps = {
  tool: Messages["home"]["tools"][number];
  locale: Locale;
  openLabel: string;
  index: number;
};

const accentClasses = [
  "bg-brand-50 text-brand-700 border-brand-100",
  "bg-mint-50 text-mint-700 border-mint-100",
  "bg-sky-50 text-sky-700 border-sky-100",
  "bg-indigo-50 text-indigo-700 border-indigo-100",
];

export default function ToolCard({ tool, locale, openLabel, index }: ToolCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-md border text-sm font-black ${accentClasses[index % accentClasses.length]}`}
          aria-hidden="true"
        >
          {tool.label}
        </div>
        <span className="mt-1 h-2 w-2 rounded-full bg-mint-500" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-bold leading-7 text-ink-950">{tool.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-ink-500">{tool.description}</p>
      <Link
        href={`/${locale}${tool.href}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition group-hover:gap-3"
      >
        {openLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
