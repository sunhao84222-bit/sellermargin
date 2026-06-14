"use client";

import { useState } from "react";
import type { Messages } from "@/lib/locales";

type WaitlistFormProps = {
  messages: Messages;
  contactEmail: string;
};

export default function WaitlistForm({ messages, contactEmail }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [sellerType, setSellerType] = useState(messages.home.waitlist.sellerTypes[0]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    const subject = encodeURIComponent(messages.home.waitlist.mailtoSubject);
    const body = encodeURIComponent(
      [
        messages.home.waitlist.mailtoIntro,
        "",
        `${messages.home.waitlist.email}: ${email.trim()}`,
        `${messages.home.waitlist.sellerType}: ${sellerType}`,
        "",
        messages.home.waitlist.platformsPrompt,
        "",
        messages.home.waitlist.featuresPrompt,
      ].join("\n"),
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-xl font-bold text-ink-950">{messages.home.waitlist.title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-500">{messages.home.waitlist.subtitle}</p>
        <p className="mt-3 text-xs font-medium text-ink-500">
          {messages.home.waitlist.recipientLabel}:{" "}
          <span className="break-all font-semibold text-ink-700">{contactEmail}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink-700">{messages.home.waitlist.email}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={messages.home.waitlist.emailPlaceholder}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink-700">{messages.home.waitlist.sellerType}</span>
          <select
            value={sellerType}
            onChange={(event) => setSellerType(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          >
            {messages.home.waitlist.sellerTypes.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-ink-950 px-5 text-sm font-bold text-white transition hover:bg-ink-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          {messages.home.waitlist.submit}
        </button>
      </div>
      <p className="mt-4 text-xs font-medium leading-5 text-ink-500">{messages.home.waitlist.demoNotice}</p>
    </form>
  );
}
