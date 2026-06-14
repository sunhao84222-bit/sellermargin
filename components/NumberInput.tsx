type NumberInputProps = {
  label: string;
};

export default function NumberInput({ label }: NumberInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <input
        type="number"
        disabled
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-ink-500"
      />
    </label>
  );
}
