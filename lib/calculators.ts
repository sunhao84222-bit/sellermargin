import type { FeeFieldKey, PaymentFeeAssumption, PaymentProviderId, PlatformId } from "@/lib/defaultFees";
import type { CalculationResponse, CustomsValuationMethod } from "@/lib/calculatorTypes";
import { hasExtremePercentage, normalizeNumber, percentInputToRate } from "@/lib/validators";

export type ProductEconomicsInput = {
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  packagingCost: number;
  adCostPerOrder: number;
  refundRate: number;
  discountRate: number;
  otherVariableCost: number;
};

export type FeeAssumptionsByPlatform = Record<PlatformId, Partial<Record<FeeFieldKey, number>>>;

export type PlatformProfitResult = {
  platform: PlatformId;
  grossRevenue: number;
  discountAmount: number;
  netRevenue: number;
  platformFee: number;
  paymentFee: number;
  fulfillmentFee: number;
  productCost: number;
  shippingCost: number;
  packagingCost: number;
  adCost: number;
  refundReserve: number;
  otherVariableCost: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
  grossRoas: number | null;
  netRevenueRoas: number | null;
  poas: number | null;
  totalPlatformRelatedFees: number;
};

export type PlatformProfitSummary = {
  bestNetProfitPlatform: PlatformId | null;
  bestMarginPlatform: PlatformId | null;
  lowestFeePlatform: PlatformId | null;
};

export type PlatformProfitCalculation = {
  error: "netRevenueNonPositive" | null;
  shared: {
    grossRevenue: number;
    discountAmount: number;
    netRevenue: number;
  };
  results: PlatformProfitResult[];
  summary: PlatformProfitSummary;
};

export type AdTargetMode = "profitAmount" | "marginPercent";

export type AdBreakEvenInput = {
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  packagingCost: number;
  platformFeePercent: number;
  paymentFeePercent: number;
  fixedPaymentFee: number;
  otherVariableCost: number;
  targetMode: AdTargetMode;
  targetProfitPerOrder: number;
  targetProfitMarginPercent: number;
  currentRoas: number;
  currentCpa: number;
};

export type ProfitStatus = "profitable" | "aboveBreakEvenBelowTarget" | "breakingEven" | "losingMoney" | "notAvailable";

export type AdBreakEvenCalculation = {
  warnings: {
    contributionMarginNonPositive: boolean;
    targetAdSpendNonPositive: boolean;
  };
  revenue: number;
  platformFee: number;
  paymentFee: number;
  variableCostBeforeAds: number;
  contributionMarginBeforeAds: number;
  breakEvenAdSpendPerOrder: number | null;
  maxCpaAtBreakEven: number | null;
  breakEvenRoas: number | null;
  targetProfit: number;
  targetAdSpendPerOrder: number | null;
  targetCpa: number | null;
  targetRoas: number | null;
  breakEvenAcos: number | null;
  targetAcos: number | null;
  profitStatus: ProfitStatus;
};

export type PaymentFeeInput = {
  transactionAmount: number;
  numberOfTransactions: number;
  optionalExtraFeePercent: number;
  refundRate: number;
  chargebackRate: number;
};

export type PaymentProviderFeeAssumptions = Record<PaymentProviderId, PaymentFeeAssumption>;

export type PaymentProviderFeeResult = {
  provider: PaymentProviderId;
  grossTransactionVolume: number;
  baseFeePerTransaction: number;
  extraPercentageFeePerTransaction: number;
  feePerTransaction: number;
  estimatedRefundCost: number;
  estimatedChargebackCost: number;
  totalFees: number;
  netReceived: number;
  effectiveFeeRate: number | null;
  differenceVsLowestCostProvider: number;
  monthlyEstimatedFees: number;
  annualEstimatedFees: number;
};

export type PaymentFeeCalculation = {
  errors: {
    transactionAmountNonPositive: boolean;
    numberOfTransactionsNonPositive: boolean;
    refundRateNegative: boolean;
    chargebackRateNegative: boolean;
  };
  grossTransactionVolume: number;
  estimatedRefundTransactions: number;
  estimatedChargebackTransactions: number;
  results: PaymentProviderFeeResult[];
  summary: {
    lowestCostProvider: PaymentProviderId | null;
    highestCostProvider: PaymentProviderId | null;
    estimatedMonthlySavings: number;
    estimatedAnnualSavings: number;
  };
};

