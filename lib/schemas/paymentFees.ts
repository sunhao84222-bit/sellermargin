import type {
  PaymentFeeInput,
  PaymentProviderFeeAssumptions,
} from "@/lib/calculators";
import {
  defaultPaymentCalculatorInputs,
  editablePaymentProviderFees,
  paymentProviderIds,
  type PaymentFeeAssumption,
  type PaymentProviderId,
} from "@/lib/defaultFees";
import {
  z,
} from "zod";

export type PaymentValidationMessage =
  | "required"
  | "invalidNumber"
  | "nonNegative"
  | "positive"
  | "positiveInteger";

export type PaymentPercentWarning =
  | "percentLikelyFraction"
  | "percentVeryHigh";

export const paymentInputFields = [
  "transactionAmount",
  "numberOfTransactions",
  "optionalExtraFeePercent",
  "refundRate",
  "chargebackRate",
] as const;

export const paymentProviderFeeFields = [
  "percentageFee",
  "fixedFee",
  "internationalCardSurchargePercent",
  "currencyConversionFeePercent",
  "refundRetainedPercentageFee",
  "refundNonRefundableFixedFee",
  "chargebackFixedFee",
] as const;

export const paymentPercentInputFields = [
  "optionalExtraFeePercent",
  "refundRate",
  "chargebackRate",
] as const;

export const paymentPercentProviderFeeFields = [
  "percentageFee",
  "internationalCardSurchargePercent",
  "currencyConversionFeePercent",
  "refundRetainedPercentageFee",
] as const;

export type PaymentInputField = (typeof paymentInputFields)[number];
export type PaymentProviderFeeField =
  (typeof paymentProviderFeeFields)[number];

export type RawPaymentFeeInput = Record<PaymentInputField, string>;
export type RawPaymentFeeAssumption = Record<PaymentProviderFeeField, string>;
export type RawPaymentProviderFeeAssumptions = Record<
  PaymentProviderId,
  RawPaymentFeeAssumption
>;
export type RawPaymentFeeState = {
  input: RawPaymentFeeInput;
  feeAssumptions: RawPaymentProviderFeeAssumptions;
};

export type PaymentFieldErrors = Partial<
  Record<string, PaymentValidationMessage>
>;

type PaymentFeeValidationResult =
  | {
      success: true;
      data: {
        input: PaymentFeeInput;
        feeAssumptions: PaymentProviderFeeAssumptions;
      };
      fieldErrors: PaymentFieldErrors;
    }
  | {
      success: false;
      data: null;
      fieldErrors: PaymentFieldErrors;
    };

function preprocessNumericText(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : value;
}

const requiredNumber = z.number({
  required_error: "required",
  invalid_type_error: "invalidNumber",
});

const requiredNonNegativeNumberText = z.preprocess(
  preprocessNumericText,
  requiredNumber.nonnegative("nonNegative"),
);

const requiredPositiveNumberText = z.preprocess(
  preprocessNumericText,
  requiredNumber.refine((value) => value > 0, { message: "positive" }),
);

const requiredPositiveIntegerText = z.preprocess(
  preprocessNumericText,
  requiredNumber
    .int("positiveInteger")
    .refine((value) => value > 0, { message: "positiveInteger" }),
);

const optionalNonNegativeNumberText = z.preprocess(
  preprocessNumericText,
  z
    .number({ invalid_type_error: "invalidNumber" })
    .nonnegative("nonNegative")
    .optional(),
);

const feeAssumptionSchema = z.object({
  percentageFee: requiredNonNegativeNumberText,
  fixedFee: requiredNonNegativeNumberText,
  internationalCardSurchargePercent: optionalNonNegativeNumberText,
  currencyConversionFeePercent: optionalNonNegativeNumberText,
  refundRetainedPercentageFee: optionalNonNegativeNumberText,
  refundNonRefundableFixedFee: optionalNonNegativeNumberText,
  chargebackFixedFee: optionalNonNegativeNumberText,
});

export const paymentFeeStateSchema = z.object({
  input: z.object({
    transactionAmount: requiredPositiveNumberText,
    numberOfTransactions: requiredPositiveIntegerText,
    optionalExtraFeePercent: optionalNonNegativeNumberText,
    refundRate: optionalNonNegativeNumberText,
    chargebackRate: optionalNonNegativeNumberText,
  }),
  feeAssumptions: z.object({
    stripe: feeAssumptionSchema,
    paypal: feeAssumptionSchema,
    shopifyPayments: feeAssumptionSchema,
  }),
});

