"use client";

import { useMemo, useState } from "react";
import ProFeatureModal from "@/components/ProFeatureModal";
import CurrencySelector from "@/components/CurrencySelector";
import { useCurrency } from "@/components/CurrencyProvider";
import DisclaimerBox from "@/components/DisclaimerBox";
import RelatedTools from "@/components/RelatedTools";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculateAdBreakEven, type AdTargetMode } from "@/lib/calculators";
import { formatCurrency, formatPercent, formatRatio, joinClassNames } from "@/lib/formatters";
import type { Locale, Messages } from "@/lib/locales";
import {
  adBreakEvenPercentFields,
  createDefaultRawAdBreakEvenInput,
  getAdBreakEvenPercentWarning,
  normalizeSavedAdBreakEvenInput,
  validateAdBreakEvenInput,
  type AdBreakEvenNumericField,
  type AdBreakEvenPercentField,
  type RawAdBreakEvenInput,
} from "@/lib/schemas/adBreakEven";

type AdBreakEvenCalculatorProps = {
  locale: Locale;
  messages: Messages;
};

const storageKey = "sellerMargin.adBreakEven.inputs";
const legacyStorageKey = "sellermargin_ad_break_even_calculator_v1";

const defaultInput = createDefaultRawAdBreakEvenInput();

const productInputOrder: AdBreakEvenNumericField[] = [
  "sellingPrice",
  "productCost",
  "shippingCost",
  "packagingCost",
  "platformFeePercent",
  "paymentFeePercent",
  "fixedPaymentFee",
  "otherVariableCost",
];

const percentFields = new Set<AdBreakEvenNumericField>(
  adBreakEvenPercentFields,
);

