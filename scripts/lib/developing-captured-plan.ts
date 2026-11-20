import type { LlmRequest } from '../../apps/api/src/modules/curation/domain/llm.port';
import { developingEditionBudget } from './developing-edition-budget';

type Capture = {
  editionId: string;
  topicId: string;
  status: string;
  request: LlmRequest | null;
};
type BudgetInput = Parameters<typeof developingEditionBudget>[0];

// Deliberately accepts only complete captures. An unavailable rewrite is not
// evidence that a future matcher cannot find a continuation requiring one.
export function developingCapturedPlan(input: {
  editionId: string;
  topicIds: readonly string[];
  matching: readonly Capture[];
  rewrites: readonly Capture[];
  additionalRequests: readonly LlmRequest[];
  budget: Omit<BudgetInput, 'requests'>;
}) {
  const topics = new Set(input.topicIds);
  if (
    !input.editionId.trim() ||
    !topics.size ||
    topics.size !== input.topicIds.length ||
    input.topicIds.some((id) => !id.trim())
  )
    throw new Error('Invalid expected edition coverage');
  const requests: LlmRequest[] = [];
  for (const [purpose, captures] of [
    ['story-grouping-v3', input.matching],
    ['developing-rewrite', input.rewrites],
  ] as const) {
    const seen = new Set<string>();
    for (const capture of captures) {
      if (
        capture.editionId !== input.editionId ||
        !topics.has(capture.topicId) ||
        seen.has(capture.topicId)
      )
        throw new Error('Ambiguous edition capture coverage');
      seen.add(capture.topicId);
      if (capture.status !== 'request-ready' || !capture.request)
        throw new Error('Incomplete edition request capture');
      if (capture.request.topicId !== capture.topicId)
        throw new Error('Request topic differs from capture');
      if (capture.request.purpose !== purpose)
        throw new Error('Request purpose differs from capture stage');
      if (capture.request.runId !== input.editionId)
        throw new Error('Request run differs from capture edition');
      requests.push(capture.request);
    }
    if (seen.size !== topics.size)
      throw new Error('Missing edition topic capture');
  }
  if (
    input.additionalRequests.some(
      (request) => request.runId !== input.editionId,
    )
  )
    throw new Error('Additional request run differs from capture edition');
  requests.push(...input.additionalRequests);
  return {
    editionId: input.editionId,
    topicCount: topics.size,
    requestCount: requests.length,
    ...developingEditionBudget({ ...input.budget, requests }),
  };
}
