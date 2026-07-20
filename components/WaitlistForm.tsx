"use client";

import { useState } from "react";
import type { Messages } from "@/lib/locales";

type WaitlistFormProps = {
  messages: Messages;
  contactEmail: string;
};

export default function WaitlistForm({ messages, contactEmail }: WaitlistFormProps) {
  const [sellerType, setSellerType] = useState(messages.home.waitlist.sellerTypes[0]);
  const [platforms, setPlatforms] = useState("");
  const [features, setFeatures] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(messages.home.waitlist.mailtoSubject);
    const body = encodeURIComponent(
      [
        messages.home.waitlist.mailtoIntro,
        "",
        `${messages.home.waitlist.sellerType}: ${sellerType}`,
        `${messages.home.waitlist.platformsPrompt} ${platforms.trim()}`,
        `${messages.home.waitlist.featuresPrompt} ${features.trim()}`,
      ].join("\n"),
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-ink-500">
        {messages.home.waitlist.recipientLabel}:{" "}
        <span className="break-all font-semibold text-ink-700">{contactEmail}</span>
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

        <label className="block">
          <span className="text-sm font-semibold text-ink-700">{messages.home.waitlist.platformsPrompt}</span>
          <input
            type="text"
            value={platforms}
            onChange={(event) => setPlatforms(event.target.value)}
            placeholder={messages.home.waitlist.platformsPlaceholder}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink-700">{messages.home.waitlist.featuresPrompt}</span>
          <textarea
            rows={3}
            value={features}
            onChange={(event) => setFeatures(event.target.value)}
            placeholder={messages.home.waitlist.featuresPlaceholder}
            className="mt-2 w-full resize-y rounded-md border border-slate-200 px-3 py-2.5 text-sm leading-6 text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
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
