/** Lifetime development accounting only; production budgets use separate ports.
 * All monetary values are integer microdollars. No hold expires automatically.
 */
export type DevelopmentProvider = 'anthropic' | 'xai';

export interface DevelopmentAllowance {
  capMicros: number;
  stopAtMicros: number;
  availableMicros: number;
  mustReport: boolean;
}

export interface DevelopmentSpendStatus extends DevelopmentAllowance {
  provider: DevelopmentProvider;
  chargedMicros: number;
  heldMicros: number;
  unresolvedCount: number;
  committedMicros: number;
}

export type DevelopmentReservation =
  | { admitted: false; mustReport: boolean }
  | { admitted: true; replay: true }
  | { admitted: true; replay: false; mustReport: boolean };

export interface DevelopmentSpendPort {
  status(provider: DevelopmentProvider): Promise<DevelopmentSpendStatus>;
  /** Reserve before a provider call. Replays must never execute the call again. */
  reserve(
    id: string,
    provider: DevelopmentProvider,
    amountMicros: number,
  ): Promise<DevelopmentReservation>;
  /** Confirm billing, or release with confirmed zero; unknown outcomes stay held. */
  settle(id: string, costMicros: number): Promise<DevelopmentAllowance>;
}