export type LandedCostInput = {
  productUnitCost: number;
  quantity: number;
  internationalFreightCost: number;
  insuranceCost: number;
  customsValuationMethod: CustomsValuationMethod;
  customsDutyRate: number;
  importTaxRate: number;
  includeImportTaxAsCost: boolean;
  customsBrokerFee: number;
  otherImportFees: number;
  sellingPricePerUnit: number;
  platformFeePercent: number;
  paymentFeePercent: number;
  fixedPaymentFee: number;
  adCostPerOrder: number;
  refundRate: number;
  domesticDeliveryCostPerUnit: number;
  packagingCostPerUnit: number;
  warehousePrepCostPerUnit: number;
  otherCostPerUnit: number;
  targetMarginPercent: number;
};

export type LandedCostCalculation = {
  errors: {
    quantityNonPositive: boolean;
    targetMarginInvalid: boolean;
  };
  totalProductCost: number;
  freightPerUnit: number;
  insurancePerUnit: number;
  customsValuePerUnit: number;
  dutyPerUnit: number;
  importTaxPerUnit: number;
  brokerFeePerUnit: number;
  otherImportFeesPerUnit: number;
  landedCostPerUnit: number;
  platformFeePerUnit: number;
  paymentFeePerUnit: number;
  sellingFeesPerUnit: number;
  refundReservePerUnit: number;
  fixedCostPerUnit: number;
  variableSellingRateCostPercent: number;
  totalCostPerUnit: number;
  netProfitPerUnit: number;
  profitMargin: number | null;
  breakEvenSellingPrice: number | null;
  suggestedPriceFor30PercentMargin: number | null;
  suggestedPriceFor50PercentMargin: number | null;
  suggestedPriceForTargetMargin: number | null;
};

function asMoney(value: number | undefined) {
  return normalizeNumber(value);
}

function percentToRate(value: number | undefined) {
  return percentInputToRate(value);
}

function calculatePlatformFees(
  platform: PlatformId,
  netRevenue: number,
  assumptions: Partial<Record<FeeFieldKey, number>>,
) {
  const paymentFee = netRevenue * percentToRate(assumptions.paymentFeePercent) + asMoney(assumptions.fixedPaymentFee);
  let platformFee = Math.max(0, asMoney(assumptions.otherFixedPlatformFee));
  let fulfillmentFee = 0;

  if (platform === "shopify") {
    platformFee += netRevenue * percentToRate(assumptions.thirdPartyTransactionFeePercent);
  }

  if (platform === "etsy") {
    platformFee += netRevenue * percentToRate(assumptions.marketplaceTransactionFeePercent) + asMoney(assumptions.listingFee);
  }

  if (platform === "ebay") {
    platformFee +=
      netRevenue * percentToRate(assumptions.finalValueFeePercent) +
      netRevenue * percentToRate(assumptions.promotedListingAdFeePercent) +
      asMoney(assumptions.fixedOrderFee);
  }

  if (platform === "amazon") {
    platformFee += netRevenue * percentToRate(assumptions.referralFeePercent);
    fulfillmentFee = asMoney(assumptions.fulfillmentFeePerUnit) + asMoney(assumptions.storageOrOtherFeePerUnit);
  }

  if (platform === "tiktok") {
    platformFee +=
      netRevenue * percentToRate(assumptions.referralFeePercent) +
      netRevenue * percentToRate(assumptions.affiliateCommissionPercent);
  }

  return {
    platformFee,
    paymentFee,
    fulfillmentFee,
  };
}

