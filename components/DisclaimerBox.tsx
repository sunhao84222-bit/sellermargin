type DisclaimerBoxProps = {
  title: string;
  body: string;
  compact?: boolean;
};

export default function DisclaimerBox({ title, body, compact = false }: DisclaimerBoxProps) {
  return (
    <aside
      className={
        compact
          ? "rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 sm:flex sm:items-baseline sm:gap-3"
          : "rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950"
      }
    >
      <h2 className={compact ? "shrink-0 text-sm font-bold" : "text-base font-bold"}>{title}</h2>
      <p className={compact ? "mt-1 text-xs leading-5 sm:mt-0" : "mt-2 text-sm leading-6"}>{body}</p>
    </aside>
  );
}
