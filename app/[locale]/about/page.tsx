import type { Metadata } from "next";
import InformationPage from "@/components/InformationPage";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(params, "about", "/about");
}

export default async function AboutPage({ params }: PageProps) {
  const { messages } = await getLocaleContext(params);
  const page = messages.infoPages.about;

  return <InformationPage {...page} />;
}
