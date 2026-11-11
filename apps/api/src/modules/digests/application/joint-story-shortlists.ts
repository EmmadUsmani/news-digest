import type {
  GroupingCandidate,
  OwnedStoryGroup,
  StoryScope,
} from '../../curation/public/editorial';
import { type Candidate, rank } from '../domain/rank';

export type StoryPool = { scope: StoryScope; candidates: Candidate[] };

// Shared article IDs can be observed through both topic/source associations.
// Retain one report, union source evidence, and refuse inconsistent snapshots.
function sharedPools(pools: StoryPool[]): StoryPool[] | null {
  const seen = new Map<string, Candidate>();
  const result: StoryPool[] = [];
  for (const pool of pools) {
    const candidates: Candidate[] = [];
    for (const item of pool.candidates) {
      const previous = seen.get(item.id);
      if (!previous) {
        const copy = { ...item, sources: [...new Set(item.sources)].sort() };
        seen.set(item.id, copy);
        candidates.push(copy);
        continue;
      }
      if (
        previous.title !== item.title ||
        previous.url !== item.url ||
        previous.excerpt !== item.excerpt ||
        previous.publishedAt !== item.publishedAt ||
        previous.points !== item.points ||
        previous.publisher?.name !== item.publisher?.name ||
        previous.publisher?.url !== item.publisher?.url ||
        previous.imageUrl !== item.imageUrl
      )
        return null;
      previous.sources = [
        ...new Set([...previous.sources, ...item.sources]),
      ].sort();
    }
    result.push({ scope: pool.scope, candidates });
  }
  return result;
}

export interface OwnershipPort {
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
  inputPools: StoryPool[],
  start: Date,
  end: Date,
  runId: string,
): Promise<Map<string, ReturnType<typeof rank>> | null> {
  const pools = sharedPools(inputPools);
  if (!pools) return null;
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
