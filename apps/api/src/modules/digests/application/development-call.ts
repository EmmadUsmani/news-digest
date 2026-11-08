import type {
  DevelopmentProvider,
  DevelopmentSpendPort,
} from '../domain/development-spend.port';

export type DevelopmentCallResult<T> =
  | { status: 'disabled' | 'replay' }
  | { status: 'budget-refused'; mustReport: boolean }
  | { status: 'complete'; value: T; mustReport: boolean };

/** Development-only orchestration. The caller supplies a conservative billing
 * bound and a stable per-attempt ID, including across job retries.
 * Provider/transport errors and failed settlement deliberately retain the hold.
 * There is no retry, automatic release, or production-ledger dependency here.
 */
export class DevelopmentCall {
  constructor(private readonly spend: DevelopmentSpendPort) {}

  async run<T>(
    request: {
      enabled: boolean;
      id: string;
      provider: DevelopmentProvider;
      maxCostMicros: number;
    },
    call: () => Promise<{ value: T; costMicros: number }>,
  ): Promise<DevelopmentCallResult<T>> {
    if (!request.enabled) return { status: 'disabled' };
    const reservation = await this.spend.reserve(
      request.id,
      request.provider,
      request.maxCostMicros,
    );
    if (!reservation.admitted)
      return { status: 'budget-refused', mustReport: reservation.mustReport };
    if (reservation.replay) return { status: 'replay' };

    const response = await call();
    if (!Number.isSafeInteger(response.costMicros) || response.costMicros < 0)
      throw new Error('Unconfirmed development call cost');
    // Charge even an unexpectedly large confirmed bill; hiding it behind the
    // estimate would undercount spend. The ledger reports the resulting limit.
    const allowance = await this.spend.settle(request.id, response.costMicros);
    return {
      status: 'complete',
      value: response.value,
      mustReport: reservation.mustReport || allowance.mustReport,
    };
  }
}
