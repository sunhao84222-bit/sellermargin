export const platformIds = ["shopify", "etsy", "ebay", "amazon", "tiktok"] as const;
export const paymentProviderIds = ["stripe", "paypal", "shopifyPayments"] as const;

export type PlatformId = (typeof platformIds)[number];
export type PaymentProviderId = (typeof paymentProviderIds)[number];

export const defaultSelectedPlatforms: PlatformId[] = ["shopify", "etsy", "amazon"];

export type FeeFieldKey =
  | "paymentFeePercent"
  | "fixedPaymentFee"
  | "otherFixedPlatformFee"
  | "thirdPartyTransactionFeePercent"
  | "marketplaceTransactionFeePercent"
  | "listingFee"
  | "finalValueFeePercent"
  | "fixedOrderFee"
  | "promotedListingAdFeePercent"
  | "referralFeePercent"
  | "affiliateCommissionPercent"
  | "fulfillmentFeePerUnit"
  | "storageOrOtherFeePerUnit";

export type PlatformFeeDefaults = {
  platform: PlatformId;
  fields: Partial<Record<FeeFieldKey, number>>;
};

export type PaymentFeeAssumption = {
  percentageFee: number;
  fixedFee: number;
  internationalCardSurchargePercent: number;
  currencyConversionFeePercent: number;
  refundRetainedPercentageFee: number;
  refundNonRefundableFixedFee: number;
  chargebackFixedFee: number;
};

export type PaymentProviderFeeDefaults = {
  provider: PaymentProviderId;
  fields: PaymentFeeAssumption;
};

export type PaymentCalculatorDefaults = {
  transactionAmount: number;
  numberOfTransactions: number;
  currency: string;
  optionalExtraFeePercent: number;
  refundRate: number;
  chargebackRate: number;
};

// Shared editable starting points for calculator scenarios.
export const defaultAdBreakEvenInputs = {
  sellingPrice: 49.99,
  productCost: 16,
  shippingCost: 5,
  packagingCost: 1,
  platformFeePercent: 10,
  paymentFeePercent: 2.9,
  fixedPaymentFee: 0.3,
  otherVariableCost: 1.5,
  targetMode: "profitAmount" as const,
  targetProfitPerOrder: 8,
  targetProfitMarginPercent: 15,
  currentRoas: 0,
  currentCpa: 0,
};

export const defaultLandedCostInputs = {
  productUnitCost: 10,
  quantity: 100,
  internationalFreightCost: 500,
  insuranceCost: 100,
  customsValuationMethod: "cif" as const,
  customsDutyRate: 5,
  importTaxRate: 10,
  includeImportTaxAsCost: true,
  customsBrokerFee: 100,
  otherImportFees: 50,
  sellingPricePerUnit: 35,
  platformFeePercent: 10,
  paymentFeePercent: 2.9,
  fixedPaymentFee: 0.3,
  adCostPerOrder: 3,
  refundRate: 3,
  domesticDeliveryCostPerUnit: 2,
  packagingCostPerUnit: 0.75,
  warehousePrepCostPerUnit: 1,
  otherCostPerUnit: 0.5,
  targetMarginPercent: 30,
};

export const platformFeeFieldOrder: Record<PlatformId, FeeFieldKey[]> = {
  shopify: ["paymentFeePercent", "fixedPaymentFee", "thirdPartyTransactionFeePercent", "otherFixedPlatformFee"],
  etsy: ["marketplaceTransactionFeePercent", "paymentFeePercent", "fixedPaymentFee", "listingFee", "otherFixedPlatformFee"],
  ebay: ["finalValueFeePercent", "fixedOrderFee", "promotedListingAdFeePercent", "otherFixedPlatformFee"],
  amazon: ["referralFeePercent", "fulfillmentFeePerUnit", "storageOrOtherFeePerUnit", "otherFixedPlatformFee"],
  tiktok: ["referralFeePercent", "paymentFeePercent", "fixedPaymentFee", "affiliateCommissionPercent", "otherFixedPlatformFee"],
};

// Editable planning assumptions only. These are not official fee schedules and should be verified by the seller.
export const editableDefaultFees: Record<PlatformId, PlatformFeeDefaults> = {
  shopify: {
    platform: "shopify",
    fields: {
      paymentFeePercent: 2.9,
      fixedPaymentFee: 0.3,
      thirdPartyTransactionFeePercent: 2,
      otherFixedPlatformFee: 0,
    },
  },
  etsy: {
    platform: "etsy",
    fields: {
      marketplaceTransactionFeePercent: 6.5,
      paymentFeePercent: 3,
      fixedPaymentFee: 0.25,
      listingFee: 0.2,
      otherFixedPlatformFee: 0,
    },
  },
  ebay: {
    platform: "ebay",
    fields: {
      finalValueFeePercent: 13.25,
      fixedOrderFee: 0.3,
      promotedListingAdFeePercent: 0,
      otherFixedPlatformFee: 0,
    },
  },
  amazon: {
    platform: "amazon",
    fields: {
      referralFeePercent: 15,
      fulfillmentFeePerUnit: 4.5,
      storageOrOtherFeePerUnit: 0.25,
      otherFixedPlatformFee: 0,
    },
  },
  tiktok: {
    platform: "tiktok",
    fields: {
      referralFeePercent: 6,
      paymentFeePercent: 2.9,
      fixedPaymentFee: 0.3,
      affiliateCommissionPercent: 0,
      otherFixedPlatformFee: 0,
    },
  },
};

export const defaultPaymentCalculatorInputs: PaymentCalculatorDefaults = {
  transactionAmount: 49.99,
  numberOfTransactions: 500,
  currency: "USD",
  optionalExtraFeePercent: 0,
  refundRate: 3,
  chargebackRate: 0.5,
};

// Editable planning assumptions only. Payment processor fees vary by region, currency, account, and transaction type.
export const editablePaymentProviderFees: Record<PaymentProviderId, PaymentProviderFeeDefaults> = {
  stripe: {
    provider: "stripe",
    fields: {
      percentageFee: 2.9,
      fixedFee: 0.3,
      internationalCardSurchargePercent: 0,
      currencyConversionFeePercent: 0,
      refundRetainedPercentageFee: 0,
      refundNonRefundableFixedFee: 0.3,
      chargebackFixedFee: 15,
    },
  },
  paypal: {
    provider: "paypal",
    fields: {
      percentageFee: 3.49,
      fixedFee: 0.49,
      internationalCardSurchargePercent: 0,
      currencyConversionFeePercent: 0,
      refundRetainedPercentageFee: 0,
      refundNonRefundableFixedFee: 0.49,
      chargebackFixedFee: 15,
    },
  },
  shopifyPayments: {
    provider: "shopifyPayments",
    fields: {
      percentageFee: 2.9,
      fixedFee: 0.3,
      internationalCardSurchargePercent: 0,
      currencyConversionFeePercent: 0,
      refundRetainedPercentageFee: 0,
      refundNonRefundableFixedFee: 0.3,
      chargebackFixedFee: 15,
    },
  },
};

export const defaultFees = {
  multiPlatform: {
    lastReviewed: "2026-06",
    assumptions: editableDefaultFees,
  },
  paymentProcessors: {
    lastReviewed: "2026-06",
    assumptions: editablePaymentProviderFees,
  },
  landedCost: {
    lastReviewed: "2026-06",
    assumptions: defaultLandedCostInputs,
  },
} as const;
