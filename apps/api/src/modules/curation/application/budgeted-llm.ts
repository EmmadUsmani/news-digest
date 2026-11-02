import { createHash } from 'node:crypto';

import { costMicros } from '../domain/budget';
import {
  type LlmPort,
  type LlmRequest,
  ProviderSpendLimit,
} from '../domain/llm.port';
import type { LlmLedger } from '../domain/llm-ledger.port';

export class BudgetedLlm {
  constructor(
    private readonly llm: LlmPort,
    private readonly ledger: LlmLedger,
  ) {}
  async json<T>(
    request: LlmRequest,
    validate: (value: unknown) => T,
  ): Promise<T | null> {
    if (
      !Number.isSafeInteger(request.maxOutputTokens) ||
      request.maxOutputTokens < 1 ||
      request.maxOutputTokens > 16000
    )
      throw new Error('Invalid output limit');
    // A UTF-8 byte bound is deliberately more conservative than a tokenizer.
    // Includes framing allowance, and charges all input at cache-write pricing.
    const inputBound =
      Buffer.byteLength(request.instructions + request.prompt, 'utf8') + 2048;
    if (inputBound >= 100000)
      throw new Error('Split prompt below 100k token bound');
    const key = createHash('sha256')
      .update(
        JSON.stringify({
          version: 1,
          model: request.model.id,
          instructions: request.instructions,
          prompt: request.prompt,
          maxOutputTokens: request.maxOutputTokens,
        }),
      )
      .digest('hex');
    const cached = await this.ledger.cached(key);
    if (cached !== undefined) return validate(cached);
    // Each repair is separately reserved and recorded. No network retries.
    for (let attempt = 0; attempt < 2; attempt++) {
      const current = attempt
        ? {
            ...request,
            prompt:
              request.prompt +
              '\nReturn only valid JSON matching the requested schema. No markdown fences.',
          }
        : request;
      const bound =
        Buffer.byteLength(current.instructions + current.prompt, 'utf8') + 2048;
      if (bound >= 100000) return null;
      const estimate = costMicros(
        {
          input: bound,
          cacheWrite: 0,
          cacheRead: 0,
          output: current.maxOutputTokens,
        },
        {
          ...current.model,
          input: Math.max(
            current.model.input,
            current.model.cacheWrite,
            current.model.cacheRead,
          ),
        },
      );
      const id = await this.ledger.reserve(current, estimate);
      if (!id) return null;
      let response;
      try {
        response = await this.llm.complete(current);
      } catch (error) {
        const limit = error instanceof ProviderSpendLimit;
        // Transport failures can occur after provider completion: retain the
        // reservation until reconciled. Never persist raw errors or prompts.
        await this.ledger.fail(
          id,
          limit ? 'provider-spend-limit' : 'provider-call-failed',
          limit,
          !limit,
        );
        return null;
      }
      await this.ledger.settle(
        id,
        response.usage,
        costMicros(response.usage, current.model),
      );
      let parsed: T;
      try {
        parsed = validate(JSON.parse(response.text) as unknown);
      } catch {
        continue;
      }
      await this.ledger.cache(key, parsed);
      return parsed;
    }
    return null;
  }
}
