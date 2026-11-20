import type { developingHistory } from '../domain/developing-history';
import { matchDevelopingStoriesWithResult } from './match-developing-stories';
import type { GroupingResultPort } from './prepare-story-grouping';
import { rewriteSelectedDevelopingStories } from './rewrite-selected-developing-stories';

type RewriteInput = Parameters<typeof rewriteSelectedDevelopingStories>[0];

// Prepared only. Generation must first admit the complete matching/rewrite plan
// and supply budgeted ports; this helper neither reserves nor publishes.
export async function enrichSelectedDevelopingStories<
  S extends RewriteInput['selected'][number],
>(
  input: Omit<RewriteInput, 'selected' | 'links'> & {
    selected: readonly S[];
    editorialMode: 'ai' | 'fallback';
    grouping: GroupingResultPort | null;
    history: ReturnType<typeof developingHistory>;
    publishedAt: string;
  },
) {
  const fallback = (reason: string) => ({
    status: 'unchanged' as const,
    stories: input.selected,
    reason,
  });
  if (input.editorialMode !== 'ai') return fallback('non-ai-selection');
  if (!input.selected.length) return fallback('empty-selection');
  if (!input.history.some((edition) => edition.stories.length))
    return fallback('empty-history');
  if (
    input.selected.length +
      input.history.reduce(
        (count, edition) => count + edition.stories.length,
        0,
      ) >
    40
  )
    return fallback('history-capacity');
  if (!input.grouping) return fallback('matching-unavailable');
  const evidence = new Map(input.evidence.map((item) => [item.id, item]));
  const ids = new Set(input.selected.map((item) => item.id));
  if (
    evidence.size !== input.evidence.length ||
    ids.size !== input.selected.length ||
    input.selected.some((item) => !item.id.trim() || !evidence.has(item.id))
  )
    return fallback('ambiguous-or-missing-evidence');
  // Matching uses current reporting, never the accepted editor's rewritten prose.
  const current = input.selected.map(({ id }) => {
    const source = evidence.get(id)!;
    return { id, title: source.title, summary: source.excerpt ?? '' };
  });
  const matching = await matchDevelopingStoriesWithResult(
    input.grouping,
    input,
    current,
    input.history,
  );
  if (matching.status !== 'validated') return fallback('matching-refused');
  const links = matching.links;
  if (!links.length) return fallback('no-validated-links');
  const result = await rewriteSelectedDevelopingStories({ ...input, links });
  return result.status === 'rewritten' ? result : fallback('rewrite-refused');
}
