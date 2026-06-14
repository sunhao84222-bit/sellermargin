export type CalculationResponse<T> = {
  result: T | null;
  errors: string[];
  warnings: string[];
};

export type CustomsValuationMethod = "cif" | "fob";
