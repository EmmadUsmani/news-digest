import { relevancePolicySchema } from '@digest/contracts';

import {
  articleTriageInput,
  type ArticleTriageSettings,
} from '../domain/article-triage-input';
import { editorialShortlist } from '../domain/editorial-shortlist';
import type { Candidate } from '../domain/rank';
import {
  jointStoryShortlists,
  type OwnershipPort,
} from './joint-story-shortlists';
import { jointStoryTriage, type TriagePort } from './joint-story-triage';

export const politicsTopicIds = [
  '00000000-0000-4000-8000-000000000014',
  '00000000-0000-4000-8000-000000000015',
];

// Both scopes see the same bounded reporting pool. Ownership is decided jointly
// before either editor can publish; any refusal withholds stories in both scopes.
export async function politicsStories(
  pools: { settings: ArticleTriageSettings; candidates: Candidate[] }[],
  triage: TriagePort,
  ownership: OwnershipPort | null,
  start: Date,
  end: Date,
  runId: string,
) {
  const byId = new Map<string, Candidate>();
  for (const { candidates } of pools)
    for (const item of candidates) {
      const prior = byId.get(item.id);
      byId.set(
        item.id,
        prior
          ? {
              ...prior,
              sources: [...new Set([...prior.sources, ...item.sources])],
            }
          : item,
      );
    }
  const candidates = [...byId.values()]
    .sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id),
    )
    .slice(0, 200);
  const inputs = pools.map(({ settings }) =>
    articleTriageInput(settings, candidates),
  );
  const eligible = candidates.filter((item) =>
    inputs.every((input) => input.candidates.some((c) => c.id === item.id)),
  );
  const scores = await jointStoryTriage(
    triage,
    inputs.map((input) => input.topic),
    eligible,
    runId,
  );
  if (!scores) return null;
  const selected = pools.map(({ settings }, index) => ({
    scope: inputs[index].topic,
    candidates: editorialShortlist(
      eligible,
      scores.get(settings.id)!.scores,
      relevancePolicySchema.parse(settings.relevance_policy),
      start,
      end,
      undefined,
      40,
    ).shortlist.slice(0, 20),
  }));
  const ranked = await jointStoryShortlists(
    ownership,
    selected,
    start,
    end,
    runId,
    {
      score: (scope, items) =>
        Promise.resolve({
          scores: scores
            .get(scope.id)!
            .scores.filter((score) =>
              items.some((item) => item.id === score.id),
            ),
          unscoredIds: [],
        }),
    },
  );
  return ranked ? { candidates: eligible, scores, ranked } : null;
}
