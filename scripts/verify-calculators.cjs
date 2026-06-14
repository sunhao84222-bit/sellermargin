/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const moduleCache = new Map();

function loadTypeScriptModule(relativePath) {
  const filename = path.join(root, relativePath);
  if (moduleCache.has(filename)) {
    return moduleCache.get(filename).exports;
  }

  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  const compiledModule = { exports: {} };
  moduleCache.set(filename, compiledModule);

  function localRequire(request) {
    if (request === "@/lib/defaultFees") {
      return loadTypeScriptModule("lib/defaultFees.ts");
    }
    if (request === "@/lib/validators") {
      return loadTypeScriptModule("lib/validators.ts");
    }
    if (request === "@/lib/calculators") {
      return loadTypeScriptModule("lib/calculators.ts");
    }
    if (request === "@/lib/schemas/adBreakEven") {
      return loadTypeScriptModule("lib/schemas/adBreakEven.ts");
    }
    if (request === "@/lib/schemas/paymentFees") {
      return loadTypeScriptModule("lib/schemas/paymentFees.ts");
    }
    if (request === "@/lib/schemas/multiPlatform") {
      return loadTypeScriptModule("lib/schemas/multiPlatform.ts");
    }
    if (request === "@/lib/schemas/landedCost") {
      return loadTypeScriptModule("lib/schemas/landedCost.ts");
    }
    return require(request);
  }

  const execute = new Function("require", "module", "exports", "__filename", "__dirname", output);
  execute(localRequire, compiledModule, compiledModule.exports, filename, path.dirname(filename));
  return compiledModule.exports;
}

