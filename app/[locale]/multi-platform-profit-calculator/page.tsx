import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import MultiPlatformProfitCalculator from "@/components/MultiPlatformProfitCalculator";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(params, "multi-platform-profit-calculator", "/multi-platform-profit-calculator");
}

export default async function MultiPlatformProfitCalculatorPage({ params }: PageProps) {
  const { locale, messages } = await getLocaleContext(params);
  const page = messages.pages["multi-platform-profit-calculator"];

  return (
    <>
      <CalculatorStructuredData
        locale={locale}
        path="/multi-platform-profit-calculator"
        title={page.title}
        description={page.description}
        faq={messages.multiPlatform.faq}
      />
      <MultiPlatformProfitCalculator locale={locale} messages={messages} />
    </>
  );
}
