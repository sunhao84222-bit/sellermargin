import type { Metadata } from "next";
import GuidesIndex from "@/components/GuidesIndex";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(params, "guides", "/guides");
}

export default async function GuidesPage({ params }: PageProps) {
  const { locale, messages } = await getLocaleContext(params);

  return <GuidesIndex locale={locale} messages={messages} />;
}
