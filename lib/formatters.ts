import type { Locale } from "@/lib/locales";

const localeTags: Record<Locale, string> = {
  en: "en-US",
  zh: "zh-CN",
  es: "es-ES",
};

export function joinClassNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number, currency: string, locale: Locale = "en") {
  return new Intl.NumberFormat(localeTags[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number, locale: Locale = "en") {
  return `${new Intl.NumberFormat(localeTags[locale], {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0)}%`;
}

export function formatRatio(value: number | null, locale: Locale = "en") {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  return `${new Intl.NumberFormat(localeTags[locale], {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)}x`;
}
