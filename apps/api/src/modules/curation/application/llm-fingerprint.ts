import { createHash } from 'node:crypto';

import type { LlmRequest } from '../domain/llm.port';

// Keep version/order stable: existing persisted llm_cache keys use this format.
export function llmFingerprint(request: LlmRequest): string {
  return createHash('sha256')
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
}
