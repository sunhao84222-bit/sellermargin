import Link from "next/link";
import type { Locale, Messages } from "@/lib/locales";
import DisclaimerBox from "@/components/DisclaimerBox";

type CalculatorLayoutProps = {
  locale: Locale;
  messages: Messages;
  title: string;
  description: string;
};

export default function CalculatorLayout({ locale, messages, title, description }: CalculatorLayoutProps) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase text-brand-700">
          {messages.placeholder.calculatorBadge}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink-950 sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-ink-500">{description}</p>
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-6 shadow-sm">
          <p className="text-sm leading-6 text-ink-600">{messages.placeholder.calculatorBody}</p>
        </div>
        <div className="mt-8">
          <DisclaimerBox title={messages.home.disclaimer.title} body={messages.home.disclaimer.body} />
        </div>
        <Link href={`/${locale}`} className="mt-8 inline-flex text-sm font-bold text-brand-700 hover:text-brand-600">
          {messages.placeholder.backHome}
        </Link>
      </div>
    </section>
  );
}
