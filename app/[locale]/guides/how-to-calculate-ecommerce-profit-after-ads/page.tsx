import type { Metadata } from "next";
import {
  createFaqPageStructuredData,
  StructuredDataScript,
} from "@/components/CalculatorStructuredData";
import ProfitAfterAdsGuide from "@/components/ProfitAfterAdsGuide";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

const guidePath = "/guides/how-to-calculate-ecommerce-profit-after-ads";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(
    params,
    "how-to-calculate-ecommerce-profit-after-ads",
    guidePath,
  );
}

export default async function ProfitAfterAdsGuidePage({ params }: PageProps) {
  const { locale, messages } = await getLocaleContext(params);
  const faq = messages.infoPages.profitAfterAdsGuide.sections.faq.items;

  return (
    <>
      <StructuredDataScript data={createFaqPageStructuredData(locale, guidePath, faq)} />
      <ProfitAfterAdsGuide locale={locale} messages={messages} />
    </>
  );
}
