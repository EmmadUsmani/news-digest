import type { LlmRequest } from '../../apps/api/src/modules/curation/domain/llm.port';
import { assertProtectedObligationIdentity } from './protected-obligation-identity';

type Stage =
  'article-triage' | 'social-triage' | 'grouping' | 'story' | 'social';
export interface ProtectedWorkSlot {
  stage: Stage;
  // Joint grouping names every participating topic; other stages name one.
  topicIds: readonly string[];
  // Distinguishes separate pools/platforms/contexts within a stage.
  contextId: string;
}

// Offline coverage of a caller-declared remaining-work inventory only. This
// cannot prove that the inventory covers future dynamic pools or contexts.
// Conservative bounds are never executable captures or exact ledger holds.
export function protectedWorkManifest(input: {
  editionId: string;
  topicIds: readonly string[];
  expected: readonly ProtectedWorkSlot[];
  supplied: readonly {
    slot: ProtectedWorkSlot;
    requests: readonly LlmRequest[];
  }[];
}) {
  assertProtectedObligationIdentity(input.editionId, input.topicIds);
  const topics = new Set(input.topicIds);
  const stages = new Set<Stage>([
    'article-triage',
    'social-triage',
    'grouping',
    'story',
    'social',
  ]);
  const key = (slot: ProtectedWorkSlot) => {
    assertProtectedObligationIdentity(input.editionId, slot.topicIds);
    if (
      !stages.has(slot.stage) ||
      !slot.contextId.trim() ||
      slot.topicIds.some((id) => !topics.has(id)) ||
      (slot.stage !== 'grouping' && slot.topicIds.length !== 1)
    )
      throw new Error('Invalid protected work slot');
    return JSON.stringify([
      slot.stage,
      [...slot.topicIds].sort(),
      slot.contextId,
    ]);
  };
  const expected = new Set(input.expected.map(key));
  if (expected.size !== input.expected.length)
    throw new Error('Duplicate expected protected work slot');
  const seen = new Set<string>();
  const requests: LlmRequest[] = [];
  for (const capture of input.supplied) {
    const id = key(capture.slot);
    if (!expected.has(id) || seen.has(id))
      throw new Error('Unexpected or duplicate protected work slot');
    seen.add(id);
    for (const request of capture.requests) {
      if (
        request.runId !== input.editionId ||
        (capture.slot.topicIds.length === 1
          ? request.topicId !== capture.slot.topicIds[0]
          : request.topicId !== undefined)
      )
        throw new Error('Protected request attribution differs from slot');
      requests.push(structuredClone(request));
    }
  }
  if (seen.size !== expected.size)
    throw new Error('Missing protected work slot');
  return {
    purpose:
      'Offline declared-inventory coverage; not complete morning admission.',
    slotCount: seen.size,
    requests,
  };
}