export default function AdBreakEvenCalculator({ locale, messages }: AdBreakEvenCalculatorProps) {
  const copy = messages.adBreakEven;
  const { currency } = useCurrency();
  const {
    value: input,
    setValue: setInput,
    remove: resetInput,
  } = useLocalStorage<RawAdBreakEvenInput>(storageKey, { ...defaultInput }, {
    legacyKeys: [legacyStorageKey],
    deserialize: (rawValue) => {
      const parsed = JSON.parse(rawValue) as unknown;
      return normalizeSavedAdBreakEvenInput(parsed);
    },
  });
  const [proModal, setProModal] = useState<string | null>(null);
  const [blurredPercentFields, setBlurredPercentFields] = useState<
    Partial<Record<AdBreakEvenPercentField, boolean>>
  >({});

  const validation = useMemo(() => validateAdBreakEvenInput(input), [input]);
  const calculationResponse = useMemo(
    () => (validation.success ? calculateAdBreakEven(validation.data) : null),
    [validation],
  );
  const calculation = calculationResponse?.result ?? null;

  function updateInput(key: AdBreakEvenNumericField, value: string) {
    setInput((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateTargetMode(mode: AdTargetMode) {
    setInput((current) => ({ ...current, targetMode: mode }));
  }

  function resetDemoState() {
    resetInput();
    setBlurredPercentFields({});
  }

  function markPercentFieldBlurred(key: AdBreakEvenPercentField) {
    setBlurredPercentFields((current) => ({ ...current, [key]: true }));
  }

  function getPercentWarning(key: AdBreakEvenPercentField) {
    if (!blurredPercentFields[key]) {
      return undefined;
    }

    const warning = getAdBreakEvenPercentWarning(input[key]);
    return warning ? copy.validation[warning] : undefined;
  }

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-brand-700">{copy.hero.eyebrow}</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-3xl font-black text-ink-950 sm:text-4xl lg:text-5xl">{copy.hero.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-ink-500">{copy.hero.subtitle}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <CurrencySelector messages={messages} showNotice />
            </div>
          </div>
          <div className="mt-8">
            <DisclaimerBox title={copy.notice.title} body={copy.notice.body} />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[380px_1fr] lg:px-8">
          <div className="min-w-0 space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.inputs}</h2>
              <div className="mt-5 grid gap-4">
                {productInputOrder.map((key) => (
                  <NumberField
                    key={key}
                    id={`ad-input-${key}`}
                    label={copy.inputs[key]}
                    value={input[key]}
                    suffix={percentFields.has(key) ? "%" : currency}
                    onChange={(value) => updateInput(key, value)}
                    onBlur={
                      percentFields.has(key)
                        ? () => markPercentFieldBlurred(key as AdBreakEvenPercentField)
                        : undefined
                    }
                    error={
                      validation.fieldErrors[key]
                        ? copy.validation[validation.fieldErrors[key]]
                        : undefined
                    }
                    warning={
                      percentFields.has(key)
                        ? getPercentWarning(key as AdBreakEvenPercentField)
                        : undefined
                    }
                  />
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.target}</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                {(["profitAmount", "marginPercent"] as AdTargetMode[]).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => updateTargetMode(mode)}
                    className={joinClassNames(
                      "min-h-11 rounded-md px-3 text-sm font-bold transition",
                      input.targetMode === mode ? "bg-white text-brand-700 shadow-sm" : "text-ink-600 hover:bg-white/70",
                    )}
                  >
                    {copy.targetModes[mode]}
                  </button>
                ))}
              </div>
              <div className="mt-5">
                {input.targetMode === "profitAmount" ? (
                  <NumberField
                    id="ad-target-profit"
                    label={copy.inputs.targetProfitPerOrder}
                    value={input.targetProfitPerOrder}
                    suffix={currency}
                    onChange={(value) => updateInput("targetProfitPerOrder", value)}
                    error={
                      validation.fieldErrors.targetProfitPerOrder
                        ? copy.validation[validation.fieldErrors.targetProfitPerOrder]
                        : undefined
                    }
                  />
                ) : (
                  <NumberField
                    id="ad-target-margin"
                    label={copy.inputs.targetProfitMarginPercent}
                    value={input.targetProfitMarginPercent}
                    suffix="%"
                    onChange={(value) => updateInput("targetProfitMarginPercent", value)}
                    onBlur={() => markPercentFieldBlurred("targetProfitMarginPercent")}
                    error={
                      validation.fieldErrors.targetProfitMarginPercent
                        ? copy.validation[validation.fieldErrors.targetProfitMarginPercent]
                        : undefined
                    }
                    warning={getPercentWarning("targetProfitMarginPercent")}
                  />
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.currentMetrics}</h2>
              <div className="mt-5 grid gap-4">
                <NumberField
                  id="ad-current-roas"
                  label={copy.inputs.currentRoas}
                  value={input.currentRoas}
                  suffix="x"
                  onChange={(value) => updateInput("currentRoas", value)}
                  error={
                    validation.fieldErrors.currentRoas
                      ? copy.validation[validation.fieldErrors.currentRoas]
                      : undefined
                  }
                />
                <NumberField
                  id="ad-current-cpa"
                  label={copy.inputs.currentCpa}
                  value={input.currentCpa}
                  suffix={currency}
                  onChange={(value) => updateInput("currentCpa", value)}
                  error={
                    validation.fieldErrors.currentCpa
                      ? copy.validation[validation.fieldErrors.currentCpa]
                      : undefined
                  }
                />
              </div>
              <button
                type="button"
                onClick={resetDemoState}
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-ink-700 hover:bg-slate-50"
              >
                {copy.actions.reset}
              </button>
            </section>
          </div>

          <div className="min-w-0 space-y-6">
            {calculationResponse?.errors.includes("revenueNonPositive") ? (
              <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-950">
                {copy.warnings.revenueNonPositive}
              </section>
            ) : null}
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.results}</h2>
              {calculation ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ResultBox label={copy.outputs.revenue} value={formatCurrency(calculation.revenue, currency, locale)} />
                <ResultBox label={copy.outputs.variableCostBeforeAds} value={formatCurrency(calculation.variableCostBeforeAds, currency, locale)} />
                <ResultBox
                  label={copy.outputs.contributionMarginBeforeAds}
                  value={formatCurrency(calculation.contributionMarginBeforeAds, currency, locale)}
                  strong
                />
                <ResultBox label={copy.outputs.breakEvenAdSpendPerOrder} value={formatNullableMoney(calculation.breakEvenAdSpendPerOrder, currency, locale)} />
                <ResultBox label={copy.outputs.maxCpaAtBreakEven} value={formatNullableMoney(calculation.maxCpaAtBreakEven, currency, locale)} />
                <ResultBox label={copy.outputs.breakEvenRoas} value={formatRatio(calculation.breakEvenRoas, locale)} />
                <ResultBox label={copy.outputs.targetProfit} value={formatCurrency(calculation.targetProfit, currency, locale)} />
                <ResultBox label={copy.outputs.targetAdSpendPerOrder} value={formatNullableMoney(calculation.targetAdSpendPerOrder, currency, locale)} />
                <ResultBox label={copy.outputs.targetCpa} value={formatNullableMoney(calculation.targetCpa, currency, locale)} />
                <ResultBox label={copy.outputs.targetRoas} value={formatRatio(calculation.targetRoas, locale)} strong />
                <ResultBox label={copy.outputs.breakEvenAcos} value={formatNullablePercentRatio(calculation.breakEvenAcos, locale)} />
                <ResultBox label={copy.outputs.targetAcos} value={formatNullablePercentRatio(calculation.targetAcos, locale)} />
                <ResultBox label={copy.outputs.platformFee} value={formatCurrency(calculation.platformFee, currency, locale)} />
                <ResultBox label={copy.outputs.paymentFee} value={formatCurrency(calculation.paymentFee, currency, locale)} />
                <ResultBox label={copy.outputs.profitStatus} value={copy.statuses[calculation.profitStatus]} strong />
              </div> : null}
            </section>

            {calculation && (calculation.warnings.contributionMarginNonPositive || calculation.warnings.targetAdSpendNonPositive) && (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-xl font-bold text-amber-950">{copy.sections.warnings}</h2>
                <div className="mt-4 space-y-3 text-sm font-semibold leading-6 text-amber-950">
                  {calculation.warnings.contributionMarginNonPositive ? <p>{copy.warnings.contributionMarginNonPositive}</p> : null}
                  {calculation.warnings.targetAdSpendNonPositive ? <p>{copy.warnings.targetAdSpendNonPositive}</p> : null}
                </div>
              </section>
            )}

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.formulas}</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-ink-600">
                {copy.formulas.map((formula) => (
                  <li key={formula}>{formula}</li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <InfoPanel title={copy.sections.example}>
            <p className="text-sm leading-6 text-ink-600">{copy.example.body}</p>
          </InfoPanel>
          <InfoPanel title={copy.sections.mistakes}>
            <ul className="space-y-3 text-sm leading-6 text-ink-600">
              {copy.mistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </InfoPanel>
          <InfoPanel title={copy.sections.pro}>
            <p className="text-sm leading-6 text-ink-600">{copy.pro.subtitle}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {copy.pro.buttons.map((button) => (
                <button
                  type="button"
                  key={button}
                  onClick={() => setProModal(button)}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-ink-700 hover:bg-slate-50"
                >
                  {button}
                </button>
              ))}
            </div>
          </InfoPanel>
          <InfoPanel title={copy.sections.related}>
            <RelatedTools locale={locale} messages={messages} excludeHref="/ad-spend-break-even-calculator" />
          </InfoPanel>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-ink-950">{copy.sections.faq}</h2>
          <div className="mt-5 space-y-3">
            {copy.faq.map((item) => (
              <details key={item.question} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <summary className="cursor-pointer text-sm font-bold text-ink-800">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-ink-500">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DisclaimerBox title={messages.home.disclaimer.title} body={messages.home.disclaimer.body} />
        </div>
      </section>

      {proModal ? (
        <ProFeatureModal
          eyebrow={proModal}
          title={copy.pro.modalTitle}
          body={copy.pro.modalBody}
          closeLabel={copy.pro.close}
          ctaLabel={messages.nav.joinWaitlist}
          ctaHref={`/${locale}#waitlist`}
          onClose={() => setProModal(null)}
        />
      ) : null}
    </>
  );
}

function NumberField({
  id,
  label,
  value,
  suffix,
  onChange,
  onBlur,
  error,
  warning,
}: {
  id: string;
  label: string;
  value: string;
  suffix: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  warning?: string;
}) {
  const messageId = error || warning ? `${id}-message` : undefined;

  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <span
        className={joinClassNames(
          "mt-2 flex h-11 overflow-hidden rounded-md border bg-white focus-within:ring-4",
          error
            ? "border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-100"
            : "border-slate-200 focus-within:border-brand-500 focus-within:ring-brand-100",
        )}
      >
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          className="h-full min-w-0 flex-1 border-0 px-3 text-sm text-ink-950 outline-none"
        />
        <span className="grid min-w-14 place-items-center border-l border-slate-200 bg-slate-50 px-2 text-xs font-bold text-ink-500">
          {suffix}
        </span>
      </span>
      {error ? (
        <span id={messageId} className="mt-1.5 block text-xs font-semibold text-rose-700">
          {error}
        </span>
      ) : warning ? (
        <span id={messageId} className="mt-1.5 block text-xs font-semibold leading-5 text-amber-700">
          {warning}
        </span>
      ) : null}
    </label>
  );
}

function ResultBox({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={joinClassNames("rounded-lg border border-slate-200 bg-slate-50 p-4", strong && "border-brand-100 bg-brand-50")}>
      <p className="text-xs font-bold uppercase text-ink-500">{label}</p>
      <p className="mt-2 text-xl font-black text-ink-950">{value}</p>
    </div>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-ink-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function formatNullableMoney(value: number | null, currency: string, locale: Locale) {
  return value === null ? "N/A" : formatCurrency(value, currency, locale);
}

function formatNullablePercentRatio(value: number | null, locale: Locale) {
  return value === null ? "N/A" : formatPercent(value * 100, locale);
}
