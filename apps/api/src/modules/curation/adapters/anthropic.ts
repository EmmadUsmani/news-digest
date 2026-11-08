import Anthropic from '@anthropic-ai/sdk';

import { measuredFetch } from '../../../libs/observability/external-metrics';
import { logger } from '../../../libs/observability/logging';
import { llmFingerprint } from '../application/llm-fingerprint';
import { costMicros } from '../domain/budget';
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
// Shared across adapters and editorial services in this process. API and worker
// have independent limits; this does not coordinate separate processes.
class InferenceSlots {
  private active = 0;
  private readonly waiting: (() => void)[] = [];

  async run<T>(work: () => Promise<T>): Promise<T> {
    if (this.active < 4) this.active++;
    else await new Promise<void>((resolve) => this.waiting.push(resolve));
    try {
      return await work();
    } finally {
      const next = this.waiting.shift();
      if (next)
        next(); // Transfer the occupied slot directly to the next caller.
      else this.active--;
    }
  }
}
const inferenceSlots = new InferenceSlots();

export class AnthropicLlmAdapter extends LlmPort {
  private readonly client: Anthropic;
  constructor(
    apiKey: string,
    fetch?: typeof globalThis.fetch,
    private readonly wait: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
    private readonly log = logger,
    private readonly rateLimitRetries = 2,
  ) {
    super();
    // Only explicit, rejected rate-limit requests may retry within a reservation.
    // Keep SDK retries disabled for transport failures and spend-limit errors.
    this.client = new Anthropic({
      apiKey,
      maxRetries: 0,
      timeout: 60000,
      fetch: measuredFetch('anthropic', fetch ?? globalThis.fetch),
    });
  }
  complete(request: LlmRequest): Promise<LlmResponse> {
    // Retain the slot during backoff to avoid increasing pressure on rejection.
    return inferenceSlots.run(() => this.completeWithRetries(request));
  }
  private async completeWithRetries(request: LlmRequest): Promise<LlmResponse> {
    for (let attempt = 0; ; attempt++) {
      const started = performance.now();
      const fields = {
        event: 'external.call',
        target: 'anthropic',
        model: request.model.id,
        purpose: request.purpose,
        requestFingerprint: llmFingerprint(request),
        runId: request.runId,
        attempt: attempt + 1,
      };
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
        const usage = {
          input: response.usage.input_tokens,
          cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
          cacheRead: response.usage.cache_read_input_tokens ?? 0,
          output: response.usage.output_tokens,
        };
        this.log.info(
          {
            ...fields,
            outcome: 'success',
            // Allowlist provider metadata; never persist arbitrary response text.
            completionReason: [
              'end_turn',
              'max_tokens',
              'stop_sequence',
              'tool_use',
              'pause_turn',
              'refusal',
            ].includes(response.stop_reason ?? '')
              ? response.stop_reason
              : 'unknown',
            outputLimit: request.maxOutputTokens,
            durationMs: Math.round(performance.now() - started),
            usage,
            costMicros: costMicros(usage, request.model),
          },
          'External HTTP call',
        );
        return {
          text: response.content
            .flatMap((part) => (part.type === 'text' ? [part.text] : []))
            .join('\n'),
          usage,
        };
      } catch (error) {
        // Never log SDK errors: they can contain request headers and response bodies.
        this.log.info(
          {
            ...fields,
            status:
              error instanceof Anthropic.APIError ? error.status : undefined,
            outcome: 'failure',
            durationMs: Math.round(performance.now() - started),
          },
          'External HTTP call',
        );
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
          attempt < this.rateLimitRetries
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
