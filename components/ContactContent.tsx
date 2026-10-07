"use client";

import type { Messages } from "@/lib/locales";
import { contactEmailPlaceholder } from "@/lib/site";

type ContactContentProps = {
  messages: Messages;
  contactEmail: string;
};

export default function ContactContent({ messages, contactEmail }: ContactContentProps) {
  const copy = messages.infoPages.contact;
  const hasContactEmail = Boolean(contactEmail.trim()) && contactEmail !== contactEmailPlaceholder;

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-brand-700">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black text-ink-950 sm:text-4xl lg:text-5xl">{copy.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-ink-500">{copy.intro}</p>
          <p className="mt-4 text-xs font-semibold text-ink-500">{copy.lastUpdated}</p>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            {hasContactEmail ? (
              <>
                <h2 className="text-lg font-bold text-ink-950">{copy.emailLabel}</h2>
                <a
                  className="mt-4 block break-all text-base font-semibold text-brand-700 underline"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </a>
                <p className="mt-4 text-sm leading-6 text-ink-500">{copy.emailNotice}</p>
              </>
            ) : (
              <p role="status" className="text-sm leading-6 text-ink-700">
                {copy.unavailableNotice}
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
