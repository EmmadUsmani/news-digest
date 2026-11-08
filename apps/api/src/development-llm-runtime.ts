import type { Pool } from 'pg';

import { AnthropicLlmAdapter } from './modules/curation/adapters/anthropic';
import { llmConfig } from './modules/curation/adapters/config';
import type { LlmRequest } from './modules/curation/domain/llm.port';
import { developmentLlm } from './modules/curation/public/development-llm';
import { DevelopmentCall } from './modules/digests/application/development-call';
import { PostgresDevelopmentSpendRepository } from './modules/digests/database/development-spend.repository';
import type { DevelopmentSpendPort } from './modules/digests/domain/development-spend.port';

/** Explicit composition for future admin test editions. Never installed in the
 * scheduled worker. The caller owns the database pool and stable attempt IDs.
 */
export function prepareDevelopmentLlmRuntime(
  deps: { db: Pool; env?: NodeJS.ProcessEnv; fetch?: typeof globalThis.fetch },
  spend: (db: Pool) => DevelopmentSpendPort = (db) =>
    new PostgresDevelopmentSpendRepository(db),
) {
  const env = deps.env ?? process.env;
  if (env.LLM_LIVE !== '1') return null;
  if (!env.ANTHROPIC_API_KEY)
    throw new Error('Missing development Anthropic key');
  // Known model/rate pairs only; production env price overrides cannot silently
  // lower development reservations. No SDK or adapter retries in this runtime.
  const models = llmConfig({});
  const bridge = developmentLlm(
    new AnthropicLlmAdapter(
      env.ANTHROPIC_API_KEY,
      deps.fetch,
      undefined,
      undefined,
      0,
    ),
    new DevelopmentCall(spend(deps.db)),
  );
  return {
    complete(
      request: Omit<LlmRequest, 'model' | 'purpose'> & {
        role: 'haiku' | 'sonnet';
      },
      attemptId: string,
    ) {
      if (!['haiku', 'sonnet'].includes(request.role))
        throw new Error('Invalid development model role');
      if (
        !Number.isSafeInteger(request.maxOutputTokens) ||
        request.maxOutputTokens <= 0
      )
        throw new Error('Invalid development output limit');
      if (!attemptId.trim()) throw new Error('Missing development attempt ID');
      return bridge.complete(
        { ...request, model: models[request.role], purpose: 'verification' },
        { enabled: true, id: attemptId },
      );
    },
  };
}
