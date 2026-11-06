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
export abstract class LlmPort {
  abstract complete(request: LlmRequest): Promise<LlmResponse>;
}
export class ProviderSpendLimit extends Error {}
