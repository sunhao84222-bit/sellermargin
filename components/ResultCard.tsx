type ResultCardProps = {
  label: string;
  value: string;
};

export default function ResultCard({ label, value }: ResultCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-ink-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink-950">{value}</p>
    </div>
  );
}