export function calculateMultiPlatformProfit(
  input: ProductEconomicsInput,
  selectedPlatforms: PlatformId[],
  feeAssumptions: FeeAssumptionsByPlatform,
): CalculationResponse<PlatformProfitCalculation> {
  const grossRevenue = Math.max(0, asMoney(input.sellingPrice));
  const discountAmount = grossRevenue * percentToRate(input.discountRate);
  const netRevenue = grossRevenue - discountAmount;
  const shared = { grossRevenue, discountAmount, netRevenue };

  if (netRevenue <= 0) {
    return {
      result: {
        error: "netRevenueNonPositive",
        shared,
        results: [],
        summary: {
          bestNetProfitPlatform: null,
          bestMarginPlatform: null,
          lowestFeePlatform: null,
        },
      },
      errors: ["netRevenueNonPositive"],
      warnings: [],
    };
  }

  const refundReserve = netRevenue * percentToRate(input.refundRate);

  const results = selectedPlatforms.map((platform) => {
    const fees = calculatePlatformFees(platform, netRevenue, feeAssumptions[platform] ?? {});
    const productCost = Math.max(0, asMoney(input.productCost));
    const shippingCost = Math.max(0, asMoney(input.shippingCost));
    const packagingCost = Math.max(0, asMoney(input.packagingCost));
    const adCost = Math.max(0, asMoney(input.adCostPerOrder));
    const otherVariableCost = Math.max(0, asMoney(input.otherVariableCost));

    // Total cost includes product economics plus editable platform, payment, and fulfillment assumptions.
    const totalCost =
      productCost +
      shippingCost +
      packagingCost +
      adCost +
      refundReserve +
      fees.platformFee +
      fees.paymentFee +
      fees.fulfillmentFee +
      otherVariableCost;

    const netProfit = netRevenue - totalCost;
    const profitMargin = (netProfit / netRevenue) * 100;
    const grossRoas = adCost > 0 ? grossRevenue / adCost : null;
    const netRevenueRoas = adCost > 0 ? netRevenue / adCost : null;
    const poas = adCost > 0 ? netProfit / adCost : null;

    return {
      platform,
      grossRevenue,
      discountAmount,
      netRevenue,
      platformFee: fees.platformFee,
      paymentFee: fees.paymentFee,
      fulfillmentFee: fees.fulfillmentFee,
      productCost,
      shippingCost,
      packagingCost,
      adCost,
      refundReserve,
      otherVariableCost,
      totalCost,
      netProfit,
      profitMargin,
      grossRoas,
      netRevenueRoas,
      poas,
      totalPlatformRelatedFees: fees.platformFee + fees.paymentFee + fees.fulfillmentFee,
    };
  });

  return {
    result: {
      error: null,
      shared,
      results,
      summary: {
        bestNetProfitPlatform: getBestPlatform(results, "netProfit", "max"),
        bestMarginPlatform: getBestPlatform(results, "profitMargin", "max"),
        lowestFeePlatform: getBestPlatform(results, "totalPlatformRelatedFees", "min"),
      },
    },
    errors: [],
    warnings: [],
  };
}

function getBestPlatform(
  results: PlatformProfitResult[],
  metric: keyof Pick<PlatformProfitResult, "netProfit" | "profitMargin" | "totalPlatformRelatedFees">,
  direction: "max" | "min",
) {
  if (results.length === 0) {
    return null;
  }

  return results.reduce((best, current) => {
    const isBetter = direction === "max" ? current[metric] > best[metric] : current[metric] < best[metric];
    return isBetter ? current : best;
  }, results[0]).platform;
}

