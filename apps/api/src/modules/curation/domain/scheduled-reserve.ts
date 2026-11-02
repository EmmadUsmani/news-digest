// All amounts are integer microdollars. Callers must calculate this policy under
// the shared ledger lock, using the ledger's UTC clock and durable run state.
export interface ScheduledReservePolicy {
  // Explicit reserve overrides measured sizing, including an intentional zero.
  configuredMicros?: number;
  headroom: number;
}
export type ScheduledEditionState =
  'pending' | 'running' | 'retrying' | 'succeeded' | 'failed'; // Definitive failure only; retries retain protection.

export interface ScheduledReserveInput {
  dailyCap: number;
  available: number;
  todayUsed: number;
  recentFullAiEditionCosts: readonly number[];
  state: ScheduledEditionState;
  scheduledRun: boolean;
}

export function scheduledReserveAllowance(
  input: ScheduledReserveInput,
  policy: ScheduledReservePolicy,
) {
  const amounts = [
    input.dailyCap,
    input.available,
    input.todayUsed,
    ...input.recentFullAiEditionCosts,
    ...(policy.configuredMicros === undefined ? [] : [policy.configuredMicros]),
  ];
  if (amounts.some((n) => !Number.isSafeInteger(n) || n < 0))
    throw new Error('Invalid scheduled reserve amount');
  if (!Number.isFinite(policy.headroom) || policy.headroom < 1)
    throw new Error('Invalid scheduled reserve headroom');
  if (
    !['pending', 'running', 'retrying', 'succeeded', 'failed'].includes(
      input.state,
    )
  )
    throw new Error('Invalid scheduled edition state');

  // Use the largest recent complete AI edition rather than an average that
  // could underfund a busy day. Zero-cost cache-only editions cannot establish
  // the cost of fresh work. Without measurements, protect the whole daily cap.
  const positiveCosts = input.recentFullAiEditionCosts.filter(
    (cost) => cost > 0,
  );
  const measured = positiveCosts.reduce(
    (largest, cost) => Math.max(largest, cost),
    0,
  );
  const target =
    policy.configuredMicros ??
    (measured ? Math.ceil(measured * policy.headroom) : input.dailyCap);
  const sizedReserve = Math.min(input.dailyCap, target);
  const released = input.state === 'succeeded' || input.state === 'failed';
  const reserveMicros = released ? 0 : sizedReserve;
  // Keep the full reserve until terminal completion. Scheduled calls still obey
  // the ordinary monthly/daily/model caps; this policy never adds funds.
  const otherSpendLimitMicros = input.dailyCap - reserveMicros;
  const otherAvailableMicros = Math.max(
    0,
    Math.min(input.available, otherSpendLimitMicros - input.todayUsed),
  );
  return {
    sizedReserveMicros: sizedReserve,
    reserveMicros,
    otherSpendLimitMicros,
    otherAvailableMicros,
    availableMicros: input.scheduledRun
      ? input.available
      : otherAvailableMicros,
    limitedByReserve:
      !input.scheduledRun && otherAvailableMicros < input.available,
  };
}