function closeTo(actual, expected, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} to be close to ${expected}`);
}

const {
  calculateAdBreakEven,
  calculateLandedCost,
  calculateMultiPlatformProfit,
  calculatePaymentFees,
} = loadTypeScriptModule("lib/calculators.ts");
const {
  getAdBreakEvenPercentWarning,
  normalizeSavedAdBreakEvenInput,
  validateAdBreakEvenInput,
} = loadTypeScriptModule("lib/schemas/adBreakEven.ts");
const {
  createDefaultRawPaymentFeeState,
  getPaymentPercentWarning,
  normalizeSavedPaymentFeeState,
  validatePaymentFeeState,
} = loadTypeScriptModule("lib/schemas/paymentFees.ts");
const {
  createDefaultRawMultiPlatformState,
  getMultiPlatformPercentWarning,
  normalizeSavedMultiPlatformState,
  validateMultiPlatformState,
} = loadTypeScriptModule("lib/schemas/multiPlatform.ts");
const {
  createDefaultRawLandedCostState,
  getLandedCostPercentWarning,
  normalizeSavedLandedCostState,
  validateLandedCostState,
} = loadTypeScriptModule("lib/schemas/landedCost.ts");

const multi = calculateMultiPlatformProfit(
  {
    sellingPrice: 100,
    productCost: 20,
    shippingCost: 5,
    packagingCost: 2,
    adCostPerOrder: 10,
    refundRate: 5,
    discountRate: 10,
    otherVariableCost: 3,
  },
  ["shopify"],
  {
    shopify: {
      paymentFeePercent: 2,
      fixedPaymentFee: 0.3,
      thirdPartyTransactionFeePercent: 1,
      otherFixedPlatformFee: 2,
    },
  },
);
assert.deepEqual(multi.errors, []);
closeTo(multi.result.results[0].netRevenue, 90);
closeTo(multi.result.results[0].platformFee, 2.9);
closeTo(multi.result.results[0].paymentFee, 2.1);
closeTo(multi.result.results[0].totalCost, 49.5);
closeTo(multi.result.results[0].netProfit, 40.5);
closeTo(multi.result.results[0].grossRoas, 10);
closeTo(multi.result.results[0].netRevenueRoas, 9);
closeTo(multi.result.results[0].poas, 4.05);

const multiWithoutAdSpend = calculateMultiPlatformProfit(
  {
    sellingPrice: 100,
    productCost: 20,
    shippingCost: 5,
    packagingCost: 2,
    adCostPerOrder: 0,
    refundRate: 5,
    discountRate: 10,
    otherVariableCost: 3,
  },
  ["shopify"],
  {
    shopify: {
      paymentFeePercent: 2,
      fixedPaymentFee: 0.3,
      thirdPartyTransactionFeePercent: 1,
      otherFixedPlatformFee: 2,
    },
  },
);
assert.equal(multiWithoutAdSpend.result.results[0].grossRoas, null);
assert.equal(multiWithoutAdSpend.result.results[0].netRevenueRoas, null);
assert.equal(multiWithoutAdSpend.result.results[0].poas, null);

const rawMultiState = createDefaultRawMultiPlatformState();
rawMultiState.selectedPlatforms = ["shopify"];
rawMultiState.input.discountRate = "30";
rawMultiState.input.refundRate = "0.3";
rawMultiState.input.shippingCost = "";
rawMultiState.feeAssumptions.shopify.paymentFeePercent = "0.3";
rawMultiState.feeAssumptions.shopify.fixedPaymentFee = "";
const parsedMultiState = validateMultiPlatformState(rawMultiState);
assert.equal(parsedMultiState.success, true);
assert.equal(parsedMultiState.data.input.discountRate, 30);
assert.equal(parsedMultiState.data.input.refundRate, 0.3);
assert.equal(parsedMultiState.data.input.shippingCost, 0);
assert.equal(
  parsedMultiState.data.feeAssumptions.shopify.paymentFeePercent,
  0.3,
);
assert.equal(
  parsedMultiState.data.feeAssumptions.shopify.fixedPaymentFee,
  0,
);
const parsedMultiCalculation = calculateMultiPlatformProfit(
  parsedMultiState.data.input,
  parsedMultiState.data.selectedPlatforms,
  parsedMultiState.data.feeAssumptions,
);
closeTo(
  parsedMultiCalculation.result.shared.discountAmount,
  parsedMultiState.data.input.sellingPrice * 0.3,
);
closeTo(
  parsedMultiCalculation.result.results[0].refundReserve,
  parsedMultiCalculation.result.shared.netRevenue * 0.003,
);

const emptyMultiSellingPrice = validateMultiPlatformState({
  ...rawMultiState,
  input: { ...rawMultiState.input, sellingPrice: "" },
});
assert.equal(emptyMultiSellingPrice.success, false);
assert.equal(
  emptyMultiSellingPrice.fieldErrors["input.sellingPrice"],
  "required",
);

const invalidMultiPlatformFee = validateMultiPlatformState({
  ...rawMultiState,
  feeAssumptions: {
    ...rawMultiState.feeAssumptions,
    shopify: {
      ...rawMultiState.feeAssumptions.shopify,
      paymentFeePercent: "not-a-number",
    },
  },
});
assert.equal(invalidMultiPlatformFee.success, false);
assert.equal(
  invalidMultiPlatformFee.fieldErrors[
    "feeAssumptions.shopify.paymentFeePercent"
  ],
  "invalidNumber",
);

const emptyPlatformSelection = validateMultiPlatformState({
  ...rawMultiState,
  selectedPlatforms: [],
});
assert.equal(emptyPlatformSelection.success, false);
assert.equal(
  emptyPlatformSelection.fieldErrors.selectedPlatforms,
  "selectAtLeastOne",
);

assert.equal(
  getMultiPlatformPercentWarning("0.3"),
  "percentLikelyFraction",
);
assert.equal(getMultiPlatformPercentWarning("30"), null);
assert.equal(
  getMultiPlatformPercentWarning("1000"),
  "percentVeryHigh",
);

const normalizedLegacyMultiState = normalizeSavedMultiPlatformState({
  input: {
    sellingPrice: 50,
    productCost: 20,
    refundRate: 0.3,
  },
  selectedPlatforms: ["shopify", "etsy"],
  feeAssumptions: {
    shopify: {
      paymentFeePercent: 2.9,
      fixedPaymentFee: 0.3,
    },
  },
});
assert.equal(normalizedLegacyMultiState.input.sellingPrice, "50");
assert.equal(normalizedLegacyMultiState.input.refundRate, "0.3");
assert.equal(
  normalizedLegacyMultiState.feeAssumptions.shopify.paymentFeePercent,
  "2.9",
);
assert.deepEqual(normalizedLegacyMultiState.selectedPlatforms, [
  "shopify",
  "etsy",
]);

const normalizedEmptyPlatformSelection = normalizeSavedMultiPlatformState({
  ...rawMultiState,
  selectedPlatforms: [],
});
assert.deepEqual(normalizedEmptyPlatformSelection.selectedPlatforms, []);

const normalizedRawMultiState = normalizeSavedMultiPlatformState({
  ...rawMultiState,
  input: {
    ...rawMultiState.input,
    discountRate: "030.00",
  },
});
assert.equal(normalizedRawMultiState.input.discountRate, "030.00");

const ad = calculateAdBreakEven({
  sellingPrice: 50,
  productCost: 15,
  shippingCost: 5,
  packagingCost: 1,
  platformFeePercent: 10,
  paymentFeePercent: 2,
  fixedPaymentFee: 0.5,
  otherVariableCost: 2,
  targetMode: "profitAmount",
  targetProfitPerOrder: 5,
  targetProfitMarginPercent: 20,
  currentRoas: 4,
  currentCpa: 0,
});
closeTo(ad.result.variableCostBeforeAds, 29.5);
closeTo(ad.result.contributionMarginBeforeAds, 20.5);
closeTo(ad.result.breakEvenRoas, 50 / 20.5);
closeTo(ad.result.targetRoas, 50 / 15.5);
closeTo(ad.result.breakEvenAcos, 20.5 / 50);
assert.equal(ad.result.profitStatus, "profitable");

const adZeroRevenue = calculateAdBreakEven({
  ...{
    sellingPrice: 0,
    productCost: 0,
    shippingCost: 0,
    packagingCost: 0,
    platformFeePercent: 0,
    paymentFeePercent: 0,
    fixedPaymentFee: 0,
    otherVariableCost: 0,
    targetMode: "profitAmount",
    targetProfitPerOrder: 0,
    targetProfitMarginPercent: 0,
    currentRoas: 0,
    currentCpa: 0,
  },
});
assert.equal(adZeroRevenue.result.breakEvenRoas, null);
assert.ok(adZeroRevenue.errors.includes("revenueNonPositive"));

const validRawAdInput = {
  sellingPrice: "50",
  productCost: "15",
  shippingCost: "5",
  packagingCost: "1",
  platformFeePercent: "30",
  paymentFeePercent: "0.3",
  fixedPaymentFee: "0.5",
  otherVariableCost: "2",
  targetMode: "profitAmount",
  targetProfitPerOrder: "5",
  targetProfitMarginPercent: "",
  currentRoas: "",
  currentCpa: "",
};
const parsedRawAdInput = validateAdBreakEvenInput(validRawAdInput);
assert.equal(parsedRawAdInput.success, true);
assert.equal(parsedRawAdInput.data.platformFeePercent, 30);
assert.equal(parsedRawAdInput.data.paymentFeePercent, 0.3);
assert.equal(parsedRawAdInput.data.currentRoas, 0);
const parsedRawAdCalculation = calculateAdBreakEven(parsedRawAdInput.data);
closeTo(parsedRawAdCalculation.result.platformFee, 15);
closeTo(parsedRawAdCalculation.result.paymentFee, 0.65);

const emptySellingPrice = validateAdBreakEvenInput({
  ...validRawAdInput,
  sellingPrice: "",
});
assert.equal(emptySellingPrice.success, false);
assert.equal(emptySellingPrice.fieldErrors.sellingPrice, "required");

assert.equal(getAdBreakEvenPercentWarning("0.3"), "percentLikelyFraction");
assert.equal(getAdBreakEvenPercentWarning("30"), null);
assert.equal(getAdBreakEvenPercentWarning("1000"), "percentVeryHigh");

const normalizedLegacyAdInput = normalizeSavedAdBreakEvenInput({
  input: {
    ...ad.result,
    sellingPrice: 50,
    platformFeePercent: 0.3,
    targetMode: "marginPercent",
  },
});
assert.equal(normalizedLegacyAdInput.sellingPrice, "50");
assert.equal(normalizedLegacyAdInput.platformFeePercent, "0.3");
assert.equal(normalizedLegacyAdInput.targetMode, "marginPercent");

const normalizedRawAdInput = normalizeSavedAdBreakEvenInput({
  ...validRawAdInput,
  platformFeePercent: "030.00",
});
assert.equal(normalizedRawAdInput.platformFeePercent, "030.00");

const activeMarginIgnoresHiddenProfitField = validateAdBreakEvenInput({
  ...validRawAdInput,
  targetMode: "marginPercent",
  targetProfitPerOrder: "-not-active-",
  targetProfitMarginPercent: "30",
});
assert.equal(activeMarginIgnoresHiddenProfitField.success, true);
assert.equal(activeMarginIgnoresHiddenProfitField.data.targetProfitPerOrder, 0);
assert.equal(activeMarginIgnoresHiddenProfitField.data.targetProfitMarginPercent, 30);

const payment = calculatePaymentFees(
  {
    transactionAmount: 50,
    numberOfTransactions: 100,
    optionalExtraFeePercent: 1,
    refundRate: 10,
    chargebackRate: 1,
  },
  {
    stripe: {
      percentageFee: 2.9,
      fixedFee: 0.3,
      internationalCardSurchargePercent: 1,
      currencyConversionFeePercent: 2,
      refundRetainedPercentageFee: 1,
      refundNonRefundableFixedFee: 0.3,
      chargebackFixedFee: 15,
    },
  },
);
const stripe = payment.result.results[0];
closeTo(stripe.baseFeePerTransaction, 1.75);
closeTo(stripe.extraPercentageFeePerTransaction, 2);
closeTo(stripe.estimatedRefundCost, 8);
closeTo(stripe.estimatedChargebackCost, 15);
closeTo(stripe.totalFees, 398);
closeTo(stripe.netReceived, 4602);
closeTo(stripe.effectiveFeeRate, 7.96);

const invalidPayment = calculatePaymentFees(
  { transactionAmount: 50, numberOfTransactions: 100, optionalExtraFeePercent: 1000, refundRate: -1, chargebackRate: 0 },
  {
    stripe: {
      percentageFee: 2.9,
      fixedFee: 0.3,
      internationalCardSurchargePercent: 0,
      currencyConversionFeePercent: 0,
      refundRetainedPercentageFee: 0,
      refundNonRefundableFixedFee: 0.3,
      chargebackFixedFee: 15,
    },
  },
);
assert.ok(invalidPayment.errors.includes("refundRateNegative"));
assert.ok(invalidPayment.warnings.includes("extremePercentage"));

const rawPaymentState = createDefaultRawPaymentFeeState();
rawPaymentState.input.optionalExtraFeePercent = "30";
rawPaymentState.input.refundRate = "0.3";
rawPaymentState.input.chargebackRate = "";
rawPaymentState.feeAssumptions.stripe.internationalCardSurchargePercent = "";
const parsedPaymentState = validatePaymentFeeState(rawPaymentState);
assert.equal(parsedPaymentState.success, true);
assert.equal(parsedPaymentState.data.input.optionalExtraFeePercent, 30);
assert.equal(parsedPaymentState.data.input.refundRate, 0.3);
assert.equal(parsedPaymentState.data.input.chargebackRate, 0);
assert.equal(
  parsedPaymentState.data.feeAssumptions.stripe
    .internationalCardSurchargePercent,
  0,
);

const parsedPaymentCalculation = calculatePaymentFees(
  parsedPaymentState.data.input,
  parsedPaymentState.data.feeAssumptions,
);
closeTo(
  parsedPaymentCalculation.result.estimatedRefundTransactions,
  parsedPaymentState.data.input.numberOfTransactions * 0.003,
);

const emptyPaymentAmount = validatePaymentFeeState({
  ...rawPaymentState,
  input: { ...rawPaymentState.input, transactionAmount: "" },
});
assert.equal(emptyPaymentAmount.success, false);
assert.equal(
  emptyPaymentAmount.fieldErrors["input.transactionAmount"],
  "required",
);

const invalidStripePercentage = validatePaymentFeeState({
  ...rawPaymentState,
  feeAssumptions: {
    ...rawPaymentState.feeAssumptions,
    stripe: {
      ...rawPaymentState.feeAssumptions.stripe,
      percentageFee: "not-a-number",
    },
  },
});
assert.equal(invalidStripePercentage.success, false);
assert.equal(
  invalidStripePercentage.fieldErrors[
    "feeAssumptions.stripe.percentageFee"
  ],
  "invalidNumber",
);

assert.equal(
  getPaymentPercentWarning("0.3"),
  "percentLikelyFraction",
);
assert.equal(getPaymentPercentWarning("30"), null);
assert.equal(getPaymentPercentWarning("1000"), "percentVeryHigh");

const normalizedLegacyPaymentState = normalizeSavedPaymentFeeState({
  input: {
    transactionAmount: 50,
    numberOfTransactions: 100,
    optionalExtraFeePercent: 0.3,
    refundRate: 3,
    chargebackRate: 0.5,
  },
  feeAssumptions: {
    stripe: {
      percentageFee: 2.9,
      fixedFee: 0.3,
    },
  },
});
assert.equal(normalizedLegacyPaymentState.input.transactionAmount, "50");
assert.equal(
  normalizedLegacyPaymentState.input.optionalExtraFeePercent,
  "0.3",
);
assert.equal(
  normalizedLegacyPaymentState.feeAssumptions.stripe.percentageFee,
  "2.9",
);

const normalizedRawPaymentState = normalizeSavedPaymentFeeState({
  ...rawPaymentState,
  input: {
    ...rawPaymentState.input,
    optionalExtraFeePercent: "030.00",
  },
});
assert.equal(
  normalizedRawPaymentState.input.optionalExtraFeePercent,
  "030.00",
);

const rawLandedState = createDefaultRawLandedCostState();
rawLandedState.input.customsDutyRate = "30";
rawLandedState.input.importTaxRate = "0.3";
rawLandedState.input.insuranceCost = "";
rawLandedState.input.customsBrokerFee = "";
rawLandedState.details.hsCode = "";
rawLandedState.details.supplierCountry = "";
rawLandedState.details.destinationCountry = "";
const parsedLandedState = validateLandedCostState(rawLandedState);
assert.equal(parsedLandedState.success, true);
assert.equal(parsedLandedState.data.input.customsDutyRate, 30);
assert.equal(parsedLandedState.data.input.importTaxRate, 0.3);
assert.equal(parsedLandedState.data.input.insuranceCost, 0);
assert.equal(parsedLandedState.data.input.customsBrokerFee, 0);
assert.equal(parsedLandedState.data.details.hsCode, "");

const parsedLandedCalculation = calculateLandedCost(
  parsedLandedState.data.input,
);
closeTo(
  parsedLandedCalculation.result.dutyPerUnit,
  parsedLandedCalculation.result.customsValuePerUnit * 0.3,
);
closeTo(
  parsedLandedCalculation.result.importTaxPerUnit,
  (parsedLandedCalculation.result.customsValuePerUnit +
    parsedLandedCalculation.result.dutyPerUnit) *
    0.003,
);

const emptyLandedProductCost = validateLandedCostState({
  ...rawLandedState,
  input: { ...rawLandedState.input, productUnitCost: "" },
});
assert.equal(emptyLandedProductCost.success, false);
assert.equal(
  emptyLandedProductCost.fieldErrors["input.productUnitCost"],
  "required",
);

const emptyLandedSellingPrice = validateLandedCostState({
  ...rawLandedState,
  input: { ...rawLandedState.input, sellingPricePerUnit: "" },
});
assert.equal(emptyLandedSellingPrice.success, false);
assert.equal(
  emptyLandedSellingPrice.fieldErrors["input.sellingPricePerUnit"],
  "required",
);

const invalidLandedQuantity = validateLandedCostState({
  ...rawLandedState,
  input: { ...rawLandedState.input, quantity: "1.5" },
});
assert.equal(invalidLandedQuantity.success, false);
assert.equal(
  invalidLandedQuantity.fieldErrors["input.quantity"],
  "positiveInteger",
);

const zeroLandedQuantity = validateLandedCostState({
  ...rawLandedState,
  input: { ...rawLandedState.input, quantity: "0" },
});
assert.equal(zeroLandedQuantity.success, false);
assert.equal(
  zeroLandedQuantity.fieldErrors["input.quantity"],
  "positiveInteger",
);

const invalidLandedTargetMargin = validateLandedCostState({
  ...rawLandedState,
  input: { ...rawLandedState.input, targetMarginPercent: "100" },
});
assert.equal(invalidLandedTargetMargin.success, false);
assert.equal(
  invalidLandedTargetMargin.fieldErrors["input.targetMarginPercent"],
  "targetMarginInvalid",
);

const invalidCustomsValuation = validateLandedCostState({
  ...rawLandedState,
  input: {
    ...rawLandedState.input,
    customsValuationMethod: "invalid",
  },
});
assert.equal(invalidCustomsValuation.success, false);
assert.equal(
  invalidCustomsValuation.fieldErrors["input.customsValuationMethod"],
  "invalidCustomsValuationMethod",
);

const invalidFreightType = validateLandedCostState({
  ...rawLandedState,
  details: { ...rawLandedState.details, freightType: "rail" },
});
assert.equal(invalidFreightType.success, false);
assert.equal(
  invalidFreightType.fieldErrors["details.freightType"],
  "invalidFreightType",
);

const invalidImportTaxToggle = validateLandedCostState({
  ...rawLandedState,
  input: {
    ...rawLandedState.input,
    includeImportTaxAsCost: "true",
  },
});
assert.equal(invalidImportTaxToggle.success, false);

assert.equal(
  getLandedCostPercentWarning("0.3"),
  "percentLikelyFraction",
);
assert.equal(getLandedCostPercentWarning("30"), null);
assert.equal(
  getLandedCostPercentWarning("1000"),
  "percentVeryHigh",
);

const normalizedLegacyLandedState = normalizeSavedLandedCostState({
  input: {
    productUnitCost: 10,
    quantity: 100,
    customsDutyRate: 5,
    customsValuationMethod: "fob",
    includeImportTaxAsCost: false,
  },
  details: {
    hsCode: "6109.10",
    supplierCountry: "China",
    destinationCountry: "United States",
    freightType: "air",
  },
});
assert.equal(normalizedLegacyLandedState.input.productUnitCost, "10");
assert.equal(normalizedLegacyLandedState.input.quantity, "100");
assert.equal(normalizedLegacyLandedState.input.customsDutyRate, "5");
assert.equal(
  normalizedLegacyLandedState.input.customsValuationMethod,
  "fob",
);
assert.equal(
  normalizedLegacyLandedState.input.includeImportTaxAsCost,
  false,
);
assert.equal(normalizedLegacyLandedState.details.freightType, "air");
assert.equal(normalizedLegacyLandedState.details.hsCode, "6109.10");

const normalizedRawLandedState = normalizeSavedLandedCostState({
  ...rawLandedState,
  input: {
    ...rawLandedState.input,
    customsDutyRate: "030.00",
  },
});
assert.equal(
  normalizedRawLandedState.input.customsDutyRate,
  "030.00",
);

const landedInput = {
  productUnitCost: 10,
  quantity: 100,
  internationalFreightCost: 500,
  insuranceCost: 100,
  customsValuationMethod: "cif",
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
const landed = calculateLandedCost(landedInput);
closeTo(landed.result.customsValuePerUnit, 16);
closeTo(landed.result.dutyPerUnit, 0.8);
closeTo(landed.result.importTaxPerUnit, 1.68);
closeTo(landed.result.landedCostPerUnit, 19.98);
closeTo(landed.result.fixedCostPerUnit, 27.53);
closeTo(landed.result.variableSellingRateCostPercent, 15.9);
closeTo(landed.result.breakEvenSellingPrice, 27.53 / 0.841);
closeTo(landed.result.suggestedPriceForTargetMargin, 27.53 / 0.541);

const fob = calculateLandedCost({ ...landedInput, customsValuationMethod: "fob" });
closeTo(fob.result.customsValuePerUnit, 10);
closeTo(fob.result.dutyPerUnit, 0.5);

const recoverableTax = calculateLandedCost({ ...landedInput, includeImportTaxAsCost: false });
closeTo(recoverableTax.result.importTaxPerUnit, 1.68);
closeTo(recoverableTax.result.landedCostPerUnit, 18.3);

const invalidLanded = calculateLandedCost({ ...landedInput, quantity: 0, targetMarginPercent: 90 });
assert.ok(invalidLanded.errors.includes("quantityNonPositive"));
assert.ok(invalidLanded.warnings.includes("targetDenominatorNonPositive"));

const nearZeroLanded = calculateLandedCost({
  ...landedInput,
  platformFeePercent: 50,
  paymentFeePercent: 47,
  refundRate: 0,
  targetMarginPercent: 0,
});
assert.ok(nearZeroLanded.warnings.includes("breakEvenDenominatorNearZero"));
assert.ok(nearZeroLanded.result.breakEvenSellingPrice > 0);

const nonPositiveDenominatorLanded = calculateLandedCost({
  ...landedInput,
  platformFeePercent: 50,
  paymentFeePercent: 50,
  refundRate: 0,
  targetMarginPercent: 0,
});
assert.ok(nonPositiveDenominatorLanded.warnings.includes("breakEvenDenominatorNonPositive"));
assert.equal(nonPositiveDenominatorLanded.result.breakEvenSellingPrice, null);

console.log("Calculator verification passed.");
