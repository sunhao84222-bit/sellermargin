import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import LandedCostCalculator from "@/components/LandedCostCalculator";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(params, "landed-cost-calculator", "/landed-cost-calculator");
}

export default async function LandedCostCalculatorPage({ params }: PageProps) {
  const { locale, messages } = await getLocaleContext(params);
  const page = messages.pages["landed-cost-calculator"];

  return (
    <>
      <CalculatorStructuredData
        locale={locale}
        path="/landed-cost-calculator"
        title={page.title}
        description={page.description}
        faq={messages.landedCost.faq}
      />
      <LandedCostCalculator locale={locale} messages={messages} />
    </>
  );
}
