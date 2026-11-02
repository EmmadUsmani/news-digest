import type { ModelPrice, TokenUsage } from './llm.port';

// Integer microdollars; round each charge up so fractions never undercount spend.
export function costMicros(usage: TokenUsage, price: ModelPrice): number {
  const count = [usage.input, usage.cacheWrite, usage.cacheRead, usage.output];
  const rates = [price.input, price.cacheWrite, price.cacheRead, price.output];
  if (
    count.some((n) => !Number.isSafeInteger(n) || n < 0) ||
    rates.some((n) => !Number.isFinite(n) || n < 0)
  )
    throw new Error('Invalid token usage or pricing');
  const cost = Math.ceil(
    count.reduce((total, n, i) => total + n * rates[i], 0),
  );
  if (!Number.isSafeInteger(cost)) throw new Error('Cost overflow');
  return cost;
}
export function utcBudgetPeriod(now: Date) {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid budget date');
  const year = now.getUTCFullYear(),
    month = now.getUTCMonth();
  return {
    monthStart: new Date(Date.UTC(year, month, 1)),
    dayStart: new Date(Date.UTC(year, month, now.getUTCDate())),
    nextMonth: new Date(Date.UTC(year, month + 1, 1)),
    daysLeft:
      new Date(Date.UTC(year, month + 1, 0)).getUTCDate() -
      now.getUTCDate() +
      1,
  };
}
export interface BudgetTotals {
  month: number;
  today: number;
}
export interface BudgetCaps {
  monthly: number;
  dailyMax: number;
}
export function budgetAllowance(
  now: Date,
  totals: BudgetTotals,
  caps: BudgetCaps,
) {
  for (const n of [totals.month, totals.today, caps.monthly, caps.dailyMax])
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error('Invalid budget amount');
  // Base today's allocation on spend before today. Calls within a day cannot
  // shrink that day's cap; pending reservations count exactly like settled calls.
  const remainingAtStart = Math.max(
    0,
    caps.monthly - Math.max(0, totals.month - totals.today),
  );
  const dailyCap = Math.min(
    caps.dailyMax,
    Math.floor(remainingAtStart / utcBudgetPeriod(now).daysLeft),
  );
  return {
    dailyCap,
    available: Math.max(
      0,
      Math.min(caps.monthly - totals.month, dailyCap - totals.today),
    ),
  };
}
