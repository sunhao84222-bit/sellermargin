import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import PaymentFeeCalculator from "@/components/PaymentFeeCalculator";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(params, "stripe-vs-paypal-fee-calculator", "/stripe-vs-paypal-fee-calculator");
}

export default async function StripeVsPaypalFeeCalculatorPage({ params }: PageProps) {
  const { locale, messages } = await getLocaleContext(params);
  const page = messages.pages["stripe-vs-paypal-fee-calculator"];

  return (
    <>
      <CalculatorStructuredData
        locale={locale}
        path="/stripe-vs-paypal-fee-calculator"
        title={page.title}
        description={page.description}
        faq={messages.paymentFees.faq}
      />
      <PaymentFeeCalculator locale={locale} messages={messages} />
    </>
  );
}
