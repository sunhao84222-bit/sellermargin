import type { Metadata } from "next";
import type { Locale, Messages } from "@/lib/locales";
import {
  getAlternateOpenGraphLocales,
  getLanguageAlternates,
  getLocalizedUrl,
  getOpenGraphLocale,
} from "@/lib/site";

type PageSeoInput = {
  locale: Locale;
  messages: Messages;
  title: string;
  description: string;
  path: string;
};

export function createPageMetadata({
  locale,
  messages,
  title,
  description,
  path,
}: PageSeoInput): Metadata {
  const canonicalUrl = getLocalizedUrl(locale, path);
  const openGraphImageUrl = new URL("/og-image.png", canonicalUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title,
      description,
      siteName: messages.brand.name,
      locale: getOpenGraphLocale(locale),
      alternateLocale: getAlternateOpenGraphLocales(locale),
      type: "website",
      url: canonicalUrl,
      images: [
        {
          url: openGraphImageUrl,
          width: 1200,
          height: 630,
          alt: `${messages.brand.name} - ${messages.brand.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [openGraphImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
