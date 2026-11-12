export interface TokenUsage {
  input: number;
  cacheWrite: number;
  cacheRead: number;
  output: number;
}
export interface ModelPrice {
  id: string;
  input: number;
  cacheWrite: number;
  cacheRead: number;
  output: number;
}
export interface LlmRequest {
  model: ModelPrice;
  purpose: string;
  /** Observability only; excluded from prompt/cache identity. */
  topicId?: string;
  runId: string;
  instructions: string;
  prompt: string;
  maxOutputTokens: number;
}
export interface LlmResponse {
  text: string;
  usage: TokenUsage;
}
/** Internal execution metadata; never part of prompts or persistent cache identity. */
export interface LlmExecutionContext {
  readonly deadline: number; // Absolute performance.now() time in this process.
}
export abstract class LlmPort {
  abstract complete(
    request: LlmRequest,
    execution?: LlmExecutionContext,
  ): Promise<LlmResponse>;
}
export class ProviderSpendLimit extends Error {}

/** Adapter proof that no provider request was dispatched. */
export class ProviderNotDispatched extends Error {}
