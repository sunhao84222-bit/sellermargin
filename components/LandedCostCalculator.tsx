"use client";

import { useMemo, useState, type ReactNode } from "react";
import ProFeatureModal from "@/components/ProFeatureModal";
import CurrencySelector from "@/components/CurrencySelector";
import { useCurrency } from "@/components/CurrencyProvider";
import DisclaimerBox from "@/components/DisclaimerBox";
import RelatedTools from "@/components/RelatedTools";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculateLandedCost } from "@/lib/calculators";
import { formatCurrency, formatPercent, joinClassNames } from "@/lib/formatters";
import type { Locale, Messages } from "@/lib/locales";
import {
  createDefaultRawLandedCostState,
  freightTypes,
  getLandedCostPercentWarning,
  landedCostPercentFields,
  normalizeSavedLandedCostState,
  validateLandedCostState,
  type CustomsValuationMethod,
  type FreightType,
  type LandedCostNumericField,
  type RawLandedCostState,
} from "@/lib/schemas/landedCost";

type LandedCostCalculatorProps = {
  locale: Locale;
  messages: Messages;
};

const storageKey = "sellerMargin.landedCost.state";
const legacyStorageKey = "sellermargin_landed_cost_calculator_v1";
const defaultState = createDefaultRawLandedCostState();
const percentageInputKeys = new Set<LandedCostNumericField>(
  landedCostPercentFields,
);

