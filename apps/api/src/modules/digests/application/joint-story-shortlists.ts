import type {
  GroupingCandidate,
  OwnedStoryGroup,
  StoryScope,
} from '../../curation/public/editorial';
import { type Candidate, rank } from '../domain/rank';

interface OwnershipPort {
  assignTopics(
    scopes: StoryScope[],
    candidates: GroupingCandidate[],
    runId: string,
  ): Promise<OwnedStoryGroup[] | null>;
}

// Prepared publication bridge. No production caller until whole-edition admission
// is established. Null requires aborting the split, never independent fallback.
export async function jointStoryShortlists(
  ownership: OwnershipPort | null,
  pools: { scope: StoryScope; candidates: Candidate[] }[],
  start: Date,
  end: Date,
  runId: string,
): Promise<Map<string, ReturnType<typeof rank>> | null> {
  const topics = new Set(pools.map((pool) => pool.scope.id));
  const all = pools.flatMap((pool) => pool.candidates);
  const byId = new Map(all.map((item) => [item.id, item]));
  if (
    !ownership ||
    pools.length !== 2 ||
    topics.size !== 2 ||
    pools.some((pool) => !pool.scope.id) ||
    all.length > 40 ||
    byId.size !== all.length ||
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start >= end
  )
    return null;
  if (!all.length) return new Map(pools.map(({ scope }) => [scope.id, []]));
  try {
    const groups = await ownership.assignTopics(
      pools.map((pool) => pool.scope),
      pools.flatMap(({ scope, candidates }) =>
        candidates.map((item) => ({
          id: item.id,
          topicId: scope.id,
          title: item.title,
          outlet: item.sources.join(', '),
          publishedAt: item.publishedAt,
          excerpt: item.excerpt,
        })),
      ),
      runId,
    );
    if (!groups) return null;
    const membership = new Map<string, number>();
    for (const [index, group] of groups.entries()) {
      if (!topics.has(group.topicId) || !group.ids.length) return null;
      for (const id of group.ids) {
        if (!byId.has(id) || membership.has(id)) return null;
        membership.set(id, index);
      }
    }
    if (membership.size !== all.length) return null;
    return new Map(
      pools.map(({ scope }) => {
        const candidates = groups
          .filter((group) => group.topicId === scope.id)
          .flatMap((group) => group.ids.map((id) => byId.get(id)!));
        return [
          scope.id,
          rank(
            candidates,
            start,
            end,
            10,
            (a, b) =>
              a.id !== b.id && membership.get(a.id) === membership.get(b.id),
          ),
        ];
      }),
    );
  } catch {
    return null;
  }
}
