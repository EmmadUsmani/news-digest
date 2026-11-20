import { EventGrouping } from '../../apps/api/src/modules/curation/application/event-grouping';
import type {
  LlmRequest,
  ModelPrice,
} from '../../apps/api/src/modules/curation/domain/llm.port';

type GroupingInput =
  | { kind: 'topic'; args: Parameters<EventGrouping['groupWithResult']> }
  | { kind: 'joint'; args: Parameters<EventGrouping['assignTopics']> };

// Offline supplied-pool accounting only. Dynamic pool and morning-stage
// completeness remain the caller's responsibility; this never acquires holds.
export async function protectedGroupingObligations(
  input: GroupingInput & { model: ModelPrice },
) {
  const requests: LlmRequest[] = [];
  const grouping = new EventGrouping(
    {
      json: (request) => {
        requests.push(structuredClone(request));
        return Promise.resolve(null);
      },
    },
    input.model,
  );
  let refusal: string | null = null;
  if (input.kind === 'topic') {
    // Execution observers/deadlines do not belong to offline accounting.
    const [topic, candidates, runId] = input.args;
    const result = await grouping.groupWithResult(topic, candidates, runId);
    if (
      result.status === 'unavailable' &&
      result.reason !== 'no-result' &&
      result.reason !== 'small-pool'
    )
      refusal = result.reason;
  } else {
    const result = await grouping.assignTopics(...input.args);
    if (result === null && requests.length === 0)
      refusal = 'joint-input-refused';
  }
  // A rejected input is not a successful zero-cost obligation.
  if (refusal) throw new Error(`Protected grouping unavailable: ${refusal}`);
  return {
    purpose:
      'Offline supplied-pool grouping obligations; not complete morning admission.',
    // Both production routes explicitly disable repair and have no model fallback.
    requests,
  };
}
