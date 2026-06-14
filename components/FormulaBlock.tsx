type FormulaBlockProps = {
  children: React.ReactNode;
};

export default function FormulaBlock({ children }: FormulaBlockProps) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm text-white">
      <code>{children}</code>
    </pre>
  );
}
