"use client";

import { currencyCodes, useCurrency, type CurrencyCode } from "@/components/CurrencyProvider";
import type { Messages } from "@/lib/locales";
import { joinClassNames } from "@/lib/formatters";

type CurrencySelectorProps = {
  messages: Messages;
  showNotice?: boolean;
  className?: string;
};

export default function CurrencySelector({
  messages,
  showNotice = false,
  className,
}: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className={joinClassNames("min-w-0", className)}>
      <label className="block">
        <span className={showNotice ? "text-sm font-bold text-ink-700" : "sr-only"}>
          {messages.currency.label}
        </span>
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
          className={joinClassNames(
            "h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
            showNotice && "mt-2 h-11 w-full",
          )}
          aria-label={messages.currency.label}
        >
          {currencyCodes.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      {showNotice ? (
        <p className="mt-3 text-xs font-medium leading-5 text-ink-500">{messages.currency.notice}</p>
      ) : null}
    </div>
  );
}
