"use client";

import { useState } from "react";
import type { Messages } from "@/lib/locales";

type ContactContentProps = {
  messages: Messages;
  contactEmail: string;
};

export default function ContactContent({ messages, contactEmail }: ContactContentProps) {
  const copy = messages.infoPages.contact;
  const [submitted, setSubmitted] = useState(false);

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
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
          <aside className="space-y-6">
            <div className="border-y border-slate-200 bg-white px-5 py-6">
              <p className="text-sm font-bold text-ink-950">{copy.emailLabel}</p>
              <p className="mt-3 break-all font-mono text-sm font-bold text-brand-700">
                {contactEmail}
              </p>
              <p className="mt-4 text-sm leading-6 text-ink-500">{copy.emailNotice}</p>
            </div>
            <div className="border-l-2 border-amber-400 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
              {copy.formNotice}
            </div>
          </aside>

          <form
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <h2 className="text-2xl font-bold text-ink-950">{copy.formTitle}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <TextField
                id="contact-name"
                label={copy.fields.name}
                placeholder={copy.fields.namePlaceholder}
                onChange={() => setSubmitted(false)}
              />
              <TextField
                id="contact-email"
                label={copy.fields.email}
                placeholder={copy.fields.emailPlaceholder}
                type="email"
                onChange={() => setSubmitted(false)}
              />
              <label className="block sm:col-span-2" htmlFor="contact-message">
                <span className="text-sm font-semibold text-ink-700">{copy.fields.message}</span>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  placeholder={copy.fields.messagePlaceholder}
                  onChange={() => setSubmitted(false)}
                  className="mt-2 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </label>
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
            >
              {copy.submit}
            </button>
            {submitted ? (
              <p role="status" className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950">
                {copy.success}
              </p>
            ) : null}
            <p className="mt-5 text-xs font-medium leading-5 text-ink-500">{copy.demoNotice}</p>
          </form>
        </div>
      </section>
    </>
  );
}

function TextField({
  id,
  label,
  placeholder,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "email";
  onChange: () => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <input
        id={id}
        type={type}
        required
        placeholder={placeholder}
        onChange={onChange}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}
