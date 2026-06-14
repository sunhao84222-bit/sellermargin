import { z } from "zod";
import type {
  FeeAssumptionsByPlatform,
  ProductEconomicsInput,
} from "@/lib/calculators";
import {
  defaultSelectedPlatforms,
  editableDefaultFees,
  platformFeeFieldOrder,
  platformIds,
  type FeeFieldKey,
  type PlatformId,
} from "@/lib/defaultFees";

export const multiPlatformInputFields = [
  "sellingPrice",
  "productCost",
  "shippingCost",
  "packagingCost",
  "adCostPerOrder",
  "refundRate",
  "discountRate",
  "otherVariableCost",
] as const;

export const multiPlatformPercentInputFields = [
  "refundRate",
  "discountRate",
] as const;

export const multiPlatformPercentFeeFields = [
  "paymentFeePercent",
  "thirdPartyTransactionFeePercent",
  "marketplaceTransactionFeePercent",
  "finalValueFeePercent",
  "promotedListingAdFeePercent",
  "referralFeePercent",
  "affiliateCommissionPercent",
] as const;

export type MultiPlatformInputField =
  (typeof multiPlatformInputFields)[number];
export type MultiPlatformPercentFeeField =
  (typeof multiPlatformPercentFeeFields)[number];
export type MultiPlatformValidationMessage =
  | "required"
  | "invalidNumber"
  | "nonNegative"
  | "positive"
  | "selectAtLeastOne";
export type MultiPlatformPercentWarning =
  | "percentLikelyFraction"
  | "percentVeryHigh";

export type RawMultiPlatformInput = Record<MultiPlatformInputField, string>;
export type RawPlatformFeeAssumptions = Record<
  PlatformId,
  Partial<Record<FeeFieldKey, string>>
>;
export type RawMultiPlatformState = {
  input: RawMultiPlatformInput;
  selectedPlatforms: PlatformId[];
  feeAssumptions: RawPlatformFeeAssumptions;
};
export type MultiPlatformFieldErrors = Partial<
  Record<string, MultiPlatformValidationMessage>
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

const requiredPositiveNumberText = z.preprocess(
  preprocessNumericText,
  requiredNumber.refine((value) => value > 0, { message: "positive" }),
);

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

const shopifyFeeSchema = z.object({
  paymentFeePercent: optionalNonNegativeNumberText,
  fixedPaymentFee: optionalNonNegativeNumberText,
  thirdPartyTransactionFeePercent: optionalNonNegativeNumberText,
  otherFixedPlatformFee: optionalNonNegativeNumberText,
});

const etsyFeeSchema = z.object({
  marketplaceTransactionFeePercent: optionalNonNegativeNumberText,
  paymentFeePercent: optionalNonNegativeNumberText,
  fixedPaymentFee: optionalNonNegativeNumberText,
  listingFee: optionalNonNegativeNumberText,
  otherFixedPlatformFee: optionalNonNegativeNumberText,
});

const ebayFeeSchema = z.object({
  finalValueFeePercent: optionalNonNegativeNumberText,
  fixedOrderFee: optionalNonNegativeNumberText,
  promotedListingAdFeePercent: optionalNonNegativeNumberText,
  otherFixedPlatformFee: optionalNonNegativeNumberText,
});

const amazonFeeSchema = z.object({
  referralFeePercent: optionalNonNegativeNumberText,
  fulfillmentFeePerUnit: optionalNonNegativeNumberText,
  storageOrOtherFeePerUnit: optionalNonNegativeNumberText,
  otherFixedPlatformFee: optionalNonNegativeNumberText,
});

const tiktokFeeSchema = z.object({
  referralFeePercent: optionalNonNegativeNumberText,
  paymentFeePercent: optionalNonNegativeNumberText,
  fixedPaymentFee: optionalNonNegativeNumberText,
  affiliateCommissionPercent: optionalNonNegativeNumberText,
  otherFixedPlatformFee: optionalNonNegativeNumberText,
});

