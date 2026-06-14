import type { Metadata } from "next";
import ContactContent from "@/components/ContactContent";
import { createMetadataForPage, getLocaleContext, type LocaleParams } from "@/lib/page-helpers";
import { getContactEmail } from "@/lib/site";

type PageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createMetadataForPage(params, "contact", "/contact");
}

export default async function ContactPage({ params }: PageProps) {
  const { messages } = await getLocaleContext(params);

  return <ContactContent messages={messages} contactEmail={getContactEmail()} />;
}
