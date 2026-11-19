import type { developingHistory } from '../domain/developing-history';
import { matchDevelopingStories } from './match-developing-stories';
import type { GroupingResultPort } from './prepare-story-grouping';
import { snapshotDevelopingStories } from './snapshot-developing-stories';

type EarlierCoverage = { headline: string; summary: string | null };

// Prepared orchestration only: production admission awaits semantic review.
// The editor selects from current candidates; history is comparison context only.
export async function editDevelopingStories<
  T extends { id: string; title: string; summary?: string | null },
  R extends { stories: { id: string }[] },
>(input: {
  grouping: GroupingResultPort | null;
  target: { topicId: string; publishedAt: string; runId: string };
  candidates: readonly T[];
  history: ReturnType<typeof developingHistory>;
  edit: (
    candidates: (T & { earlierCoverage?: EarlierCoverage })[],
  ) => Promise<R | null>;
}) {
  // Links and editor selections use story IDs, while semantic evidence uses
  // occurrence references. Ambiguous IDs must fail before either paid step.
  const allowed = new Set(input.candidates.map((candidate) => candidate.id));
  if (
    allowed.size !== input.candidates.length ||
    input.candidates.some((candidate) => !candidate.id.trim())
  )
    throw new Error('Developing editor requires unique nonempty candidate IDs');
  const links = await matchDevelopingStories(
    input.grouping,
    input.target,
    input.candidates,
    input.history,
  );
  const byId = new Map(links.map((link) => [link.storyId, link]));
  const candidates = input.candidates.map((candidate) => {
    const link = byId.get(candidate.id);
    return link
      ? {
          ...candidate,
          earlierCoverage: {
            headline: link.previousHeadline,
            summary: link.previousSummary,
          },
        }
      : { ...candidate };
  });
  const result = await input.edit(candidates);
  if (!result) return null;
  const selected = new Set<string>();
  for (const story of result.stories) {
    if (!allowed.has(story.id) || selected.has(story.id))
      throw new Error(
        'Developing editor must select unique current candidates',
      );
    selected.add(story.id);
  }
  return {
    ...result,
    stories: snapshotDevelopingStories<R['stories'][number]>(
      result.stories,
      links.filter((link) => selected.has(link.storyId)),
    ),
  };
}
