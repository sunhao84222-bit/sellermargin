import en from "@/messages/en.json";
import es from "@/messages/es.json";
import zh from "@/messages/zh.json";

export const locales = ["en", "zh", "es"] as const;
export type Locale = (typeof locales)[number];

export type Messages = typeof en;

function mergeWithFallback<T>(fallback: T, localized: unknown): T {
  if (Array.isArray(fallback)) {
    return (Array.isArray(localized) ? localized : fallback) as T;
  }

  if (fallback && typeof fallback === "object") {
    const localizedObject =
      localized && typeof localized === "object" && !Array.isArray(localized)
        ? (localized as Record<string, unknown>)
        : {};

    return Object.fromEntries(
      Object.entries(fallback as Record<string, unknown>).map(([key, fallbackValue]) => [
        key,
        mergeWithFallback(fallbackValue, localizedObject[key]),
      ]),
    ) as T;
  }

  return (localized ?? fallback) as T;
}

const dictionaries: Record<Locale, Messages> = {
  en,
  zh: mergeWithFallback(en, zh),
  es: mergeWithFallback(en, es),
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export async function getMessages(locale: Locale): Promise<Messages> {
  return dictionaries[locale] ?? dictionaries.en;
}

export function localizePath(pathname: string, locale: Locale) {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const parts = cleanPath.split("/").filter(Boolean);

  if (parts.length > 0 && isLocale(parts[0])) {
    parts[0] = locale;
    return `/${parts.join("/")}`;
  }

  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}