export function createDefaultRawPaymentFeeState(): RawPaymentFeeState {
  const feeAssumptions = {} as RawPaymentProviderFeeAssumptions;

  for (const provider of paymentProviderIds) {
    const fields = editablePaymentProviderFees[provider].fields;
    feeAssumptions[provider] = {
      percentageFee: String(fields.percentageFee),
      fixedFee: String(fields.fixedFee),
      internationalCardSurchargePercent: String(
        fields.internationalCardSurchargePercent,
      ),
      currencyConversionFeePercent: String(fields.currencyConversionFeePercent),
      refundRetainedPercentageFee: String(fields.refundRetainedPercentageFee),
      refundNonRefundableFixedFee: String(fields.refundNonRefundableFixedFee),
      chargebackFixedFee: String(fields.chargebackFixedFee),
    };
  }

  return {
    input: {
      transactionAmount: String(defaultPaymentCalculatorInputs.transactionAmount),
      numberOfTransactions: String(
        defaultPaymentCalculatorInputs.numberOfTransactions,
      ),
      optionalExtraFeePercent: String(
        defaultPaymentCalculatorInputs.optionalExtraFeePercent,
      ),
      refundRate: String(defaultPaymentCalculatorInputs.refundRate),
      chargebackRate: String(defaultPaymentCalculatorInputs.chargebackRate),
    },
    feeAssumptions,
  };
}

export function normalizeSavedPaymentFeeState(
  value: unknown,
): RawPaymentFeeState {
  const defaults = createDefaultRawPaymentFeeState();
  if (!value || typeof value !== "object") {
    return defaults;
  }

  const saved = value as {
    input?: Partial<Record<PaymentInputField, unknown>>;
    feeAssumptions?: Partial<
      Record<
        PaymentProviderId,
        Partial<Record<PaymentProviderFeeField, unknown>>
      >
    >;
  };
  const normalized = structuredClone(defaults);

  for (const field of paymentInputFields) {
    normalized.input[field] = normalizeRawNumericValue(
      saved.input?.[field],
      defaults.input[field],
    );
  }

  for (const provider of paymentProviderIds) {
    for (const field of paymentProviderFeeFields) {
      normalized.feeAssumptions[provider][field] = normalizeRawNumericValue(
        saved.feeAssumptions?.[provider]?.[field],
        defaults.feeAssumptions[provider][field],
      );
    }
  }

  return normalized;
}

export function validatePaymentFeeState(
  input: RawPaymentFeeState,
): PaymentFeeValidationResult {
  const parsed = paymentFeeStateSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: PaymentFieldErrors = {};
    for (const issue of parsed.error.issues as Array<{
      path: Array<string | number>;
      message: string;
    }>) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message as PaymentValidationMessage;
      }
    }
    return {
      success: false as const,
      data: null,
      fieldErrors,
    };
  }

  const parsedData = parsed.data;
  const feeAssumptions = {} as PaymentProviderFeeAssumptions;

  for (const provider of paymentProviderIds) {
    const fields = parsedData.feeAssumptions[provider];
    feeAssumptions[provider] = {
      percentageFee: fields.percentageFee,
      fixedFee: fields.fixedFee,
      internationalCardSurchargePercent:
        fields.internationalCardSurchargePercent ?? 0,
      currencyConversionFeePercent: fields.currencyConversionFeePercent ?? 0,
      refundRetainedPercentageFee: fields.refundRetainedPercentageFee ?? 0,
      refundNonRefundableFixedFee: fields.refundNonRefundableFixedFee ?? 0,
      chargebackFixedFee: fields.chargebackFixedFee ?? 0,
    };
  }

  const data: {
    input: PaymentFeeInput;
    feeAssumptions: PaymentProviderFeeAssumptions;
  } = {
    input: {
      transactionAmount: parsedData.input.transactionAmount,
      numberOfTransactions: parsedData.input.numberOfTransactions,
      optionalExtraFeePercent: parsedData.input.optionalExtraFeePercent ?? 0,
      refundRate: parsedData.input.refundRate ?? 0,
      chargebackRate: parsedData.input.chargebackRate ?? 0,
    },
    feeAssumptions,
  };
  return { success: true, data, fieldErrors: {} };
}

export function paymentFeePath(
  provider: PaymentProviderId,
  field: keyof PaymentFeeAssumption,
) {
  return `feeAssumptions.${provider}.${field}`;
}

export function getPaymentPercentWarning(
  rawValue: string,
): PaymentPercentWarning | null {
  const trimmed = rawValue.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  if (parsed >= 1000) {
    return "percentVeryHigh";
  }

  return parsed < 1 ? "percentLikelyFraction" : null;
}

function normalizeRawNumericValue(value: unknown, fallback: string) {
  if (typeof value === "string") {
    return value;
  }

  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : fallback;
}
