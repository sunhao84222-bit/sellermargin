// Next.js bundles Zod for its own validation. The project manifest is outside this batch's
// allowed edit scope, so this template uses that bundled runtime until Zod can be added directly.
// @ts-expect-error Next's bundled Zod runtime does not publish declarations at this internal path.
import { z } from "next/dist/compiled/zod";
import type { AdBreakEvenInput, AdTargetMode } from "@/lib/calculators";
import { defaultAdBreakEvenInputs } from "@/lib/defaultFees";

export const adBreakEvenNumericFields = [
  "sellingPrice",
  "productCost",
  "shippingCost",
  "packagingCost",
  "platformFeePercent",
  "paymentFeePercent",
  "fixedPaymentFee",
  "otherVariableCost",
  "targetProfitPerOrder",
  "targetProfitMarginPercent",
  "currentRoas",
  "currentCpa",
] as const;

export const adBreakEvenPercentFields = [
  "platformFeePercent",
  "paymentFeePercent",
  "targetProfitMarginPercent",
] as const;

export type AdBreakEvenNumericField = (typeof adBreakEvenNumericFields)[number];
export type AdBreakEvenPercentField = (typeof adBreakEvenPercentFields)[number];

export type RawAdBreakEvenInput = Record<AdBreakEvenNumericField, string> & {
  targetMode: AdTargetMode;
};

export type AdBreakEvenValidationMessage =
  | "required"
  | "invalidNumber"
  | "nonNegative"
  | "sellingPricePositive";

export type AdBreakEvenFieldErrors = Partial<
  Record<AdBreakEvenNumericField, AdBreakEvenValidationMessage>
>;

export type AdBreakEvenPercentWarning = "percentLikelyFraction" | "percentVeryHigh";

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

const requiredNumber = z
  .number({
    required_error: "required",
    invalid_type_error: "invalidNumber",
  })
  .nonnegative("nonNegative");

const requiredNumberText = z.preprocess(preprocessNumericText, requiredNumber);

const positiveSellingPriceText = z.preprocess(
  preprocessNumericText,
  requiredNumber.refine((value: number) => value > 0, {
    message: "sellingPricePositive",
  }),
);

const optionalNumberText = z.preprocess(
  preprocessNumericText,
  z
    .number({ invalid_type_error: "invalidNumber" })
    .nonnegative("nonNegative")
    .optional(),
);

const commonShape = {
  sellingPrice: positiveSellingPriceText,
  productCost: requiredNumberText,
  shippingCost: requiredNumberText,
  packagingCost: requiredNumberText,
  platformFeePercent: requiredNumberText,
  paymentFeePercent: requiredNumberText,
  fixedPaymentFee: requiredNumberText,
  otherVariableCost: requiredNumberText,
  currentRoas: optionalNumberText,
  currentCpa: optionalNumberText,
};

export const adBreakEvenInputSchema = z.discriminatedUnion("targetMode", [
  z.object({
    ...commonShape,
    targetMode: z.literal("profitAmount"),
    targetProfitPerOrder: requiredNumberText,
    targetProfitMarginPercent: z.string(),
  }),
  z.object({
    ...commonShape,
    targetMode: z.literal("marginPercent"),
    targetProfitPerOrder: z.string(),
    targetProfitMarginPercent: requiredNumberText,
  }),
]);

type AdBreakEvenValidationResult =
  | {
      success: true;
      data: AdBreakEvenInput;
      fieldErrors: AdBreakEvenFieldErrors;
    }
  | {
      success: false;
      data: null;
      fieldErrors: AdBreakEvenFieldErrors;
    };

