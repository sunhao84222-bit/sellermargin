"use client";

import { useMemo, useState, type ReactNode } from "react";
import ProFeatureModal from "@/components/ProFeatureModal";
import CurrencySelector from "@/components/CurrencySelector";
import { useCurrency } from "@/components/CurrencyProvider";
import DisclaimerBox from "@/components/DisclaimerBox";
import RelatedTools from "@/components/RelatedTools";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  paymentProviderIds,
  type PaymentFeeAssumption,
  type PaymentProviderId,
} from "@/lib/defaultFees";
import { calculatePaymentFees } from "@/lib/calculators";
import { formatCurrency, formatPercent, joinClassNames } from "@/lib/formatters";
import type { Locale, Messages } from "@/lib/locales";
import {
  createDefaultRawPaymentFeeState,
  getPaymentPercentWarning,
  normalizeSavedPaymentFeeState,
  paymentFeePath,
  paymentPercentProviderFeeFields,
  validatePaymentFeeState,
  type PaymentInputField,
  type PaymentProviderFeeField,
  type RawPaymentFeeState,
} from "@/lib/schemas/paymentFees";

type PaymentFeeCalculatorProps = {
  locale: Locale;
  messages: Messages;
};

const storageKey = "sellerMargin.paymentFees.state";
const legacyStorageKey = "sellermargin_payment_fee_calculator_v1";

const defaultState = createDefaultRawPaymentFeeState();

const providerFeeFields: Array<{
  key: keyof PaymentFeeAssumption;
  percentage: boolean;
}> = [
  { key: "percentageFee", percentage: true },
  { key: "fixedFee", percentage: false },
  { key: "internationalCardSurchargePercent", percentage: true },
  { key: "currencyConversionFeePercent", percentage: true },
  { key: "refundRetainedPercentageFee", percentage: true },
  { key: "refundNonRefundableFixedFee", percentage: false },
  { key: "chargebackFixedFee", percentage: false },
];