export function calculateAdBreakEven(input: AdBreakEvenInput): CalculationResponse<AdBreakEvenCalculation> {
  const revenue = Math.max(0, asMoney(input.sellingPrice));
  // Platform fee = Revenue x platform fee percentage.
  const platformFee = revenue * percentToRate(input.platformFeePercent);
  // Payment fee = Revenue x payment fee percentage + fixed payment fee.
  const paymentFee = revenue * percentToRate(input.paymentFeePercent) + Math.max(0, asMoney(input.fixedPaymentFee));
  // Variable cost before ads excludes paid advertising spend.
  const variableCostBeforeAds =
    Math.max(0, asMoney(input.productCost)) +
    Math.max(0, asMoney(input.shippingCost)) +
    Math.max(0, asMoney(input.packagingCost)) +
    platformFee +
    paymentFee +
    Math.max(0, asMoney(input.otherVariableCost));
  // Contribution margin before ads is the maximum ad budget before the order starts losing money.
  const contributionMarginBeforeAds = revenue - variableCostBeforeAds;
  const contributionMarginNonPositive = contributionMarginBeforeAds <= 0;
  // Target profit can be a fixed amount or a percentage of revenue.
  const targetProfit =
    input.targetMode === "profitAmount"
      ? Math.max(0, asMoney(input.targetProfitPerOrder))
      : revenue * percentToRate(input.targetProfitMarginPercent);
  // Target ad spend is what remains after reserving the target profit.
  const targetAdSpendRaw = contributionMarginBeforeAds - targetProfit;
  const targetAdSpendNonPositive = targetAdSpendRaw <= 0;
  const canCalculateBreakEven = revenue > 0 && contributionMarginBeforeAds > 0;
  const canCalculateTarget = revenue > 0 && targetAdSpendRaw > 0;
  const breakEvenAdSpendPerOrder = canCalculateBreakEven ? contributionMarginBeforeAds : null;
  const targetAdSpendPerOrder = canCalculateTarget ? targetAdSpendRaw : null;
  // ROAS is revenue divided by ad spend; ACoS is ad spend divided by revenue.
  const breakEvenRoas = canCalculateBreakEven ? revenue / contributionMarginBeforeAds : null;
  const targetRoas = canCalculateTarget ? revenue / targetAdSpendRaw : null;
  const breakEvenAcos = canCalculateBreakEven ? contributionMarginBeforeAds / revenue : null;
  const targetAcos = canCalculateTarget ? targetAdSpendRaw / revenue : null;

  const result: AdBreakEvenCalculation = {
      warnings: {
        contributionMarginNonPositive,
        targetAdSpendNonPositive,
      },
      revenue,
      platformFee,
      paymentFee,
      variableCostBeforeAds,
      contributionMarginBeforeAds,
      breakEvenAdSpendPerOrder,
      maxCpaAtBreakEven: breakEvenAdSpendPerOrder,
      breakEvenRoas,
      targetProfit,
      targetAdSpendPerOrder,
      targetCpa: targetAdSpendPerOrder,
      targetRoas,
      breakEvenAcos,
      targetAcos,
      profitStatus: getProfitStatus(input.currentRoas, breakEvenRoas, targetRoas),
    };

  return {
    result,
    errors: revenue <= 0 ? ["revenueNonPositive"] : [],
    warnings: [
      ...(contributionMarginNonPositive ? ["contributionMarginNonPositive"] : []),
      ...(targetAdSpendNonPositive ? ["targetAdSpendNonPositive"] : []),
    ],
  };
}

function getProfitStatus(currentRoas: number, breakEvenRoas: number | null, targetRoas: number | null): ProfitStatus {
  if (!Number.isFinite(currentRoas) || currentRoas <= 0 || breakEvenRoas === null || targetRoas === null) {
    return "notAvailable";
  }

  const tolerance = 0.0001;

  if (Math.abs(currentRoas - breakEvenRoas) <= tolerance) {
    return "breakingEven";
  }

  if (currentRoas > targetRoas) {
    return "profitable";
  }

  if (currentRoas > breakEvenRoas && currentRoas <= targetRoas) {
    return "aboveBreakEvenBelowTarget";
  }

  return "losingMoney";
}

