import { notFound } from "next/navigation";
import { getMessages, isLocale, type Locale, type Messages } from "@/lib/locales";
import { createPageMetadata } from "@/lib/seo";

export type LocaleParams = Promise<{ locale: string }>;
export type PageKey = keyof Messages["pages"];

export async function getLocaleContext(params: LocaleParams) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return {
    locale: locale as Locale,
    messages,
  };
}

export async function createMetadataForPage(params: LocaleParams, pageKey: PageKey, path: string) {
  const { locale, messages } = await getLocaleContext(params);
  const page = messages.pages[pageKey];

  return createPageMetadata({
    locale,
    messages,
    title: page.title,
    description: page.description,
    path,
  });
}
