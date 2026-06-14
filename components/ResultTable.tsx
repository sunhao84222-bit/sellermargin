type ResultTableProps = {
  children?: React.ReactNode;
};

export default function ResultTable({ children }: ResultTableProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-ink-500">
      {children}
    </div>
  );
}
