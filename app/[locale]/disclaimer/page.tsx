import type { Metadata } from "next";
import InformationPage from "@/components/InformationPage";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(params, "disclaimer", "/disclaimer");
}

export default async function DisclaimerPage({ params }: PageProps) {
  const { messages } = await getLocaleContext(params);
  const page = messages.infoPages.disclaimer;

  return <InformationPage {...page} />;
}
