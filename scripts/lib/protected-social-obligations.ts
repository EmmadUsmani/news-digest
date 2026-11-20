import { llmRepairRequest } from '../../apps/api/src/modules/curation/application/budgeted-llm';
import { SocialPostEditor } from '../../apps/api/src/modules/curation/application/social-editor';
import { maximumValidationRepairFeedback } from '../../apps/api/src/modules/curation/application/validation-failure';
import type {
  LlmRequest,
  ModelPrice,
} from '../../apps/api/src/modules/curation/domain/llm.port';
import { assertProtectedObligationIdentity } from './protected-obligation-identity';

// Offline only. Bounds one supplied social-editor context, including both model
// attempts and their possible repairs. The repair text is a size bound, not an
// executable request capture. Never use these requests for exact ledger holds.
// Callers still own platform/topic/context completeness and other morning work.
export async function protectedSocialObligations(input: {
  sonnet: ModelPrice;
  haiku: ModelPrice;
  args: Parameters<SocialPostEditor['editOutcome']>;
}) {
  assertProtectedObligationIdentity(input.args[3], [input.args[0].id]);
  const initial: LlmRequest[] = [];
  const editor = new SocialPostEditor(
    {
      json: () => Promise.reject(new Error('Offline outcome capture required')),
      jsonOutcome: (request) => {
        initial.push(structuredClone(request));
        return Promise.resolve({ status: 'validation-failed' as const });
      },
    },
    input.sonnet,
    input.haiku,
  );
  await editor.editOutcome(...input.args);
  const feedback = maximumValidationRepairFeedback();
  return {
    purpose:
      'Offline conservative social obligations; not executable captures or complete morning admission.',
    requests: initial.flatMap((request) => [
      request,
      llmRepairRequest(request, feedback),
    ]),
  };
}
