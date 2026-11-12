import type { LlmRequest, TokenUsage } from './llm.port';

export type LlmRefusalReason =
  | 'verification-cap'
  | 'provider-blocked'
  | 'monthly-cap'
  | 'daily-cap'
  | 'scheduled-reserve'
  | 'model-allocation';

export type LlmReservationResult =
  | { status: 'admitted'; id: string }
  | {
      status: 'refused';
      reasons: LlmRefusalReason[];
      estimateMicros: number;
      sharedAvailableMicros: number;
      availableMicros: number;
      modelAvailableMicros: number | null;
      pendingHolds: {
        id: string;
        model: string;
        reservedMicros: number;
        createdAt: string;
      }[];
      // An overflow snapshot cannot justify waiting; no partial ID set is exposed.
      pendingHoldsOverflow: boolean;
    };

export interface LlmLedger {
  // Optional capability while immediate-admission callers and replay adapters migrate.
  reserveDetailed?(
    request: LlmRequest,
    estimate: number,
  ): Promise<LlmReservationResult>;
  // Follow only the original bounded snapshot; never discover new competing holds.
  pendingOriginalHolds?(
    model: string,
    originalIds: string[],
  ): Promise<string[]>;
  reserve(request: LlmRequest, estimate: number): Promise<string | null>;
  settle(id: string, usage: TokenUsage, cost: number): Promise<void>;
  fail(
    id: string,
    code: string,
    providerLimit: boolean,
    uncertain: boolean,
  ): Promise<void>;
  cached(key: string): Promise<unknown>;
  // Optional bulk lookup; missing keys are omitted, values still need validation.
  cachedMany?(keys: string[]): Promise<Map<string, unknown>>;
  cache(key: string, response: unknown): Promise<void>;
  // Atomic insert-only batch; existing keys keep their first successful value.
  cacheMany?(entries: { key: string; response: unknown }[]): Promise<void>;
}
