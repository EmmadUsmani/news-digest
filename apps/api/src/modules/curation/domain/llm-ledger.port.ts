import type { LlmRequest, TokenUsage } from './llm.port';

export interface LlmLedger {
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
}
