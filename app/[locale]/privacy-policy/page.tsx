import type { Metadata } from "next";
import InformationPage from "@/components/InformationPage";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(params, "privacy-policy", "/privacy-policy");
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { messages } = await getLocaleContext(params);
  const page = messages.infoPages.privacyPolicy;

  return <InformationPage {...page} />;
}
