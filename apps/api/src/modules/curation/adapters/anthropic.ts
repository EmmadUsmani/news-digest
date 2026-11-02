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
  constructor(apiKey: string, fetch?: typeof globalThis.fetch) {
    super();
    // SDK retries would create unreserved calls and hide spend-limit failures.
    this.client = new Anthropic({
      apiKey,
      maxRetries: 0,
      timeout: 60000,
      fetch,
    });
  }
  async complete(request: LlmRequest): Promise<LlmResponse> {
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
      throw error;
    }
  }
}
