type FAQItem = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  title: string;
  items: FAQItem[];
};

export default function FAQSection({ title, items }: FAQSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-ink-950">{title}</h2>
      {items.map((item) => (
        <details key={item.question} className="rounded-lg border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer font-semibold text-ink-800">{item.question}</summary>
          <p className="mt-3 text-sm leading-6 text-ink-500">{item.answer}</p>
        </details>
      ))}
    </section>
  );
}
