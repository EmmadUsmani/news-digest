import { llmRepairRequest } from '../../apps/api/src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../../apps/api/src/modules/curation/application/editor';
import { maximumValidationRepairFeedback } from '../../apps/api/src/modules/curation/application/validation-failure';
import type {
  LlmRequest,
  ModelPrice,
} from '../../apps/api/src/modules/curation/domain/llm.port';
import { assertProtectedObligationIdentity } from './protected-obligation-identity';

// Offline size bounds only, never executable captures or exact ledger holds.
// Callers still own topic/context completeness and all other morning work.
export async function protectedStoryObligations(input: {
  sonnet: ModelPrice;
  haiku: ModelPrice;
  args: Parameters<ShortlistEditor['edit']>;
}) {
  assertProtectedObligationIdentity(input.args[3], [input.args[0].id]);
  const initial: LlmRequest[] = [];
  const editor = new ShortlistEditor(
    {
      json: (request) => {
        initial.push(structuredClone(request));
        return Promise.resolve(null);
      },
    },
    input.sonnet,
    input.haiku,
  );
  // Input capture callbacks belong to execution, not offline accounting.
  const [topic, candidates, budget, runId] = input.args;
  await editor.edit(topic, candidates, budget, runId);
  const feedback = maximumValidationRepairFeedback();
  return {
    purpose:
      'Offline conservative story obligations; not executable captures or complete morning admission.',
    requests: initial.flatMap((request, index) => {
      // The real editor retains fixed validation hints from BOTH Sonnet
      // attempts in Haiku instructions. Capture-with-null does not invoke its
      // validator, so explicitly bound those two possible accumulated hints.
      const bounded =
        index === 0
          ? request
          : {
              ...request,
              instructions: request.instructions + feedback.repeat(2),
            };
      return [bounded, llmRepairRequest(bounded, feedback)];
    }),
  };
}
