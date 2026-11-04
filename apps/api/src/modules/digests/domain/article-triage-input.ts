import { relevancePolicySchema } from '@digest/contracts';

import { qualityRejection } from './quality';
import type { Candidate } from './rank';
import { assessRelevance } from './relevance';

export interface ArticleTriageSettings {
  id: string;
  name: string;
  description: string;
  include_guidance: string;
  exclude_guidance: string;
  relevance_policy: unknown;
}

// Edition and background work must fingerprint exactly the same input.
export function articleTriageInput(
  settings: ArticleTriageSettings,
  candidates: Candidate[],
) {
  const policy = relevancePolicySchema.parse(settings.relevance_policy);
  return {
    topic: {
      id: String(settings.id),
      name: String(settings.name),
      description: String(settings.description),
      guidance: `${settings.include_guidance}\nExclude: ${settings.exclude_guidance}\nRequired phrases: ${policy.includeAny.join(', ')}\nExcluded phrases: ${policy.excludeAny.join(', ')}`,
    },
    // Missing required phrases remain eligible for semantic relevance recovery.
    candidates: candidates.filter(
      (item) =>
        !qualityRejection(item) &&
        assessRelevance(item, { ...policy, includeAny: [] }).eligible,
    ),
  };
}