export default function LandedCostCalculator({ locale, messages }: LandedCostCalculatorProps) {
  const copy = messages.landedCost;
  const { currency } = useCurrency();
  const {
    value: savedState,
    setValue: setSavedState,
    remove: resetSavedState,
  } = useLocalStorage<RawLandedCostState>(
    storageKey,
    structuredClone(defaultState),
    {
      legacyKeys: [legacyStorageKey],
      deserialize: (rawValue) =>
        normalizeSavedLandedCostState(JSON.parse(rawValue)),
    },
  );
  const { input, details } = savedState;
  const [proModal, setProModal] = useState<string | null>(null);
  const [blurredPercentFields, setBlurredPercentFields] = useState<
    Record<string, boolean>
  >({});

  const validation = useMemo(
    () => validateLandedCostState(savedState),
    [savedState],
  );
  const calculationResponse = useMemo(
    () =>
      validation.success
        ? calculateLandedCost(validation.data.input)
        : null,
    [validation],
  );
  const calculation = calculationResponse?.result ?? null;
  const hidePerUnitResults = calculation === null;
  const hasErrors =
    !validation.success || (calculationResponse?.errors.length ?? 0) > 0;

  const landedCostRows = [
    {
      label: copy.inputs.productUnitCost,
      value: validation.success ? validation.data.input.productUnitCost : 0,
      included: true,
    },
    { label: copy.outputs.freightPerUnit, value: calculation?.freightPerUnit ?? 0, included: true },
    { label: copy.outputs.insurancePerUnit, value: calculation?.insurancePerUnit ?? 0, included: true },
    { label: copy.outputs.dutyPerUnit, value: calculation?.dutyPerUnit ?? 0, included: true },
    {
      label: copy.outputs.importTaxPerUnit,
      value: calculation?.importTaxPerUnit ?? 0,
      included: input.includeImportTaxAsCost,
    },
    { label: copy.outputs.brokerFeePerUnit, value: calculation?.brokerFeePerUnit ?? 0, included: true },
    { label: copy.outputs.otherImportFeesPerUnit, value: calculation?.otherImportFeesPerUnit ?? 0, included: true },
  ];

  function updateInput(key: LandedCostNumericField, value: string) {
    setSavedState((current) => ({
      ...current,
      input: {
        ...current.input,
        [key]: value,
      },
    }));
  }

  function updateDetail(
    key: "hsCode" | "supplierCountry" | "destinationCountry",
    value: string,
  ) {
    setSavedState((current) => ({
      ...current,
      details: {
        ...current.details,
        [key]: value,
      },
    }));
  }

  function updateFreightType(value: FreightType) {
    setSavedState((current) => ({
      ...current,
      details: { ...current.details, freightType: value },
    }));
  }

  function updateImportTaxTreatment(value: boolean) {
    setSavedState((current) => ({
      ...current,
      input: { ...current.input, includeImportTaxAsCost: value },
    }));
  }

  function updateCustomsValuationMethod(value: CustomsValuationMethod) {
    setSavedState((current) => ({
      ...current,
      input: { ...current.input, customsValuationMethod: value },
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

    const warning = getLandedCostPercentWarning(value);
    return warning ? copy.validation[warning] : undefined;
  }

  function numberFieldProps(key: LandedCostNumericField) {
    const path = `input.${key}`;
    const isPercentage = percentageInputKeys.has(key);

    return {
      value: input[key],
      onChange: (value: string) => updateInput(key, value),
      onBlur: isPercentage
        ? () => markPercentFieldBlurred(path)
        : undefined,
      error: fieldError(path),
      warning: isPercentage
        ? percentWarning(path, input[key])
        : undefined,
    };
  }

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-brand-700">{copy.hero.eyebrow}</p>
          <h1 className="mt-3 max-w-5xl text-3xl font-black text-ink-950 sm:text-4xl lg:text-5xl">{copy.hero.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink-500">{copy.hero.subtitle}</p>
          <div className="mt-6 max-w-xs rounded-lg border border-slate-200 bg-slate-50 p-4">
            <CurrencySelector messages={messages} showNotice />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[430px_1fr] lg:px-8">
          <div className="min-w-0 space-y-6">
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-lg font-bold text-amber-950">{copy.notice.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-amber-950">{copy.notice.body}</p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.product}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="landed-product-unit-cost"
                  label={copy.inputs.productUnitCost}
                  suffix={currency}
                  {...numberFieldProps("productUnitCost")}
                />
                <NumberField
                  id="landed-quantity"
                  label={copy.inputs.quantity}
                  suffix="#"
                  step="1"
                  {...numberFieldProps("quantity")}
                />
                <TextField
                  id="landed-hs-code"
                  label={copy.inputs.hsCode}
                  value={details.hsCode}
                  placeholder={copy.inputs.hsCodePlaceholder}
                  onChange={(value) => updateDetail("hsCode", value)}
                />
                <TextField
                  id="landed-supplier-country"
                  label={copy.inputs.supplierCountry}
                  value={details.supplierCountry}
                  onChange={(value) => updateDetail("supplierCountry", value)}
                />
                <TextField
                  id="landed-destination-country"
                  label={copy.inputs.destinationCountry}
                  value={details.destinationCountry}
                  onChange={(value) => updateDetail("destinationCountry", value)}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.logistics}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="landed-freight-cost"
                  label={copy.inputs.internationalFreightCost}
                  suffix={currency}
                  {...numberFieldProps("internationalFreightCost")}
                />
                <NumberField
                  id="landed-insurance-cost"
                  label={copy.inputs.insuranceCost}
                  suffix={currency}
                  {...numberFieldProps("insuranceCost")}
                />
                <SelectField
                  id="landed-freight-type"
                  label={copy.inputs.freightType}
                  value={details.freightType}
                  options={freightTypes.map((type) => ({ value: type, label: copy.freightTypes[type] }))}
                  onChange={(value) => updateFreightType(value as FreightType)}
                  error={fieldError("details.freightType")}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.import}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <span className="text-sm font-semibold text-ink-700">{copy.inputs.customsValuationMethod}</span>
                  <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                    {(["cif", "fob"] as const).map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => updateCustomsValuationMethod(method)}
                        className={joinClassNames(
                          "min-h-11 rounded-md px-3 text-sm font-bold uppercase transition",
                          input.customsValuationMethod === method
                            ? "bg-white text-brand-700 shadow-sm"
                            : "text-ink-600 hover:bg-white/70",
                        )}
                      >
                        {copy.customsValuationMethods[method]}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-ink-500">{copy.customsValuationNote}</p>
                  {fieldError("input.customsValuationMethod") ? (
                    <p className="mt-2 text-xs font-semibold text-rose-700">
                      {fieldError("input.customsValuationMethod")}
                    </p>
                  ) : null}
                </div>
                <NumberField
                  id="landed-duty-rate"
                  label={copy.inputs.customsDutyRate}
                  suffix="%"
                  {...numberFieldProps("customsDutyRate")}
                />
                <NumberField
                  id="landed-import-tax-rate"
                  label={copy.inputs.importTaxRate}
                  suffix="%"
                  {...numberFieldProps("importTaxRate")}
                />
                <div className="sm:col-span-2">
                  <span className="text-sm font-semibold text-ink-700">{copy.inputs.includeImportTaxAsCost}</span>
                  <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                    {[true, false].map((value) => (
                      <button
                        type="button"
                        key={String(value)}
                        onClick={() => updateImportTaxTreatment(value)}
                        className={joinClassNames(
                          "min-h-11 rounded-md px-3 text-sm font-bold transition",
                          input.includeImportTaxAsCost === value
                            ? "bg-white text-brand-700 shadow-sm"
                            : "text-ink-600 hover:bg-white/70",
                        )}
                      >
                        {value ? copy.toggle.yes : copy.toggle.no}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-ink-500">{copy.importTaxTreatmentNote}</p>
                </div>
                <NumberField
                  id="landed-broker-fee"
                  label={copy.inputs.customsBrokerFee}
                  suffix={currency}
                  {...numberFieldProps("customsBrokerFee")}
                />
                <NumberField
                  id="landed-other-import-fees"
                  label={copy.inputs.otherImportFees}
                  suffix={currency}
                  {...numberFieldProps("otherImportFees")}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.selling}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="landed-selling-price"
                  label={copy.inputs.sellingPricePerUnit}
                  suffix={currency}
                  {...numberFieldProps("sellingPricePerUnit")}
                />
                <NumberField
                  id="landed-platform-fee"
                  label={copy.inputs.platformFeePercent}
                  suffix="%"
                  {...numberFieldProps("platformFeePercent")}
                />
                <NumberField
                  id="landed-payment-fee"
                  label={copy.inputs.paymentFeePercent}
                  suffix="%"
                  {...numberFieldProps("paymentFeePercent")}
                />
                <NumberField
                  id="landed-fixed-payment-fee"
                  label={copy.inputs.fixedPaymentFee}
                  suffix={currency}
                  {...numberFieldProps("fixedPaymentFee")}
                />
                <NumberField
                  id="landed-ad-cost"
                  label={copy.inputs.adCostPerOrder}
                  suffix={currency}
                  {...numberFieldProps("adCostPerOrder")}
                />
                <NumberField
                  id="landed-refund-rate"
                  label={copy.inputs.refundRate}
                  suffix="%"
                  {...numberFieldProps("refundRate")}
                />
                <NumberField
                  id="landed-domestic-delivery"
                  label={copy.inputs.domesticDeliveryCostPerUnit}
                  suffix={currency}
                  {...numberFieldProps("domesticDeliveryCostPerUnit")}
                />
                <NumberField
                  id="landed-packaging"
                  label={copy.inputs.packagingCostPerUnit}
                  suffix={currency}
                  {...numberFieldProps("packagingCostPerUnit")}
                />
                <NumberField
                  id="landed-warehouse-prep"
                  label={copy.inputs.warehousePrepCostPerUnit}
                  suffix={currency}
                  {...numberFieldProps("warehousePrepCostPerUnit")}
                />
                <NumberField
                  id="landed-other-cost"
                  label={copy.inputs.otherCostPerUnit}
                  suffix={currency}
                  {...numberFieldProps("otherCostPerUnit")}
                />
                <NumberField
                  id="landed-target-margin"
                  label={copy.inputs.targetMarginPercent}
                  suffix="%"
                  {...numberFieldProps("targetMarginPercent")}
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
            {hasErrors && calculation ? (
              <section className="rounded-lg border border-rose-200 bg-rose-50 p-5">
                <h2 className="text-xl font-bold text-rose-950">{copy.sections.results}</h2>
                <div className="mt-4 space-y-2 text-sm font-semibold leading-6 text-rose-950">
                  {calculation.errors.quantityNonPositive ? <p>{copy.validation.quantityNonPositive}</p> : null}
                  {calculation.errors.targetMarginInvalid ? <p>{copy.validation.targetMarginInvalid}</p> : null}
                </div>
              </section>
            ) : null}
            {(calculationResponse?.warnings.length ?? 0) > 0 ? (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-xl font-bold text-amber-950">{copy.sections.warnings}</h2>
                <div className="mt-4 space-y-2 text-sm font-semibold leading-6 text-amber-950">
                  {calculationResponse?.warnings.includes("breakEvenDenominatorNonPositive") ? (
                    <p>{copy.validation.breakEvenDenominatorNonPositive}</p>
                  ) : null}
                  {calculationResponse?.warnings.includes("breakEvenDenominatorNearZero") ? (
                    <p>{copy.validation.breakEvenDenominatorNearZero}</p>
                  ) : null}
                  {calculationResponse?.warnings.includes("targetDenominatorNonPositive") ? (
                    <p>{copy.validation.targetDenominatorNonPositive}</p>
                  ) : null}
                </div>
              </section>
            ) : null}

            {calculation ? <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950">{copy.sections.results}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ResultBox
                  label={copy.outputs.totalProductCost}
                  value={formatMaybeMoney(calculation.totalProductCost, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.freightPerUnit}
                  value={formatMaybeMoney(calculation.freightPerUnit, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.insurancePerUnit}
                  value={formatMaybeMoney(calculation.insurancePerUnit, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.customsValuePerUnit}
                  value={formatMaybeMoney(calculation.customsValuePerUnit, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.dutyPerUnit}
                  value={formatMaybeMoney(calculation.dutyPerUnit, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.importTaxPerUnit}
                  value={formatMaybeMoney(calculation.importTaxPerUnit, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.brokerFeePerUnit}
                  value={formatMaybeMoney(calculation.brokerFeePerUnit, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.otherImportFeesPerUnit}
                  value={formatMaybeMoney(calculation.otherImportFeesPerUnit, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.landedCostPerUnit}
                  value={formatMaybeMoney(calculation.landedCostPerUnit, currency, locale, hidePerUnitResults)}
                  strong
                />
                <ResultBox
                  label={copy.outputs.sellingFeesPerUnit}
                  value={formatMaybeMoney(calculation.sellingFeesPerUnit, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.fixedCostPerUnit}
                  value={formatMaybeMoney(calculation.fixedCostPerUnit, currency, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.variableSellingRateCostPercent}
                  value={formatMaybePercent(calculation.variableSellingRateCostPercent, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.totalCostPerUnit}
                  value={formatMaybeMoney(calculation.totalCostPerUnit, currency, locale, hidePerUnitResults)}
                  strong
                />
                <ResultBox
                  label={copy.outputs.netProfitPerUnit}
                  value={formatMaybeMoney(calculation.netProfitPerUnit, currency, locale, hidePerUnitResults)}
                  strong
                />
                <ResultBox
                  label={copy.outputs.profitMargin}
                  value={formatMaybePercent(calculation.profitMargin, locale, hidePerUnitResults)}
                />
                <ResultBox
                  label={copy.outputs.breakEvenSellingPrice}
                  value={formatNullableMoney(calculation.breakEvenSellingPrice, currency, locale)}
                />
                <ResultBox
                  label={copy.outputs.suggestedPriceFor30PercentMargin}
                  value={formatNullableMoney(calculation.suggestedPriceFor30PercentMargin, currency, locale)}
                />
                <ResultBox
                  label={copy.outputs.suggestedPriceFor50PercentMargin}
                  value={formatNullableMoney(calculation.suggestedPriceFor50PercentMargin, currency, locale)}
                />
                <ResultBox
                  label={copy.outputs.suggestedPriceForTargetMargin}
                  value={formatNullableMoney(calculation.suggestedPriceForTargetMargin, currency, locale)}
                  strong
                />
              </div>
            </section> : null}

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="p-5">
                <h2 className="text-xl font-bold text-ink-950">{copy.sections.breakdown}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead className="bg-slate-100 text-xs font-bold uppercase text-ink-600">
                    <tr>
                      <th className="px-5 py-3">{copy.breakdown.cost}</th>
                      <th className="px-5 py-3 text-right">{copy.breakdown.amount}</th>
                      <th className="px-5 py-3 text-right">{copy.breakdown.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {landedCostRows.map((row) => (
                      <tr key={row.label}>
                        <td className="px-5 py-3 text-sm font-semibold text-ink-700">{row.label}</td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-ink-950">
                          {formatMaybeMoney(row.value, currency, locale, hidePerUnitResults)}
                        </td>
                        <td className="px-5 py-3 text-right text-xs font-bold text-ink-500">
                          {row.included ? copy.breakdown.included : copy.breakdown.excluded}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-brand-50">
                      <td className="px-5 py-4 text-sm font-black text-ink-950">{copy.outputs.landedCostPerUnit}</td>
                      <td className="px-5 py-4 text-right text-sm font-black text-brand-700">
                        {formatMaybeMoney(calculation?.landedCostPerUnit ?? 0, currency, locale, hidePerUnitResults)}
                      </td>
                      <td className="px-5 py-4 text-right text-xs font-bold text-brand-700">{copy.breakdown.included}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

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
            <RelatedTools locale={locale} messages={messages} excludeHref="/landed-cost-calculator" />
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
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  warning?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;
  const warningId = warning ? `${id}-warning` : undefined;
  const describedBy = [errorId, warningId].filter(Boolean).join(" ") || undefined;

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
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 border-0 px-3 text-sm text-ink-950 outline-none"
        />
        <span className="grid min-w-14 place-items-center border-l border-slate-200 bg-slate-50 px-2 text-xs font-bold text-ink-500">
          {suffix}
        </span>
      </span>
      {error ? (
        <span
          id={errorId}
          className="mt-1.5 block text-xs font-semibold text-rose-700"
        >
          {error}
        </span>
      ) : null}
      {warning ? (
        <span
          id={warningId}
          className="mt-1.5 block text-xs font-semibold leading-5 text-amber-700"
        >
          {warning}
        </span>
      ) : null}
    </label>
  );
}

function TextField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="mt-1.5 block text-xs font-semibold text-rose-700">
          {error}
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

function formatNullableMoney(value: number | null, currency: string, locale: Locale) {
  return value === null ? "N/A" : formatCurrency(value, currency, locale);
}

function formatMaybePercent(value: number | null, locale: Locale, shouldHide: boolean) {
  if (shouldHide || value === null) {
    return "N/A";
  }

  return formatPercent(value, locale);
}