export function calculatePaymentFees(
  input: PaymentFeeInput,
  feeAssumptions: PaymentProviderFeeAssumptions,
): CalculationResponse<PaymentFeeCalculation> {
  const transactionAmount = asMoney(input.transactionAmount);
  const numberOfTransactions = asMoney(input.numberOfTransactions);
  const safeTransactionAmount = Math.max(0, transactionAmount);
  const safeNumberOfTransactions = Math.max(0, numberOfTransactions);
  const grossTransactionVolume = safeTransactionAmount * safeNumberOfTransactions;
  const transactionAmountNonPositive = transactionAmount <= 0;
  const numberOfTransactionsNonPositive = numberOfTransactions <= 0;
  const refundRateNegative = input.refundRate < 0;
  const chargebackRateNegative = input.chargebackRate < 0;
  const canCalculate =
    !transactionAmountNonPositive &&
    !numberOfTransactionsNonPositive &&
    !refundRateNegative &&
    !chargebackRateNegative;
  const safeRefundRate = Math.max(0, percentToRate(input.refundRate));
  const safeChargebackRate = Math.max(0, percentToRate(input.chargebackRate));
  const estimatedRefundTransactions = safeNumberOfTransactions * safeRefundRate;
  const estimatedRefundedVolume = safeTransactionAmount * estimatedRefundTransactions;
  const estimatedChargebackTransactions = safeNumberOfTransactions * safeChargebackRate;

  const baseResults = (Object.keys(feeAssumptions) as PaymentProviderId[]).map((provider) => {
    const assumption = feeAssumptions[provider];
    const baseFeePerTransaction =
      safeTransactionAmount * Math.max(0, percentToRate(assumption.percentageFee)) +
      Math.max(0, asMoney(assumption.fixedFee));
    const combinedExtraPercentage =
      Math.max(0, percentToRate(input.optionalExtraFeePercent)) +
      Math.max(0, percentToRate(assumption.internationalCardSurchargePercent)) +
      Math.max(0, percentToRate(assumption.currencyConversionFeePercent));
    const extraPercentageFeePerTransaction = safeTransactionAmount * combinedExtraPercentage;
    const feePerTransaction = baseFeePerTransaction + extraPercentageFeePerTransaction;
    const baseTotalFees = canCalculate ? feePerTransaction * safeNumberOfTransactions : 0;
    // Base total fees already include original transaction fees. These are editable,
    // refund-side retained amounts only.
    const estimatedRefundCost = canCalculate
      ? estimatedRefundedVolume * Math.max(0, percentToRate(assumption.refundRetainedPercentageFee)) +
        estimatedRefundTransactions * Math.max(0, asMoney(assumption.refundNonRefundableFixedFee))
      : 0;
    const estimatedChargebackCost = canCalculate
      ? estimatedChargebackTransactions * Math.max(0, asMoney(assumption.chargebackFixedFee))
      : 0;
    const totalFees = baseTotalFees + estimatedRefundCost + estimatedChargebackCost;
    const effectiveFeeRate = grossTransactionVolume > 0 ? (totalFees / grossTransactionVolume) * 100 : null;

    return {
      provider,
      grossTransactionVolume,
      baseFeePerTransaction: canCalculate ? baseFeePerTransaction : 0,
      extraPercentageFeePerTransaction: canCalculate ? extraPercentageFeePerTransaction : 0,
      feePerTransaction: canCalculate ? feePerTransaction : 0,
      estimatedRefundCost,
      estimatedChargebackCost,
      totalFees,
      netReceived: canCalculate ? grossTransactionVolume - totalFees : 0,
      effectiveFeeRate,
      differenceVsLowestCostProvider: 0,
      monthlyEstimatedFees: totalFees,
      annualEstimatedFees: totalFees * 12,
    };
  });

  const errors = [
    ...(transactionAmountNonPositive ? ["transactionAmountNonPositive"] : []),
    ...(numberOfTransactionsNonPositive ? ["numberOfTransactionsNonPositive"] : []),
    ...(refundRateNegative ? ["refundRateNegative"] : []),
    ...(chargebackRateNegative ? ["chargebackRateNegative"] : []),
  ];
  const extremePercentage = hasExtremePercentage([
    input.optionalExtraFeePercent,
    input.refundRate,
    input.chargebackRate,
    ...Object.values(feeAssumptions).flatMap((assumption) => [
      assumption.percentageFee,
      assumption.internationalCardSurchargePercent,
      assumption.currencyConversionFeePercent,
      assumption.refundRetainedPercentageFee,
    ]),
  ]);
  const warnings = extremePercentage ? ["extremePercentage"] : [];

  if (!canCalculate || baseResults.length === 0) {
    return {
      result: {
      errors: {
        transactionAmountNonPositive,
        numberOfTransactionsNonPositive,
        refundRateNegative,
        chargebackRateNegative,
      },
      grossTransactionVolume,
      estimatedRefundTransactions,
      estimatedChargebackTransactions,
      results: baseResults,
      summary: {
        lowestCostProvider: null,
        highestCostProvider: null,
        estimatedMonthlySavings: 0,
        estimatedAnnualSavings: 0,
      },
      },
      errors,
      warnings,
    };
  }

  const lowest = baseResults.reduce((best, current) => (current.totalFees < best.totalFees ? current : best), baseResults[0]);
  const highest = baseResults.reduce((best, current) => (current.totalFees > best.totalFees ? current : best), baseResults[0]);
  const results = baseResults.map((result) => ({
    ...result,
    differenceVsLowestCostProvider: result.totalFees - lowest.totalFees,
  }));
  const estimatedMonthlySavings = highest.totalFees - lowest.totalFees;

  return {
    result: {
      errors: {
        transactionAmountNonPositive,
        numberOfTransactionsNonPositive,
        refundRateNegative,
        chargebackRateNegative,
      },
      grossTransactionVolume,
      estimatedRefundTransactions,
      estimatedChargebackTransactions,
      results,
      summary: {
        lowestCostProvider: lowest.provider,
        highestCostProvider: highest.provider,
        estimatedMonthlySavings,
        estimatedAnnualSavings: estimatedMonthlySavings * 12,
      },
    },
    errors,
    warnings,
  };
}

