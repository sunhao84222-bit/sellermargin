"use client";

import { useMemo, useState } from "react";
import ProFeatureModal from "@/components/ProFeatureModal";
import CurrencySelector from "@/components/CurrencySelector";
import { useCurrency } from "@/components/CurrencyProvider";
import DisclaimerBox from "@/components/DisclaimerBox";
import RelatedTools from "@/components/RelatedTools";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculateMultiPlatformProfit } from "@/lib/calculators";
import {
  platformFeeFieldOrder,
  platformIds,
  type FeeFieldKey,
  type PlatformId,
} from "@/lib/defaultFees";
import { formatCurrency, formatPercent, formatRatio, joinClassNames } from "@/lib/formatters";
import type { Locale, Messages } from "@/lib/locales";
import {
  createDefaultRawMultiPlatformState,
  getMultiPlatformPercentWarning,
  multiPlatformFeePath,
  multiPlatformInputFields,
  multiPlatformPercentFeeFields,
  multiPlatformPercentInputFields,
  normalizeSavedMultiPlatformState,
  validateMultiPlatformState,
  type MultiPlatformInputField,
  type RawMultiPlatformState,
} from "@/lib/schemas/multiPlatform";

type MultiPlatformProfitCalculatorProps = {
  locale: Locale;
  messages: Messages;
};

const storageKey = "sellerMargin.multiPlatform.state";
const legacyStorageKey = "sellermargin_multi_platform_calculator_v1";

const defaultState = createDefaultRawMultiPlatformState();
const percentInputKeys = new Set<MultiPlatformInputField>(
  multiPlatformPercentInputFields,
);
const percentFeeFields = new Set<FeeFieldKey>(
  multiPlatformPercentFeeFields,
);

