import { z } from "zod";
import type { LandedCostInput } from "@/lib/calculators";
import { defaultLandedCostInputs } from "@/lib/defaultFees";

export const landedCostNumericFields = [
  "productUnitCost",
  "quantity",
  "internationalFreightCost",
  "insuranceCost",
  "customsDutyRate",
  "importTaxRate",
  "customsBrokerFee",
  "otherImportFees",
  "sellingPricePerUnit",
  "platformFeePercent",
  "paymentFeePercent",
  "fixedPaymentFee",
  "adCostPerOrder",
  "refundRate",
  "domesticDeliveryCostPerUnit",
  "packagingCostPerUnit",
  "warehousePrepCostPerUnit",
  "otherCostPerUnit",
  "targetMarginPercent",
] as const;

export const landedCostPercentFields = [
  "customsDutyRate",
  "importTaxRate",
  "platformFeePercent",
  "paymentFeePercent",
  "refundRate",
  "targetMarginPercent",
] as const;

export const freightTypes = ["sea", "air", "express", "other"] as const;
export const customsValuationMethods = ["cif", "fob"] as const;

export type LandedCostNumericField =
  (typeof landedCostNumericFields)[number];
export type LandedCostPercentField =
  (typeof landedCostPercentFields)[number];
export type FreightType = (typeof freightTypes)[number];
export type CustomsValuationMethod =
  (typeof customsValuationMethods)[number];

export type LandedCostDetails = {
  hsCode: string;
  supplierCountry: string;
  destinationCountry: string;
  freightType: FreightType;
};

export type RawLandedCostInput = Record<LandedCostNumericField, string> & {
  customsValuationMethod: CustomsValuationMethod;
  includeImportTaxAsCost: boolean;
};

export type RawLandedCostState = {
  input: RawLandedCostInput;
  details: LandedCostDetails;
};

export type LandedCostValidationMessage =
  | "required"
  | "invalidNumber"
  | "nonNegative"
  | "positiveInteger"
  | "targetMarginInvalid"
  | "invalidCustomsValuationMethod"
  | "invalidFreightType";

export type LandedCostPercentWarning =
  | "percentLikelyFraction"
  | "percentVeryHigh";

export type LandedCostFieldErrors = Partial<
  Record<string, LandedCostValidationMessage>
>;

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

const optionalNonNegativeNumberText = z
  .preprocess(
    preprocessNumericText,
    z
      .number({ invalid_type_error: "invalidNumber" })
      .nonnegative("nonNegative")
      .optional(),
  )
  .transform((value) => value ?? 0);

const requiredPositiveIntegerText = z.preprocess(
  preprocessNumericText,
  requiredNumber
    .int("positiveInteger")
    .refine((value) => value > 0, { message: "positiveInteger" }),
);

const requiredTargetMarginText = z.preprocess(
  preprocessNumericText,
  requiredNumber
    .nonnegative("nonNegative")
    .refine((value) => value < 100, {
      message: "targetMarginInvalid",
    }),
);

export const landedCostStateSchema = z.object({
  input: z.object({
    productUnitCost: requiredNonNegativeNumberText,
    quantity: requiredPositiveIntegerText,
    internationalFreightCost: optionalNonNegativeNumberText,
    insuranceCost: optionalNonNegativeNumberText,
    customsValuationMethod: z.custom<CustomsValuationMethod>(
      (value) =>
        typeof value === "string" &&
        customsValuationMethods.includes(value as CustomsValuationMethod),
      { message: "invalidCustomsValuationMethod" },
    ),
    customsDutyRate: optionalNonNegativeNumberText,
    importTaxRate: optionalNonNegativeNumberText,
    includeImportTaxAsCost: z.boolean({
      invalid_type_error: "invalidNumber",
    }),
    customsBrokerFee: optionalNonNegativeNumberText,
    otherImportFees: optionalNonNegativeNumberText,
    sellingPricePerUnit: requiredNonNegativeNumberText,
    platformFeePercent: optionalNonNegativeNumberText,
    paymentFeePercent: optionalNonNegativeNumberText,
    fixedPaymentFee: optionalNonNegativeNumberText,
    adCostPerOrder: optionalNonNegativeNumberText,
    refundRate: optionalNonNegativeNumberText,
    domesticDeliveryCostPerUnit: optionalNonNegativeNumberText,
    packagingCostPerUnit: optionalNonNegativeNumberText,
    warehousePrepCostPerUnit: optionalNonNegativeNumberText,
    otherCostPerUnit: optionalNonNegativeNumberText,
    targetMarginPercent: requiredTargetMarginText,
  }),
  details: z.object({
    hsCode: z.string(),
    supplierCountry: z.string(),
    destinationCountry: z.string(),
    freightType: z.custom<FreightType>(
      (value) =>
        typeof value === "string" &&
        freightTypes.includes(value as FreightType),
      { message: "invalidFreightType" },
    ),
  }),
});

