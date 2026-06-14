import Link from "next/link";
import type { Locale, Messages } from "@/lib/locales";
import { contactEmailPlaceholder, getContactEmail } from "@/lib/site";

type FooterProps = {
  locale: Locale;
  messages: Messages;
};

export default function Footer({ locale, messages }: FooterProps) {
  const tools = messages.home.tools;
  const contactEmail = getContactEmail();
  const companyLinks = [
    { label: messages.footer.guides, href: `/${locale}/guides` },
    { label: messages.footer.about, href: `/${locale}/about` },
    { label: messages.footer.contact, href: `/${locale}/contact` },
  ];
  const legalLinks = [
    { label: messages.footer.privacy, href: `/${locale}/privacy-policy` },
    { label: messages.footer.terms, href: `/${locale}/terms` },
    { label: messages.footer.disclaimer, href: `/${locale}/disclaimer` },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-ink-950 text-sm font-bold text-white">
              SM
            </span>
            <div>
              <p className="font-bold text-ink-950">{messages.brand.name}</p>
              <p className="text-sm text-ink-500">{messages.brand.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-ink-500">{messages.footer.shortDisclaimer}</p>
          <p className="mt-5 text-xs text-slate-400">
            © {new Date().getFullYear()} {messages.brand.name}. {messages.footer.copyright}
          </p>
        </div>

        <FooterColumn title={messages.footer.tools}>
          {tools.map((tool) => (
            <FooterLink key={tool.href} href={`/${locale}${tool.href}`}>
              {tool.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title={messages.footer.company}>
          {companyLinks.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
          {contactEmail === contactEmailPlaceholder ? (
            <p className="break-all text-sm font-medium text-ink-500">{contactEmail}</p>
          ) : (
            <a
              href={`mailto:${contactEmail}`}
              className="break-all text-sm font-medium text-ink-500 transition hover:text-brand-700"
            >
              {contactEmail}
            </a>
          )}
        </FooterColumn>

        <FooterColumn title={messages.footer.legal}>
          {legalLinks.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase text-ink-950">{title}</h2>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-ink-500 transition hover:text-brand-700">
      {children}
    </Link>
  );
}
