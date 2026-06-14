"use client";

import Link from "next/link";
import { useState } from "react";
import CurrencySelector from "@/components/CurrencySelector";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale, Messages } from "@/lib/locales";
import { joinClassNames } from "@/lib/formatters";

type HeaderProps = {
  locale: Locale;
  messages: Messages;
};

export default function Header({ locale, messages }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { label: messages.nav.tools, href: `/${locale}#tools` },
    { label: messages.nav.guides, href: `/${locale}/guides` },
    { label: messages.nav.about, href: `/${locale}/about` },
    { label: messages.nav.contact, href: `/${locale}/contact` },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-3" aria-label={messages.brand.name}>
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ink-950 text-sm font-bold text-white">
            SM
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold leading-tight text-ink-950">{messages.brand.name}</span>
            <span className="hidden text-xs font-medium text-ink-500 sm:block">{messages.brand.tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={messages.nav.primaryNavigation}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-ink-600 hover:text-brand-700">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <CurrencySelector messages={messages} />
          <LanguageSwitcher locale={locale} messages={messages} />
          <Link
            href={`/${locale}#waitlist`}
            className="rounded-md bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
          >
            {messages.nav.joinWaitlist}
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-ink-800 shadow-sm lg:hidden"
          aria-label={isOpen ? messages.nav.closeMenu : messages.nav.openMenu}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          <span className="flex h-4 w-5 flex-col justify-between" aria-hidden="true">
            <span className={joinClassNames("h-0.5 rounded bg-current transition", isOpen && "translate-y-[7px] rotate-45")} />
            <span className={joinClassNames("h-0.5 rounded bg-current transition", isOpen && "opacity-0")} />
            <span className={joinClassNames("h-0.5 rounded bg-current transition", isOpen && "-translate-y-[7px] -rotate-45")} />
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 shadow-soft lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label={messages.nav.mobileNavigation}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-base font-semibold text-ink-700 hover:bg-slate-50"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-3 px-3 sm:flex-row sm:items-center">
              <CurrencySelector messages={messages} />
              <LanguageSwitcher locale={locale} messages={messages} />
              <Link
                href={`/${locale}#waitlist`}
                className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-bold text-white"
                onClick={() => setIsOpen(false)}
              >
                {messages.nav.joinWaitlist}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
