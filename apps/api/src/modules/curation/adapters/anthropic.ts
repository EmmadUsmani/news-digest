import Anthropic from '@anthropic-ai/sdk';

import {
  LlmPort,
  type LlmRequest,
  type LlmResponse,
  ProviderSpendLimit,
} from '../domain/llm.port';

export function isProviderSpendLimit(status: number, body: unknown): boolean {
  const text = JSON.stringify(body)?.toLowerCase() ?? '';
  return (
    (status === 400 &&
      text.includes('invalid_request_error') &&
      text.includes('workspace api usage limits')) ||
    (status === 429 && text.includes('enforced_spend_limit_reached'))
  );
}
export class AnthropicLlmAdapter extends LlmPort {
  private readonly client: Anthropic;
  constructor(
    apiKey: string,
    fetch?: typeof globalThis.fetch,
    private readonly wait: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
  ) {
    super();
    // Only explicit, rejected rate-limit requests may retry within a reservation.
    // Keep SDK retries disabled for transport failures and spend-limit errors.
    this.client = new Anthropic({
      apiKey,
      maxRetries: 0,
      timeout: 60000,
      fetch,
    });
  }
  async complete(request: LlmRequest): Promise<LlmResponse> {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: request.model.id,
          max_tokens: request.maxOutputTokens,
          system: [
            {
              type: 'text',
              text: request.instructions,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: request.prompt }],
        });
        return {
          text: response.content
            .flatMap((part) => (part.type === 'text' ? [part.text] : []))
            .join('\n'),
          usage: {
            input: response.usage.input_tokens,
            cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
            cacheRead: response.usage.cache_read_input_tokens ?? 0,
            output: response.usage.output_tokens,
          },
        };
      } catch (error) {
        if (
          error instanceof Anthropic.APIError &&
          isProviderSpendLimit(
            typeof error.status === 'number' ? error.status : 0,
            error.error,
          )
        )
          throw new ProviderSpendLimit('anthropic-spend-limit');
        // A 429 rejection incurred no inference usage. Preserve the existing
        // reservation across at most two retries; never retry uncertain failures.
        if (
          error instanceof Anthropic.APIError &&
          error.status === 429 &&
          attempt < 2
        ) {
          const headers: unknown = error.headers;
          const delay = rateLimitDelay(
            headers instanceof Headers ? headers.get('retry-after') : null,
            attempt,
          );
          // Do not retry earlier than a provider deadline beyond our wait budget.
          if (delay !== null) {
            await this.wait(delay);
            continue;
          }
        }
        throw error;
      }
    }
  }
}

// Total backoff is bounded to 20 seconds per logical call. Longer provider
// deadlines propagate immediately so callers can degrade without blocking.
export function rateLimitDelay(
  header: string | null,
  attempt: number,
  now = Date.now(),
): number | null {
  const fallback = 1000 * 2 ** attempt;
  if (header === null) return fallback;
  const seconds = /^\d+(?:\.\d+)?$/.test(header.trim())
    ? Number(header) * 1000
    : NaN;
  const parsed = Number.isFinite(seconds) ? seconds : Date.parse(header) - now;
  const delay = Number.isFinite(parsed) ? Math.max(fallback, parsed) : fallback;
  return delay <= 10000 ? delay : null;
}
