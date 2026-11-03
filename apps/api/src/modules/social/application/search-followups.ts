import {
  planStoryReactions,
  type ReactionStory,
} from '../domain/story-reactions';
import type { XSearchRequest } from '../domain/x-search.port';

export interface FollowupTopic {
  id: string;
  request: XSearchRequest;
  openState: 'completed' | 'failed' | 'budget-blocked' | 'pending';
  stories: ReactionStory[];
  handles: string[];
}

// Preparation only. The caller must supply every enabled topic and recheck the
// saved schedule/window in canContinue. Each execution still needs atomic ledger
// admission; this orchestration never substitutes for the shared budget lock.
export async function runSearchFollowups(
  topics: FollowupTopic[],
  canContinue: () => Promise<boolean>,
  execute: (
    topicId: string,
    request: XSearchRequest,
  ) => Promise<{ state: 'completed' | 'failed' | 'budget-blocked' }>,
) {
  if (
    topics.length === 0 ||
    topics.some(
      (topic) =>
        !topic.id.trim() ||
        topic.openState !== 'completed' ||
        topic.request.handles !== undefined ||
        topic.request.reactionStory !== undefined,
    ) ||
    new Set(topics.map((topic) => topic.id)).size !== topics.length
  )
    return [];
  const reactions = topics.flatMap((topic) =>
    planStoryReactions(topic.request, topic.stories).map(({ request }) => ({
      topicId: topic.id,
      request,
    })),
  );
  const accounts = topics
    .filter(
      ({ handles }) =>
        handles.length > 0 &&
        handles.length <= 20 &&
        handles.every((handle) => /^[A-Za-z0-9_]{1,15}$/.test(handle)) &&
        new Set(handles.map((handle) => handle.toLowerCase())).size ===
          handles.length,
    )
    .map((topic) => ({
      topicId: topic.id,
      request: { ...topic.request, handles: [...topic.handles] },
    }));
  const results = [];
  for (const plan of [...reactions, ...accounts]) {
    if (!(await canContinue())) break;
    const result = await execute(plan.topicId, plan.request);
    results.push({ ...plan, state: result.state });
    // A rejected projection must not trigger a cascade of optional attempts.
    if (result.state === 'budget-blocked') break;
  }
  return results;
}