export default function PaymentFeeCalculator({ locale, messages }: PaymentFeeCalculatorProps) {
  const copy = messages.paymentFees;
  const { currency } = useCurrency();
  const {
    value: savedState,
    setValue: setSavedState,
    remove: resetSavedState,
  } = useLocalStorage<RawPaymentFeeState>(
    storageKey,
    structuredClone(defaultState),
    {
      legacyKeys: [legacyStorageKey],
      deserialize: (rawValue) =>
        normalizeSavedPaymentFeeState(JSON.parse(rawValue)),
    },
  );
  const { input, feeAssumptions } = savedState;
  const [proModal, setProModal] = useState<string | null>(null);
  const [blurredPercentFields, setBlurredPercentFields] = useState<
    Record<string, boolean>
  >({});

  const validation = useMemo(
    () => validatePaymentFeeState(savedState),
    [savedState],
  );
  const calculationResponse = useMemo(
    () =>
      validation.success
        ? calculatePaymentFees(
            validation.data.input,
            validation.data.feeAssumptions,
          )
        : null,
    [validation],
  );
  const calculation = calculationResponse?.result ?? null;
  const hasErrors =
    !validation.success || (calculationResponse?.errors.length ?? 0) > 0;

  function updateInput(key: PaymentInputField, value: string) {
    setSavedState((current) => ({
      ...current,
      input: {
        ...current.input,
        [key]: value,
      },
    }));
  }

  function updateProviderFee(
    provider: PaymentProviderId,
    key: PaymentProviderFeeField,
    value: string,
  ) {
    setSavedState((current) => ({
      ...current,
      feeAssumptions: {
        ...current.feeAssumptions,
        [provider]: {
          ...current.feeAssumptions[provider],
          [key]: value,
        },
      },
    }));
  }

  function resetDemoState() {
    resetSavedState();
    setBlurredPercentFields({});
  }

  function providerName(provider: PaymentProviderId | null) {
    return provider ? copy.providers[provider] : "N/A";
  }

  function fieldError(path: string) {
    const error = validation.fieldErrors[path];
    return error ? copy.validation[error] : undefined;
  }

  function percentWarning(path: string, value: string) {
    if (!blurredPercentFields[path]) {
      return undefined;
    }

    const warning = getPaymentPercentWarning(value);
    return warning ? copy.validation[warning] : undefined;
  }

  function markPercentFieldBlurred(path: string) {
    setBlurredPercentFields((current) => ({ ...current, [path]: true }));
  }

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-brand-700">{copy.hero.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black text-ink-950 sm:text-4xl lg:text-5xl">{copy.hero.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink-500">{copy.hero.subtitle}</p>
          <div className="mt-6 max-w-xs rounded-lg border border-slate-200 bg-slate-50 p-4">
            <CurrencySelector messages={messages} showNotice />
            <p className="mt-3 text-xs font-semibold text-ink-500">{copy.hero.lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[390px_1fr] lg:px-8">
          <div className="min-w-0 space-y-6">
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="text-lg font-bold text-emerald-950">{copy.notice.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-emerald-950">{copy.notice.body}</p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.inputs}</h2>
              <div className="mt-5 grid gap-4">
                <NumberField
                  id="payment-transaction-amount"
                  label={copy.inputs.transactionAmount}
                  value={input.transactionAmount}
                  suffix={currency}
                  onChange={(value) => updateInput("transactionAmount", value)}
                  error={fieldError("input.transactionAmount")}
                />
                <NumberField
                  id="payment-number-of-transactions"
                  label={copy.inputs.numberOfTransactions}
                  value={input.numberOfTransactions}
                  suffix="#"
                  step="1"
                  onChange={(value) => updateInput("numberOfTransactions", value)}
                  error={fieldError("input.numberOfTransactions")}
                />
                <NumberField
                  id="payment-optional-extra-fee"
                  label={copy.inputs.optionalExtraFeePercent}
                  value={input.optionalExtraFeePercent}
                  suffix="%"
                  onChange={(value) => updateInput("optionalExtraFeePercent", value)}
                  onBlur={() =>
                    markPercentFieldBlurred("input.optionalExtraFeePercent")
                  }
                  error={fieldError("input.optionalExtraFeePercent")}
                  warning={percentWarning(
                    "input.optionalExtraFeePercent",
                    input.optionalExtraFeePercent,
                  )}
                />
                <NumberField
                  id="payment-refund-rate"
                  label={copy.inputs.refundRate}
                  value={input.refundRate}
                  suffix="%"
                  allowNegative
                  onChange={(value) => updateInput("refundRate", value)}
                  onBlur={() => markPercentFieldBlurred("input.refundRate")}
                  error={fieldError("input.refundRate")}
                  warning={percentWarning("input.refundRate", input.refundRate)}
                />
                <NumberField
                  id="payment-chargeback-rate"
                  label={copy.inputs.chargebackRate}
                  value={input.chargebackRate}
                  suffix="%"
                  allowNegative
                  onChange={(value) => updateInput("chargebackRate", value)}
                  onBlur={() => markPercentFieldBlurred("input.chargebackRate")}
                  error={fieldError("input.chargebackRate")}
                  warning={percentWarning(
                    "input.chargebackRate",
                    input.chargebackRate,
                  )}
                />
              </div>
              <p className="mt-4 text-xs font-medium leading-5 text-ink-500">{copy.riskNote}</p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-ink-950">{copy.sections.assumptions}</h2>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{copy.actions.editable}</span>
              </div>
              <div className="mt-5 divide-y divide-slate-100">
                {paymentProviderIds.map((provider) => (
                  <div key={provider} className="py-5 first:pt-0 last:pb-0">
                    <h3 className="text-base font-bold text-ink-950">{copy.providers[provider]}</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {providerFeeFields.map(({ key, percentage }) => {
                        const path = paymentFeePath(provider, key);
                        const isPercentage =
                          paymentPercentProviderFeeFields.includes(
                            key as (typeof paymentPercentProviderFeeFields)[number],
                          );

                        return (
                          <NumberField
                            key={key}
                            id={`payment-${provider}-${key}`}
                            label={copy.inputs[key]}
                            value={feeAssumptions[provider][key]}
                            suffix={percentage ? "%" : currency}
                            tooltip={
                              key === "refundRetainedPercentageFee"
                                ? copy.refundRetainedPercentageFeeTooltip
                                : undefined
                            }
                            onChange={(value) =>
                              updateProviderFee(provider, key, value)
                            }
                            onBlur={
                              isPercentage
                                ? () => markPercentFieldBlurred(path)
                                : undefined
                            }
                            error={fieldError(path)}
                            warning={
                              isPercentage
                                ? percentWarning(
                                    path,
                                    feeAssumptions[provider][key],
                                  )
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
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
            {hasErrors && calculation ? (
              <section className="rounded-lg border border-rose-200 bg-rose-50 p-5">
                <h2 className="text-xl font-bold text-rose-950">{copy.sections.results}</h2>
                <div className="mt-4 space-y-2 text-sm font-semibold leading-6 text-rose-950">
                  {calculation.errors.transactionAmountNonPositive ? <p>{copy.validation.transactionAmountNonPositive}</p> : null}
                  {calculation.errors.numberOfTransactionsNonPositive ? <p>{copy.validation.numberOfTransactionsNonPositive}</p> : null}
                  {calculation.errors.refundRateNegative ? <p>{copy.validation.refundRateNegative}</p> : null}
                  {calculation.errors.chargebackRateNegative ? <p>{copy.validation.chargebackRateNegative}</p> : null}
                </div>
              </section>
            ) : null}
            {calculationResponse?.warnings.includes("extremePercentage") ? (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-950">
                {copy.validation.extremePercentage}
              </section>
            ) : null}

            {calculation ? <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.summary}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ResultBox label={copy.outputs.lowestCostProvider} value={providerName(calculation.summary.lowestCostProvider)} strong />
                <ResultBox label={copy.outputs.highestCostProvider} value={providerName(calculation.summary.highestCostProvider)} />
                <ResultBox
                  label={copy.outputs.estimatedMonthlySavings}
                  value={formatMaybeMoney(calculation.summary.estimatedMonthlySavings, currency, locale, hasErrors)}
                  strong
                />
                <ResultBox
                  label={copy.outputs.estimatedAnnualSavings}
                  value={formatMaybeMoney(calculation.summary.estimatedAnnualSavings, currency, locale, hasErrors)}
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <ResultBox
                  label={copy.outputs.estimatedRefundTransactions}
                  value={hasErrors ? "N/A" : formatNumber(calculation.estimatedRefundTransactions, locale)}
                />
                <ResultBox
                  label={copy.outputs.estimatedChargebackTransactions}
                  value={hasErrors ? "N/A" : formatNumber(calculation.estimatedChargebackTransactions, locale)}
                />
              </div>
            </section> : null}

            {calculation ? <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.results}</h2>
              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                {calculation.results.map((result) => (
                  <article key={result.provider} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-lg font-black text-ink-950">{copy.providers[result.provider]}</h3>
                    <dl className="mt-4 space-y-3">
                      <Metric label={copy.outputs.grossTransactionVolume} value={formatMaybeMoney(result.grossTransactionVolume, currency, locale, hasErrors)} />
                      <Metric label={copy.outputs.baseFeePerTransaction} value={formatMaybeMoney(result.baseFeePerTransaction, currency, locale, hasErrors)} />
                      <Metric label={copy.outputs.extraPercentageFeePerTransaction} value={formatMaybeMoney(result.extraPercentageFeePerTransaction, currency, locale, hasErrors)} />
                      <Metric label={copy.outputs.feePerTransaction} value={formatMaybeMoney(result.feePerTransaction, currency, locale, hasErrors)} />
                      <Metric label={copy.outputs.estimatedRefundCost} value={formatMaybeMoney(result.estimatedRefundCost, currency, locale, hasErrors)} />
                      <Metric label={copy.outputs.estimatedChargebackCost} value={formatMaybeMoney(result.estimatedChargebackCost, currency, locale, hasErrors)} />
                      <Metric label={copy.outputs.totalFees} value={formatMaybeMoney(result.totalFees, currency, locale, hasErrors)} strong />
                      <Metric label={copy.outputs.netReceived} value={formatMaybeMoney(result.netReceived, currency, locale, hasErrors)} />
                      <Metric label={copy.outputs.effectiveFeeRate} value={formatMaybePercent(result.effectiveFeeRate, locale, hasErrors)} />
                      <Metric
                        label={copy.outputs.differenceVsLowestCostProvider}
                        value={formatMaybeMoney(result.differenceVsLowestCostProvider, currency, locale, hasErrors)}
                      />
                      <Metric label={copy.outputs.monthlyEstimatedFees} value={formatMaybeMoney(result.monthlyEstimatedFees, currency, locale, hasErrors)} />
                      <Metric label={copy.outputs.annualEstimatedFees} value={formatMaybeMoney(result.annualEstimatedFees, currency, locale, hasErrors)} />
                    </dl>
                  </article>
                ))}
              </div>
            </section> : null}

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
            <RelatedTools locale={locale} messages={messages} excludeHref="/stripe-vs-paypal-fee-calculator" />
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
  step = "0.01",
  allowNegative = false,
  tooltip,
  onChange,
  onBlur,
  error,
  warning,
}: {
  id: string;
  label: string;
  value: string;
  suffix: string;
  step?: string;
  allowNegative?: boolean;
  tooltip?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  warning?: string;
}) {
  const messageId = error || warning ? `${id}-message` : undefined;

  return (
    <label htmlFor={id} className="block">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink-700">
        {label}
        {tooltip ? (
          <span
            className="grid h-5 w-5 cursor-help place-items-center rounded-full border border-slate-300 text-xs font-bold text-ink-500"
            title={tooltip}
            aria-label={tooltip}
            tabIndex={0}
          >
            ?
          </span>
        ) : null}
      </span>
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
          min={allowNegative ? undefined : "0"}
          step={step}
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
        <span
          id={messageId}
          className="mt-1.5 block text-xs font-semibold text-rose-700"
        >
          {error}
        </span>
      ) : warning ? (
        <span
          id={messageId}
          className="mt-1.5 block text-xs font-semibold leading-5 text-amber-700"
        >
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

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-slate-200 pt-3 first:border-t-0 first:pt-0">
      <dt className="text-xs font-semibold leading-5 text-ink-500">{label}</dt>
      <dd className={joinClassNames("text-right text-sm font-bold text-ink-800", strong && "text-brand-700")}>{value}</dd>
    </div>
  );
}

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-ink-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function formatMaybeMoney(value: number, currency: string, locale: Locale, shouldHide: boolean) {
  return shouldHide ? "N/A" : formatCurrency(value, currency, locale);
}

function formatMaybePercent(value: number | null, locale: Locale, shouldHide: boolean) {
  if (shouldHide || value === null) {
    return "N/A";
  }

  return formatPercent(value, locale);
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale === "es" ? "es-ES" : "en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}
