import type { Metadata } from "next";
import AdBreakEvenCalculator from "@/components/AdBreakEvenCalculator";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(params, "ad-spend-break-even-calculator", "/ad-spend-break-even-calculator");
}

export default async function AdSpendBreakEvenCalculatorPage({ params }: PageProps) {
  const { locale, messages } = await getLocaleContext(params);
  const page = messages.pages["ad-spend-break-even-calculator"];

  return (
    <>
      <CalculatorStructuredData
        locale={locale}
        path="/ad-spend-break-even-calculator"
        title={page.title}
        description={page.description}
        faq={messages.adBreakEven.faq}
      />
      <AdBreakEvenCalculator locale={locale} messages={messages} />
    </>
  );
}
