import {
  developingCapturedRequests,
  type DevelopingRequestCaptures,
} from '../../apps/api/src/modules/curation/application/developing-captured-requests';
import { developingEditionBudget } from './developing-edition-budget';
type BudgetInput = Parameters<typeof developingEditionBudget>[0];

export function developingCapturedPlan(
  input: DevelopingRequestCaptures & {
    budget: Omit<BudgetInput, 'requests'>;
  },
) {
  const requests = developingCapturedRequests(input);
  return {
    editionId: input.editionId,
    topicCount: input.topicIds.length,
    requestCount: requests.length,
    ...developingEditionBudget({ ...input.budget, requests }),
  };
}
