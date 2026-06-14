"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { localizePath, locales, type Locale, type Messages } from "@/lib/locales";

type LanguageSwitcherProps = {
  locale: Locale;
  messages: Messages;
};

export default function LanguageSwitcher({ locale, messages }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setValue: saveLocale } = useLocalStorage<Locale>("sellerMargin.locale", locale, {
    legacyKeys: ["sellermargin_locale"],
    deserialize: (rawValue) => {
      const candidate = rawValue.replace(/^"|"$/g, "");
      return locales.includes(candidate as Locale) ? (candidate as Locale) : "en";
    },
  });

  function handleChange(nextLocale: Locale) {
    saveLocale(nextLocale);
    router.push(localizePath(pathname, nextLocale));
  }

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ink-600">
      <span className="sr-only">{messages.language.label}</span>
      <select
        value={locale}
        onChange={(event) => handleChange(event.target.value as Locale)}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        aria-label={messages.language.label}
      >
        {locales.map((item) => (
          <option value={item} key={item}>
            {messages.language[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
