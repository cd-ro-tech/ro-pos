export type AmountTotal = { currency_code: string; amount: number };
// Aggregate before pagination; each currency keeps its own minor-unit total.
export function amountTotals(rows: {currency_code: string; [key: string]: any}[], key: string): AmountTotal[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.currency_code, (totals.get(row.currency_code) || 0) + Math.round((Number(row[key]) + Number.EPSILON) * 100));
  }
  return [...totals].sort(([a], [b]) => a.localeCompare(b)).map(([currency_code, cents]) => ({currency_code, amount: cents / 100}));
}