export default function MultiPlatformProfitCalculator({ locale, messages }: MultiPlatformProfitCalculatorProps) {
  const copy = messages.multiPlatform;
  const { currency } = useCurrency();
  const {
    value: savedState,
    setValue: setSavedState,
    remove: resetSavedState,
  } = useLocalStorage<RawMultiPlatformState>(
    storageKey,
    structuredClone(defaultState),
    {
      legacyKeys: [legacyStorageKey],
      deserialize: (rawValue) =>
        normalizeSavedMultiPlatformState(JSON.parse(rawValue)),
    },
  );
  const { input, selectedPlatforms, feeAssumptions } = savedState;
  const [proModal, setProModal] = useState<string | null>(null);
  const [blurredPercentFields, setBlurredPercentFields] = useState<
    Record<string, boolean>
  >({});

  const validation = useMemo(
    () => validateMultiPlatformState(savedState),
    [savedState],
  );
  const calculationResponse = useMemo(
    () =>
      validation.success
        ? calculateMultiPlatformProfit(
            validation.data.input,
            validation.data.selectedPlatforms,
            validation.data.feeAssumptions,
          )
        : null,
    [validation],
  );
  const calculation = calculationResponse?.result ?? null;

  function updateInput(key: MultiPlatformInputField, value: string) {
    setSavedState((current) => ({
      ...current,
      input: {
        ...current.input,
        [key]: value,
      },
    }));
  }

  function updateFee(platform: PlatformId, key: FeeFieldKey, value: string) {
    setSavedState((current) => ({
      ...current,
      feeAssumptions: {
        ...current.feeAssumptions,
        [platform]: {
          ...current.feeAssumptions[platform],
          [key]: value,
        },
      },
    }));
  }

  function togglePlatform(platform: PlatformId) {
    setSavedState((current) => ({
      ...current,
      selectedPlatforms: current.selectedPlatforms.includes(platform)
        ? current.selectedPlatforms.filter((item) => item !== platform)
        : [...current.selectedPlatforms, platform],
    }));
  }

  function resetDemoState() {
    resetSavedState();
    setBlurredPercentFields({});
  }

  function fieldError(path: string) {
    const error = validation.fieldErrors[path];
    return error ? copy.validation[error] : undefined;
  }

  function markPercentFieldBlurred(path: string) {
    setBlurredPercentFields((current) => ({ ...current, [path]: true }));
  }

  function percentWarning(path: string, value: string) {
    if (!blurredPercentFields[path]) {
      return undefined;
    }

    const warning = getMultiPlatformPercentWarning(value);
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
              <p className="mt-3 text-xs font-medium text-ink-500">{copy.hero.lastUpdated}</p>
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
                {multiPlatformInputFields.map((key) => {
                  const path = `input.${key}`;
                  const isPercentage = percentInputKeys.has(key);

                  return (
                  <div key={key}>
                    <NumberField
                      id={`input-${key}`}
                      label={copy.inputs[key]}
                      value={input[key]}
                      suffix={isPercentage ? "%" : currency}
                      onChange={(value) => updateInput(key, value)}
                      onBlur={
                        isPercentage
                          ? () => markPercentFieldBlurred(path)
                          : undefined
                      }
                      error={fieldError(path)}
                      warning={
                        isPercentage
                          ? percentWarning(path, input[key])
                          : undefined
                      }
                    />
                    {key === "refundRate" ? (
                      <p className="mt-2 text-xs leading-5 text-ink-500">{copy.refundReserveNote}</p>
                    ) : null}
                  </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.platforms}</h2>
              <div className="mt-4 grid gap-3">
                {platformIds.map((platform) => (
                  <label
                    key={platform}
                    className={joinClassNames(
                      "flex cursor-pointer items-center justify-between rounded-md border px-3 py-3 text-sm font-bold transition",
                      selectedPlatforms.includes(platform)
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-ink-700 hover:bg-slate-50",
                    )}
                  >
                    <span>{copy.platforms[platform]}</span>
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      className="h-4 w-4 accent-brand-600"
                    />
                  </label>
                ))}
              </div>
              {fieldError("selectedPlatforms") ? (
                <p
                  className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                  role="alert"
                >
                  {fieldError("selectedPlatforms")}
                </p>
              ) : null}
            </section>
          </div>

          <div className="min-w-0 space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-ink-950">{copy.sections.feeAssumptions}</h2>
                <button
                  type="button"
                  onClick={resetDemoState}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-ink-700 hover:bg-slate-50"
                >
                  {copy.actions.reset}
                </button>
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {platformIds.map((platform) => (
                  <section key={platform} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-ink-950">{copy.platforms[platform]}</h3>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-ink-500">
                        {copy.actions.editable}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {platformFeeFieldOrder[platform].map((field) => {
                        const path = multiPlatformFeePath(platform, field);
                        const isPercentage = percentFeeFields.has(field);
                        const value = feeAssumptions[platform]?.[field] ?? "";

                        return (
                          <NumberField
                            key={field}
                            id={`${platform}-${field}`}
                            label={copy.feeFields[field]}
                            value={value}
                            suffix={isPercentage ? "%" : currency}
                            onChange={(nextValue) =>
                              updateFee(platform, field, nextValue)
                            }
                            onBlur={
                              isPercentage
                                ? () => markPercentFieldBlurred(path)
                                : undefined
                            }
                            error={fieldError(path)}
                            warning={
                              isPercentage
                                ? percentWarning(path, value)
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.summary}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <SummaryBox
                  label={copy.results.bestNetProfit}
                  value={calculation?.summary.bestNetProfitPlatform ? copy.platforms[calculation.summary.bestNetProfitPlatform] : "N/A"}
                />
                <SummaryBox
                  label={copy.results.bestMargin}
                  value={calculation?.summary.bestMarginPlatform ? copy.platforms[calculation.summary.bestMarginPlatform] : "N/A"}
                />
                <SummaryBox
                  label={copy.results.lowestFee}
                  value={calculation?.summary.lowestFeePlatform ? copy.platforms[calculation.summary.lowestFeePlatform] : "N/A"}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.results}</h2>
              {calculationResponse?.errors.includes("netRevenueNonPositive") ? (
                <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {copy.validation.netRevenueNonPositive}
                </p>
              ) : null}
              {calculation?.error === null && selectedPlatforms.length > 0 ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-[1460px] border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-bold uppercase text-ink-500">
                        <TableHead label={copy.results.platform} />
                        <TableHead label={copy.results.grossRevenue} />
                        <TableHead label={copy.results.discountAmount} />
                        <TableHead label={copy.results.netRevenue} />
                        <TableHead label={copy.results.platformFee} />
                        <TableHead label={copy.results.paymentFee} />
                        <TableHead label={copy.results.fulfillmentFee} />
                        <TableHead label={copy.results.productCost} />
                        <TableHead label={copy.results.shippingCost} />
                        <TableHead label={copy.results.packagingCost} />
                        <TableHead label={copy.results.adCost} />
                        <TableHead label={copy.results.refundReserve} />
                        <TableHead label={copy.results.otherVariableCost} />
                        <TableHead label={copy.results.totalCost} />
                        <TableHead label={copy.results.netProfit} />
                        <TableHead label={copy.results.profitMargin} />
                        <TableHead label={copy.results.grossRoas} />
                        <TableHead label={copy.results.netRevenueRoas} />
                        <TableHead label={copy.results.poas} />
                      </tr>
                    </thead>
                    <tbody>
                      {calculation.results.map((result) => (
                        <tr
                          key={result.platform}
                          className={joinClassNames(
                            "border-t border-slate-200",
                            result.platform === calculation.summary.bestNetProfitPlatform && "bg-mint-50",
                          )}
                        >
                          <TableCell strong>
                            <div className="flex min-w-36 flex-col gap-2">
                              {copy.platforms[result.platform]}
                              <div className="flex flex-wrap gap-1">
                                {result.platform === calculation.summary.bestNetProfitPlatform ? (
                                  <Badge>{copy.badges.bestProfit}</Badge>
                                ) : null}
                                {result.platform === calculation.summary.bestMarginPlatform ? (
                                  <Badge>{copy.badges.bestMargin}</Badge>
                                ) : null}
                                {result.platform === calculation.summary.lowestFeePlatform ? (
                                  <Badge>{copy.badges.lowestFee}</Badge>
                                ) : null}
                              </div>
                            </div>
                          </TableCell>
                          <MoneyCell value={result.grossRevenue} currency={currency} locale={locale} />
                          <MoneyCell value={result.discountAmount} currency={currency} locale={locale} />
                          <MoneyCell value={result.netRevenue} currency={currency} locale={locale} />
                          <MoneyCell value={result.platformFee} currency={currency} locale={locale} />
                          <MoneyCell value={result.paymentFee} currency={currency} locale={locale} />
                          <MoneyCell value={result.fulfillmentFee} currency={currency} locale={locale} />
                          <MoneyCell value={result.productCost} currency={currency} locale={locale} />
                          <MoneyCell value={result.shippingCost} currency={currency} locale={locale} />
                          <MoneyCell value={result.packagingCost} currency={currency} locale={locale} />
                          <MoneyCell value={result.adCost} currency={currency} locale={locale} />
                          <MoneyCell value={result.refundReserve} currency={currency} locale={locale} />
                          <MoneyCell value={result.otherVariableCost} currency={currency} locale={locale} />
                          <MoneyCell value={result.totalCost} currency={currency} locale={locale} />
                          <MoneyCell value={result.netProfit} currency={currency} locale={locale} strong />
                          <TableCell strong>{formatPercent(result.profitMargin, locale)}</TableCell>
                          <TableCell>{formatRatio(result.grossRoas, locale)}</TableCell>
                          <TableCell>{formatRatio(result.netRevenueRoas, locale)}</TableCell>
                          <TableCell>{formatRatio(result.poas, locale)}</TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <InfoPanel title={copy.sections.formulas}>
            <ol className="space-y-3 text-sm leading-6 text-ink-600">
              {copy.formulas.map((formula) => (
                <li key={formula}>{formula}</li>
              ))}
            </ol>
          </InfoPanel>

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
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
          <section>
            <h2 className="text-2xl font-bold text-ink-950">{copy.sections.faq}</h2>
            <div className="mt-5 space-y-3">
              {copy.faq.map((item) => (
                <details key={item.question} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <summary className="cursor-pointer text-sm font-bold text-ink-800">{item.question}</summary>
                  <p className="mt-3 text-sm leading-6 text-ink-500">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-950">{copy.sections.related}</h2>
            <div className="mt-5">
              <RelatedTools locale={locale} messages={messages} />
            </div>
          </section>
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

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase text-ink-500">{label}</p>
      <p className="mt-2 text-lg font-black text-ink-950">{value}</p>
    </div>
  );
}

function TableHead({ label }: { label: string }) {
  return <th className="border-b border-slate-200 bg-slate-50 px-3 py-3">{label}</th>;
}

function TableCell({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <td className={joinClassNames("border-b border-slate-100 px-3 py-3 align-middle text-ink-700", strong && "font-bold text-ink-950")}>
      {children}
    </td>
  );
}

function MoneyCell({
  value,
  currency,
  locale,
  strong = false,
}: {
  value: number;
  currency: string;
  locale: Locale;
  strong?: boolean;
}) {
  return (
    <TableCell strong={strong}>
      <span className={value < 0 ? "text-red-700" : undefined}>
        {formatCurrency(value, currency, locale)}
      </span>
    </TableCell>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-white px-2 py-1 text-[11px] font-black text-brand-700 shadow-sm">{children}</span>;
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-ink-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
