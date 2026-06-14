import type { Locale, Messages } from "@/lib/locales";
import ToolCard from "@/components/ToolCard";

type RelatedToolsProps = {
  locale: Locale;
  messages: Messages;
  excludeHref?: string;
};

export default function RelatedTools({ locale, messages, excludeHref }: RelatedToolsProps) {
  const tools = messages.home.tools.filter((tool) => tool.href !== excludeHref).slice(0, 2);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tools.map((tool, index) => (
        <ToolCard key={tool.href} tool={tool} locale={locale} openLabel={messages.home.toolOpen} index={index} />
      ))}
    </div>
  );
}
