import { ZodError } from 'zod';

import { logger } from '../../../libs/observability/logging';
import { costMicros } from '../domain/budget';
import {
  type LlmPort,
  type LlmRequest,
  ProviderSpendLimit,
} from '../domain/llm.port';
import type { LlmLedger } from '../domain/llm-ledger.port';
import { llmFingerprint } from './llm-fingerprint';
import {
  LlmValidationFailure,
  type ValidationDiagnostic,
} from './validation-failure';

export class BudgetedLlm {
  private readonly failures: ValidationDiagnostic[] = [];
  validationDiagnostics(): ValidationDiagnostic[] {
    return this.failures.map((failure) => ({ ...failure }));
  }
  private recordFailure(
    request: LlmRequest,
    error: unknown,
    attempt: ValidationDiagnostic['attempt'],
    invalidJson = false,
  ) {
    const diagnostic: ValidationDiagnostic = {
      attempt,
      category: invalidJson
        ? 'invalid-json'
        : error instanceof LlmValidationFailure
          ? error.code
          : error instanceof ZodError
            ? 'invalid-schema'
            : 'validator-error',
    };
    this.failures.push(diagnostic);
    // Persist only fixed categories and identifiers, never rejected output,
    // source text, exception messages, schema details or repair feedback.
    this.log.info(
      {
        event: 'llm.validation',
        target: 'anthropic',
        runId: request.runId,
        model: request.model.id,
        requestFingerprint: llmFingerprint(request),
        ...diagnostic,
      },
      'LLM response rejected',
    );
    if (this.failures.length > 32) this.failures.shift();
  }
  private readonly pending = new Map<string, Promise<unknown>>();
  constructor(
    private readonly llm: LlmPort,
    private readonly ledger: LlmLedger,
    private readonly log = logger,
  ) {}
  async json<T>(
    request: LlmRequest,
    validate: (value: unknown) => T,
    options: { repair?: boolean } = {},
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
    const key = llmFingerprint(request);
    const pendingKey = `${key}:${options.repair !== false}`;
    const existing = this.pending.get(pendingKey);
    if (existing) {
      const result = await existing;
      return result === null ? null : validate(result);
    }
    const work = this.resolve(request, key, validate, options.repair !== false);
    this.pending.set(pendingKey, work);
    try {
      return await work;
    } finally {
      // Refusals and errors must not become a permanent in-memory cache.
      this.pending.delete(pendingKey);
    }
  }
  private async resolve<T>(
    request: LlmRequest,
    key: string,
    validate: (value: unknown) => T,
    repair: boolean,
  ): Promise<T | null> {
    const cached = await this.ledger.cached(key);
    if (cached !== undefined) {
      try {
        return validate(cached);
      } catch (error) {
        this.recordFailure(request, error, 'cache');
        throw error;
      }
    }
    // Each repair is separately reserved and recorded. Only rejected rate-limit requests may retry inside the adapter.
    let feedback = '';
    for (let attempt = 0; attempt < (repair ? 2 : 1); attempt++) {
      const current = attempt
        ? {
            ...request,
            prompt:
              request.prompt +
              '\nReturn only valid JSON matching the requested schema. No markdown fences.' +
              feedback,
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
      this.log.info(
        {
          event: 'budget.decision',
          target: 'anthropic',
          runId: request.runId,
          model: current.model.id,
          attempt: attempt + 1,
          estimateMicros: estimate,
          outcome: id ? 'admitted' : 'refused',
        },
        'LLM budget decision',
      );
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
        this.log.info(
          {
            event: 'budget.failure',
            target: 'anthropic',
            runId: request.runId,
            attempt: attempt + 1,
            outcome: limit ? 'released' : 'held-uncertain',
            reason: limit ? 'provider-spend-limit' : 'provider-call-failed',
          },
          'LLM budget failure recorded',
        );
        return null;
      }
      await this.ledger.settle(
        id,
        response.usage,
        costMicros(response.usage, current.model),
      );
      this.log.info(
        {
          event: 'budget.settlement',
          target: 'anthropic',
          runId: request.runId,
          attempt: attempt + 1,
          costMicros: costMicros(response.usage, current.model),
        },
        'LLM budget settled',
      );
      let parsed: T;
      let decoded: unknown;
      try {
        decoded = JSON.parse(response.text) as unknown;
      } catch (error) {
        this.recordFailure(
          request,
          error,
          attempt ? 'repair' : 'initial',
          true,
        );
        feedback = '';
        continue;
      }
      try {
        parsed = validate(decoded);
      } catch (error) {
        // Only application-owned feedback is sent: never raw provider output,
        // schema errors, source text or exception messages.
        this.recordFailure(request, error, attempt ? 'repair' : 'initial');
        feedback = error instanceof LlmValidationFailure ? error.feedback : '';
        continue;
      }
      await this.ledger.cache(key, parsed);
      return parsed;
    }
    return null;
  }
}
