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
  cache(key: string, response: unknown): Promise<void>;
}
