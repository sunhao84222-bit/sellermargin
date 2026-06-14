"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const currencyCodes = ["USD", "EUR", "GBP", "CAD", "AUD", "CNY"] as const;
export type CurrencyCode = (typeof currencyCodes)[number];

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function deserializeCurrency(rawValue: string): CurrencyCode {
  let candidate = rawValue;

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (typeof parsed === "string") {
      candidate = parsed;
    }
  } catch {
    // Legacy string values were stored without JSON encoding.
  }

  return currencyCodes.includes(candidate as CurrencyCode) ? (candidate as CurrencyCode) : "USD";
}

export default function CurrencyProvider({ children }: { children: ReactNode }) {
  const { value: currency, setValue } = useLocalStorage<CurrencyCode>("sellerMargin.currency", "USD", {
    deserialize: deserializeCurrency,
  });

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: setValue }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used inside CurrencyProvider");
  }

  return context;
}
