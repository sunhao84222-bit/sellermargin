import type { Locale } from "@/lib/locales";
import { getLocalizedUrl } from "@/lib/site";

export type FaqItem = {
  question: string;
  answer: string;
};

type StructuredDataScriptProps = {
  data: unknown;
};

type CalculatorStructuredDataProps = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  faq: FaqItem[];
};

function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function createFaqPageStructuredData(
  locale: Locale,
  path: string,
  faq: FaqItem[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: getLocalizedUrl(locale, path),
    inLanguage: locale,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function StructuredDataScript({ data }: StructuredDataScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
    />
  );
}

export default function CalculatorStructuredData({
  locale,
  path,
  title,
  description,
  faq,
}: CalculatorStructuredDataProps) {
  const url = getLocalizedUrl(locale, path);
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      description,
      url,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      inLanguage: locale,
    },
    createFaqPageStructuredData(locale, path, faq),
  ];

  return <StructuredDataScript data={data} />;
}
