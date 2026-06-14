export function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeNonNegativeNumber(value: unknown, fallback = 0) {
  return Math.max(0, normalizeNumber(value, fallback));
}

export function percentInputToRate(value: unknown) {
  return normalizeNumber(value) / 100;
}

export function hasExtremePercentage(values: unknown[], threshold = 1000) {
  return values.some((value) => normalizeNumber(value) >= threshold);
}