export function calculateLandedCost(input: LandedCostInput): CalculationResponse<LandedCostCalculation> {
  const quantity = asMoney(input.quantity);
  const quantityNonPositive = quantity <= 0;
  const targetMarginPercent = Math.max(0, asMoney(input.targetMarginPercent));
  const targetMarginInvalid = targetMarginPercent >= 100;
  const canCalculatePerUnit = !quantityNonPositive;
  const safeQuantity = Math.max(0, quantity);
  const productUnitCost = Math.max(0, asMoney(input.productUnitCost));
  const sellingPricePerUnit = Math.max(0, asMoney(input.sellingPricePerUnit));
  const totalProductCost = productUnitCost * safeQuantity;
  // Freight and insurance are allocated evenly across the imported quantity.
  const freightPerUnit = canCalculatePerUnit ? Math.max(0, asMoney(input.internationalFreightCost)) / safeQuantity : 0;
  const insurancePerUnit = canCalculatePerUnit ? Math.max(0, asMoney(input.insuranceCost)) / safeQuantity : 0;
  // Duty is based on customs value; import tax is based on customs value plus duty.
  const customsValuePerUnit = canCalculatePerUnit
    ? input.customsValuationMethod === "fob"
      ? productUnitCost
      : productUnitCost + freightPerUnit + insurancePerUnit
    : 0;
  const dutyPerUnit = customsValuePerUnit * percentToRate(input.customsDutyRate);
  const importTaxPerUnit = (customsValuePerUnit + dutyPerUnit) * percentToRate(input.importTaxRate);
  const brokerFeePerUnit = canCalculatePerUnit ? Math.max(0, asMoney(input.customsBrokerFee)) / safeQuantity : 0;
  const otherImportFeesPerUnit = canCalculatePerUnit ? Math.max(0, asMoney(input.otherImportFees)) / safeQuantity : 0;
  // Import tax is displayed either way, but only included in landed cost when selected.
  const landedCostPerUnit = canCalculatePerUnit
    ? productUnitCost +
      freightPerUnit +
      insurancePerUnit +
      dutyPerUnit +
      (input.includeImportTaxAsCost ? importTaxPerUnit : 0) +
      brokerFeePerUnit +
      otherImportFeesPerUnit
    : 0;
  const platformFeePerUnit = sellingPricePerUnit * percentToRate(input.platformFeePercent);
  const paymentFeePerUnit =
    sellingPricePerUnit * percentToRate(input.paymentFeePercent) + Math.max(0, asMoney(input.fixedPaymentFee));
  const sellingFeesPerUnit = platformFeePerUnit + paymentFeePerUnit;
  const refundReservePerUnit = sellingPricePerUnit * percentToRate(input.refundRate);
  const fixedCostPerUnit = canCalculatePerUnit
    ? landedCostPerUnit +
      Math.max(0, asMoney(input.fixedPaymentFee)) +
      Math.max(0, asMoney(input.adCostPerOrder)) +
      Math.max(0, asMoney(input.domesticDeliveryCostPerUnit)) +
      Math.max(0, asMoney(input.packagingCostPerUnit)) +
      Math.max(0, asMoney(input.warehousePrepCostPerUnit)) +
      Math.max(0, asMoney(input.otherCostPerUnit))
    : 0;
  const variableSellingRate =
    percentToRate(input.platformFeePercent) +
    percentToRate(input.paymentFeePercent) +
    percentToRate(input.refundRate);
  // Total cost combines landed cost, selling fees, advertising, refund reserve, and local fulfillment costs.
  const totalCostPerUnit = canCalculatePerUnit
    ? landedCostPerUnit +
      sellingFeesPerUnit +
      Math.max(0, asMoney(input.adCostPerOrder)) +
      refundReservePerUnit +
      Math.max(0, asMoney(input.domesticDeliveryCostPerUnit)) +
      Math.max(0, asMoney(input.packagingCostPerUnit)) +
      Math.max(0, asMoney(input.warehousePrepCostPerUnit)) +
      Math.max(0, asMoney(input.otherCostPerUnit))
    : 0;
  const netProfitPerUnit = canCalculatePerUnit ? sellingPricePerUnit - totalCostPerUnit : 0;
  const profitMargin =
    canCalculatePerUnit && sellingPricePerUnit > 0 ? (netProfitPerUnit / sellingPricePerUnit) * 100 : null;
  const breakEvenDenominator = 1 - variableSellingRate;
  const targetMarginRate = percentToRate(targetMarginPercent);
  const targetDenominator = 1 - variableSellingRate - targetMarginRate;
  const price30Denominator = 1 - variableSellingRate - 0.3;
  const price50Denominator = 1 - variableSellingRate - 0.5;
  const breakEvenDenominatorNearZero = breakEvenDenominator > 0 && breakEvenDenominator < 0.05;

  return {
    result: {
      errors: {
        quantityNonPositive,
        targetMarginInvalid,
      },
      totalProductCost,
      freightPerUnit,
      insurancePerUnit,
      customsValuePerUnit,
      dutyPerUnit,
      importTaxPerUnit,
      brokerFeePerUnit,
      otherImportFeesPerUnit,
      landedCostPerUnit,
      platformFeePerUnit,
      paymentFeePerUnit,
      sellingFeesPerUnit,
      refundReservePerUnit,
      fixedCostPerUnit,
      variableSellingRateCostPercent: variableSellingRate * 100,
      totalCostPerUnit,
      netProfitPerUnit,
      profitMargin,
      breakEvenSellingPrice:
        canCalculatePerUnit && breakEvenDenominator > 0 ? fixedCostPerUnit / breakEvenDenominator : null,
      suggestedPriceFor30PercentMargin:
        canCalculatePerUnit && price30Denominator > 0 ? fixedCostPerUnit / price30Denominator : null,
      suggestedPriceFor50PercentMargin:
        canCalculatePerUnit && price50Denominator > 0 ? fixedCostPerUnit / price50Denominator : null,
      suggestedPriceForTargetMargin:
        canCalculatePerUnit && !targetMarginInvalid && targetDenominator > 0
          ? fixedCostPerUnit / targetDenominator
          : null,
    },
    errors: [
      ...(quantityNonPositive ? ["quantityNonPositive"] : []),
      ...(targetMarginInvalid ? ["targetMarginInvalid"] : []),
    ],
    warnings: [
      ...(breakEvenDenominator <= 0 ? ["breakEvenDenominatorNonPositive"] : []),
      ...(breakEvenDenominatorNearZero ? ["breakEvenDenominatorNearZero"] : []),
      ...(!targetMarginInvalid && targetDenominator <= 0 ? ["targetDenominatorNonPositive"] : []),
    ],
  };
}
