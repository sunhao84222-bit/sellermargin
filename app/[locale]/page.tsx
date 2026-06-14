import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import DisclaimerBox from "@/components/DisclaimerBox";
import ProFeatureModal from "@/components/ProFeatureModal";
import ToolCard from "@/components/ToolCard";
import WaitlistForm from "@/components/WaitlistForm";
import { createPageMetadata } from "@/lib/seo";
import { getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

type HomePageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale, messages } = await getLocaleContext(params);

  return createPageMetadata({
    locale,
    messages,
    title: messages.meta.title,
    description: messages.meta.description,
    path: "/",
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale, messages } = await getLocaleContext(params);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <Image
          src="/hero-dashboard.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,24,40,0.92)_0%,rgba(16,24,40,0.74)_38%,rgba(16,24,40,0.18)_78%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-cyan-200">{messages.home.hero.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              {messages.home.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">{messages.home.hero.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}#tools`}
                className="inline-flex h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-bold text-ink-950 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                {messages.home.hero.primaryCta}
              </Link>
              <Link
                href={`/${locale}#waitlist`}
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/45 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                {messages.home.hero.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="tools" className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-ink-950">{messages.home.toolsSection.title}</h2>
            <p className="mt-3 text-base leading-7 text-ink-500">{messages.home.toolsSection.subtitle}</p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {messages.home.tools.map((tool, index) => (
              <ToolCard key={tool.href} tool={tool} locale={locale} openLabel={messages.home.toolOpen} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-ink-950">{messages.home.why.title}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {messages.home.why.items.map((item) => (
              <div key={item.title} className="border-l-2 border-brand-500 pl-4">
                <h3 className="text-base font-bold text-ink-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 py-14 text-white sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-cyan-200">{messages.home.pro.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold">{messages.home.pro.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">{messages.home.pro.subtitle}</p>
            <div className="mt-7">
              <ProFeatureModal messages={messages} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {messages.home.pro.features.map((feature) => (
              <div key={feature} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-bold text-ink-950">{messages.home.waitlist.title}</h2>
            <p className="mt-4 text-base leading-7 text-ink-500">{messages.home.waitlist.subtitle}</p>
          </div>
          <WaitlistForm messages={messages} />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DisclaimerBox title={messages.home.disclaimer.title} body={messages.home.disclaimer.body} />
        </div>
      </section>
    </>
  );
}