export function createDefaultRawLandedCostState(): RawLandedCostState {
  return {
    input: {
      productUnitCost: String(defaultLandedCostInputs.productUnitCost),
      quantity: String(defaultLandedCostInputs.quantity),
      internationalFreightCost: String(
        defaultLandedCostInputs.internationalFreightCost,
      ),
      insuranceCost: String(defaultLandedCostInputs.insuranceCost),
      customsValuationMethod: defaultLandedCostInputs.customsValuationMethod,
      customsDutyRate: String(defaultLandedCostInputs.customsDutyRate),
      importTaxRate: String(defaultLandedCostInputs.importTaxRate),
      includeImportTaxAsCost: defaultLandedCostInputs.includeImportTaxAsCost,
      customsBrokerFee: String(defaultLandedCostInputs.customsBrokerFee),
      otherImportFees: String(defaultLandedCostInputs.otherImportFees),
      sellingPricePerUnit: String(defaultLandedCostInputs.sellingPricePerUnit),
      platformFeePercent: String(defaultLandedCostInputs.platformFeePercent),
      paymentFeePercent: String(defaultLandedCostInputs.paymentFeePercent),
      fixedPaymentFee: String(defaultLandedCostInputs.fixedPaymentFee),
      adCostPerOrder: String(defaultLandedCostInputs.adCostPerOrder),
      refundRate: String(defaultLandedCostInputs.refundRate),
      domesticDeliveryCostPerUnit: String(
        defaultLandedCostInputs.domesticDeliveryCostPerUnit,
      ),
      packagingCostPerUnit: String(
        defaultLandedCostInputs.packagingCostPerUnit,
      ),
      warehousePrepCostPerUnit: String(
        defaultLandedCostInputs.warehousePrepCostPerUnit,
      ),
      otherCostPerUnit: String(defaultLandedCostInputs.otherCostPerUnit),
      targetMarginPercent: String(defaultLandedCostInputs.targetMarginPercent),
    },
    details: {
      hsCode: "",
      supplierCountry: "",
      destinationCountry: "",
      freightType: "sea",
    },
  };
}

export function normalizeSavedLandedCostState(
  value: unknown,
): RawLandedCostState {
  const defaults = createDefaultRawLandedCostState();
  if (!value || typeof value !== "object") {
    return defaults;
  }

  const saved = value as {
    input?: Partial<Record<LandedCostNumericField, unknown>> & {
      customsValuationMethod?: unknown;
      includeImportTaxAsCost?: unknown;
    };
    details?: {
      hsCode?: unknown;
      supplierCountry?: unknown;
      destinationCountry?: unknown;
      freightType?: unknown;
    };
  };
  const normalized = structuredClone(defaults);

  for (const field of landedCostNumericFields) {
    normalized.input[field] = normalizeRawNumericValue(
      saved.input?.[field],
      defaults.input[field],
    );
  }

  normalized.input.customsValuationMethod =
    saved.input?.customsValuationMethod === "fob" ? "fob" : "cif";
  normalized.input.includeImportTaxAsCost =
    typeof saved.input?.includeImportTaxAsCost === "boolean"
      ? saved.input.includeImportTaxAsCost
      : defaults.input.includeImportTaxAsCost;

  normalized.details.hsCode =
    typeof saved.details?.hsCode === "string"
      ? saved.details.hsCode
      : defaults.details.hsCode;
  normalized.details.supplierCountry =
    typeof saved.details?.supplierCountry === "string"
      ? saved.details.supplierCountry
      : defaults.details.supplierCountry;
  normalized.details.destinationCountry =
    typeof saved.details?.destinationCountry === "string"
      ? saved.details.destinationCountry
      : defaults.details.destinationCountry;
  normalized.details.freightType = freightTypes.includes(
    saved.details?.freightType as FreightType,
  )
    ? (saved.details?.freightType as FreightType)
    : defaults.details.freightType;

  return normalized;
}

type LandedCostValidationResult =
  | {
      success: true;
      data: {
        input: LandedCostInput;
        details: LandedCostDetails;
      };
      fieldErrors: LandedCostFieldErrors;
    }
  | {
      success: false;
      data: null;
      fieldErrors: LandedCostFieldErrors;
    };

export function validateLandedCostState(
  state: RawLandedCostState,
): LandedCostValidationResult {
  const parsed = landedCostStateSchema.safeParse(state);

  if (!parsed.success) {
    const fieldErrors: LandedCostFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] =
          issue.message as LandedCostValidationMessage;
      }
    }
    return { success: false, data: null, fieldErrors };
  }

  return {
    success: true,
    data: {
      input: parsed.data.input,
      details: parsed.data.details,
    },
    fieldErrors: {},
  };
}

export function getLandedCostPercentWarning(
  rawValue: string,
): LandedCostPercentWarning | null {
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