export function validateAdBreakEvenInput(
  input: RawAdBreakEvenInput,
): AdBreakEvenValidationResult {
  const parsed = adBreakEvenInputSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: AdBreakEvenFieldErrors = {};

    for (const issue of parsed.error.issues as Array<{
      path: Array<string | number>;
      message: string;
    }>) {
      const field = issue.path[0];
      if (
        typeof field === "string" &&
        adBreakEvenNumericFields.includes(field as AdBreakEvenNumericField) &&
        !fieldErrors[field as AdBreakEvenNumericField]
      ) {
        fieldErrors[field as AdBreakEvenNumericField] =
          issue.message as AdBreakEvenValidationMessage;
      }
    }

    return { success: false, data: null, fieldErrors };
  }

  const data = parsed.data as Record<string, number | string | undefined>;
  const targetMode = data.targetMode as AdTargetMode;

  return {
    success: true,
    data: {
      sellingPrice: data.sellingPrice as number,
      productCost: data.productCost as number,
      shippingCost: data.shippingCost as number,
      packagingCost: data.packagingCost as number,
      platformFeePercent: data.platformFeePercent as number,
      paymentFeePercent: data.paymentFeePercent as number,
      fixedPaymentFee: data.fixedPaymentFee as number,
      otherVariableCost: data.otherVariableCost as number,
      targetMode,
      targetProfitPerOrder:
        targetMode === "profitAmount" ? (data.targetProfitPerOrder as number) : 0,
      targetProfitMarginPercent:
        targetMode === "marginPercent"
          ? (data.targetProfitMarginPercent as number)
          : 0,
      currentRoas: (data.currentRoas as number | undefined) ?? 0,
      currentCpa: (data.currentCpa as number | undefined) ?? 0,
    },
    fieldErrors: {},
  };
}

export function getAdBreakEvenPercentWarning(
  rawValue: string,
): AdBreakEvenPercentWarning | null {
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

  if (parsed < 1) {
    return "percentLikelyFraction";
  }

  return null;
}

export function createDefaultRawAdBreakEvenInput(): RawAdBreakEvenInput {
  return {
    sellingPrice: String(defaultAdBreakEvenInputs.sellingPrice),
    productCost: String(defaultAdBreakEvenInputs.productCost),
    shippingCost: String(defaultAdBreakEvenInputs.shippingCost),
    packagingCost: String(defaultAdBreakEvenInputs.packagingCost),
    platformFeePercent: String(defaultAdBreakEvenInputs.platformFeePercent),
    paymentFeePercent: String(defaultAdBreakEvenInputs.paymentFeePercent),
    fixedPaymentFee: String(defaultAdBreakEvenInputs.fixedPaymentFee),
    otherVariableCost: String(defaultAdBreakEvenInputs.otherVariableCost),
    targetMode: defaultAdBreakEvenInputs.targetMode,
    targetProfitPerOrder: String(defaultAdBreakEvenInputs.targetProfitPerOrder),
    targetProfitMarginPercent: String(
      defaultAdBreakEvenInputs.targetProfitMarginPercent,
    ),
    currentRoas: String(defaultAdBreakEvenInputs.currentRoas),
    currentCpa: String(defaultAdBreakEvenInputs.currentCpa),
  };
}

export function normalizeSavedAdBreakEvenInput(
  value: unknown,
): RawAdBreakEvenInput {
  const defaults = createDefaultRawAdBreakEvenInput();
  if (!value || typeof value !== "object") {
    return defaults;
  }

  const saved = value as {
    input?: Partial<Record<AdBreakEvenNumericField, unknown>> & {
      targetMode?: unknown;
    };
  } & Partial<Record<AdBreakEvenNumericField, unknown>> & {
      targetMode?: unknown;
    };
  const candidate =
    saved.input && typeof saved.input === "object" ? saved.input : saved;
  const normalized = { ...defaults };

  for (const field of adBreakEvenNumericFields) {
    const fieldValue = candidate[field];
    if (typeof fieldValue === "string") {
      normalized[field] = fieldValue;
    } else if (typeof fieldValue === "number" && Number.isFinite(fieldValue)) {
      normalized[field] = String(fieldValue);
    }
  }

  normalized.targetMode =
    candidate.targetMode === "marginPercent" ? "marginPercent" : "profitAmount";

  return normalized;
}