export const multiPlatformStateSchema = z.object({
  input: z.object({
    sellingPrice: requiredPositiveNumberText,
    productCost: requiredNonNegativeNumberText,
    shippingCost: optionalNonNegativeNumberText,
    packagingCost: optionalNonNegativeNumberText,
    adCostPerOrder: optionalNonNegativeNumberText,
    refundRate: optionalNonNegativeNumberText,
    discountRate: optionalNonNegativeNumberText,
    otherVariableCost: optionalNonNegativeNumberText,
  }),
  selectedPlatforms: z
    .array(z.enum(platformIds))
    .min(1, "selectAtLeastOne"),
  feeAssumptions: z.object({
    shopify: shopifyFeeSchema,
    etsy: etsyFeeSchema,
    ebay: ebayFeeSchema,
    amazon: amazonFeeSchema,
    tiktok: tiktokFeeSchema,
  }),
});

const defaultInput: ProductEconomicsInput = {
  sellingPrice: 49.99,
  productCost: 16,
  shippingCost: 5,
  packagingCost: 1,
  adCostPerOrder: 8,
  refundRate: 4,
  discountRate: 10,
  otherVariableCost: 1.5,
};

export function createDefaultRawMultiPlatformState(): RawMultiPlatformState {
  const feeAssumptions = {} as RawPlatformFeeAssumptions;

  for (const platform of platformIds) {
    feeAssumptions[platform] = {};
    for (const field of platformFeeFieldOrder[platform]) {
      feeAssumptions[platform][field] = String(
        editableDefaultFees[platform].fields[field] ?? 0,
      );
    }
  }

  return {
    input: Object.fromEntries(
      multiPlatformInputFields.map((field) => [
        field,
        String(defaultInput[field]),
      ]),
    ) as RawMultiPlatformInput,
    selectedPlatforms: [...defaultSelectedPlatforms],
    feeAssumptions,
  };
}

export function normalizeSavedMultiPlatformState(
  value: unknown,
): RawMultiPlatformState {
  const defaults = createDefaultRawMultiPlatformState();
  if (!value || typeof value !== "object") {
    return defaults;
  }

  const saved = value as {
    input?: Partial<Record<MultiPlatformInputField, unknown>>;
    selectedPlatforms?: unknown;
    feeAssumptions?: Partial<
      Record<PlatformId, Partial<Record<FeeFieldKey, unknown>>>
    >;
  };
  const normalized = structuredClone(defaults);

  for (const field of multiPlatformInputFields) {
    normalized.input[field] = normalizeRawNumericValue(
      saved.input?.[field],
      defaults.input[field],
    );
  }

  if (Array.isArray(saved.selectedPlatforms)) {
    normalized.selectedPlatforms = [
      ...new Set(
        saved.selectedPlatforms.filter(
          (platform): platform is PlatformId =>
            typeof platform === "string" &&
            platformIds.includes(platform as PlatformId),
        ),
      ),
    ];
  }

  for (const platform of platformIds) {
    for (const field of platformFeeFieldOrder[platform]) {
      normalized.feeAssumptions[platform][field] = normalizeRawNumericValue(
        saved.feeAssumptions?.[platform]?.[field],
        defaults.feeAssumptions[platform][field] ?? "0",
      );
    }
  }

  return normalized;
}

type MultiPlatformValidationResult =
  | {
      success: true;
      data: {
        input: ProductEconomicsInput;
        selectedPlatforms: PlatformId[];
        feeAssumptions: FeeAssumptionsByPlatform;
      };
      fieldErrors: MultiPlatformFieldErrors;
    }
  | {
      success: false;
      data: null;
      fieldErrors: MultiPlatformFieldErrors;
    };

export function validateMultiPlatformState(
  input: RawMultiPlatformState,
): MultiPlatformValidationResult {
  const parsed = multiPlatformStateSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: MultiPlatformFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] =
          issue.message as MultiPlatformValidationMessage;
      }
    }
    return { success: false, data: null, fieldErrors };
  }

  return {
    success: true,
    data: {
      input: parsed.data.input,
      selectedPlatforms: parsed.data.selectedPlatforms,
      feeAssumptions: parsed.data.feeAssumptions,
    },
    fieldErrors: {},
  };
}

export function getMultiPlatformPercentWarning(
  rawValue: string,
): MultiPlatformPercentWarning | null {
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

export function multiPlatformFeePath(
  platform: PlatformId,
  field: FeeFieldKey,
) {
  return `feeAssumptions.${platform}.${field}`;
}

function normalizeRawNumericValue(value: unknown, fallback: string) {
  if (typeof value === "string") {
    return value;
  }

  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : fallback;
}
