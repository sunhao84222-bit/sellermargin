import { locales, type Locale } from "@/lib/locales";

export const defaultLocale: Locale = "en";
export const contactEmailPlaceholder = "[replace-with-real-email@yourdomain.com]";

export const sitePaths = [
  "/",
  "/multi-platform-profit-calculator",
  "/ad-spend-break-even-calculator",
  "/stripe-vs-paypal-fee-calculator",
  "/landed-cost-calculator",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
  "/guides",
  "/guides/how-to-calculate-ecommerce-profit-after-ads",
] as const;

export type SitePath = (typeof sitePaths)[number];

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelProductionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const candidate =
    configuredUrl || (vercelProductionDomain ? `https://${vercelProductionDomain}` : "https://sellermargin.com");

  try {
    return new URL(candidate).origin;
  } catch {
    return "https://sellermargin.com";
  }
}

export function getContactEmail() {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || contactEmailPlaceholder;
}

export function getLocalizedPath(locale: Locale, path: string) {
  return `/${locale}${path === "/" ? "" : path}`;
}

export function getLocalizedUrl(locale: Locale, path: string) {
  return new URL(getLocalizedPath(locale, path), getSiteUrl()).toString();
}

export function getLanguageAlternates(path: string) {
  const languages = Object.fromEntries(locales.map((locale) => [locale, getLocalizedUrl(locale, path)]));

  return {
    ...languages,
    "x-default": new URL("/", getSiteUrl()).toString(),
  };
}

export function getOpenGraphLocale(locale: Locale) {
  const localeMap: Record<Locale, string> = {
    en: "en_US",
    zh: "zh_CN",
    es: "es_ES",
  };

  return localeMap[locale];
}

export function getAlternateOpenGraphLocales(locale: Locale) {
  return locales.filter((item) => item !== locale).map(getOpenGraphLocale);
}
