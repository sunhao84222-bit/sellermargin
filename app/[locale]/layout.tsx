import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CurrencyProvider from "@/components/CurrencyProvider";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMessages, isLocale, locales, type Locale } from "@/lib/locales";
import { getSiteUrl } from "@/lib/site";
import "../globals.css";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const messages = await getMessages(locale);

  return {
    metadataBase: new URL(getSiteUrl()),
    applicationName: messages.brand.name,
    title: {
      default: messages.meta.title,
      template: `%s | ${messages.brand.name}`,
    },
    description: messages.meta.description,
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages(locale as Locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <CurrencyProvider>
          <Header locale={locale as Locale} messages={messages} />
          <main>{children}</main>
          <Footer locale={locale as Locale} messages={messages} />
          <CookieConsentBanner />
        </CurrencyProvider>
      </body>
    </html>
  );
}
