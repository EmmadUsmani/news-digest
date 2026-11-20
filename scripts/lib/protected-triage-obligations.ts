import { llmRepairRequest } from '../../apps/api/src/modules/curation/application/budgeted-llm';
import { CandidateTriage } from '../../apps/api/src/modules/curation/application/triage';
import { maximumValidationRepairFeedback } from '../../apps/api/src/modules/curation/application/validation-failure';
import type {
  LlmRequest,
  ModelPrice,
} from '../../apps/api/src/modules/curation/domain/llm.port';
import { assertProtectedObligationIdentity } from './protected-obligation-identity';

// Offline all-cache-miss bounds for ONE supplied pool (at most 200 items).
// Caller owns pool/topic/platform completeness and later dynamic contexts.
// These are size bounds, never executable captures or exact ledger holds.
export async function protectedTriageObligations(input: {
  model: ModelPrice;
  kind: 'article' | 'social';
  args: Pick<Parameters<CandidateTriage['score']>, 0 | 1 | 2>;
}) {
  assertProtectedObligationIdentity(input.args[2], [input.args[0].id]);
  const initial: LlmRequest[] = [];
  const triage = new CandidateTriage(
    {
      json: (request, validate) => {
        initial.push(structuredClone(request));
        const wire = JSON.parse(request.prompt) as {
          candidates: { id: string }[];
        };
        // Scripted valid output lets production batching visit the whole pool.
        return Promise.resolve(
          validate({
            items: wire.candidates.map(({ id }) => ({
              id,
              relevance: 0,
              importance: 0,
              event: 'Offline',
              rationale: 'Offline',
            })),
          }),
        );
      },
    },
    {
      cached: () => Promise.resolve(undefined),
      cache: () => Promise.resolve(),
    },
    input.model,
    input.kind,
  );
  await triage.score(input.args[0], input.args[1], input.args[2]);
  const feedback = maximumValidationRepairFeedback();
  return {
    purpose:
      'Offline conservative triage obligations; not executable captures or complete morning admission.',
    requests: initial.flatMap((request) => [
      request,
      llmRepairRequest(request, feedback),
    ]),
  };
}
