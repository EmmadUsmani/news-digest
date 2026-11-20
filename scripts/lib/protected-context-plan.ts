import { protectedGroupingObligations } from './protected-grouping-obligations';
import { protectedSocialObligations } from './protected-social-obligations';
import { protectedStoryObligations } from './protected-story-obligations';
import { protectedTriageObligations } from './protected-triage-obligations';
import {
  protectedWorkManifest,
  type ProtectedWorkSlot,
} from './protected-work-manifest';

type Context = { contextId: string } & (
  | { stage: 'triage'; input: Parameters<typeof protectedTriageObligations>[0] }
  | {
      stage: 'grouping';
      input: Parameters<typeof protectedGroupingObligations>[0];
    }
  | { stage: 'story'; input: Parameters<typeof protectedStoryObligations>[0] }
  | { stage: 'social'; input: Parameters<typeof protectedSocialObligations>[0] }
);

// Offline only: derive bounds from production request builders rather than
// accepting hand-authored requests. The expected inventory is still caller-owned;
// this does not discover future dynamic contexts or acquire executable holds.
export async function protectedContextPlan(input: {
  editionId: string;
  topicIds: readonly string[];
  expected: readonly ProtectedWorkSlot[];
  contexts: readonly Context[];
}) {
  const supplied = [];
  for (const context of input.contexts) {
    const runId =
      context.stage === 'story' || context.stage === 'social'
        ? context.input.args[3]
        : context.input.args[2];
    if (runId !== input.editionId)
      throw new Error('Protected context edition differs');
    let slot: ProtectedWorkSlot;
    let result;
    switch (context.stage) {
      case 'triage':
        slot = {
          stage:
            context.input.kind === 'article'
              ? 'article-triage'
              : 'social-triage',
          topicIds: [context.input.args[0].id],
          contextId: context.contextId,
        };
        result = await protectedTriageObligations(context.input);
        break;
      case 'grouping':
        slot = {
          stage: 'grouping',
          topicIds:
            context.input.kind === 'topic'
              ? [context.input.args[0]]
              : context.input.args[0].map((topic) => topic.id),
          contextId: context.contextId,
        };
        result = await protectedGroupingObligations(context.input);
        break;
      case 'story':
        slot = {
          stage: 'story',
          topicIds: [context.input.args[0].id],
          contextId: context.contextId,
        };
        result = await protectedStoryObligations(context.input);
        break;
      case 'social':
        slot = {
          stage: 'social',
          topicIds: [context.input.args[0].id],
          contextId: context.contextId,
        };
        result = await protectedSocialObligations(context.input);
        break;
    }
    supplied.push({ slot, requests: result.requests });
  }
  return protectedWorkManifest({ ...input, supplied });
}
