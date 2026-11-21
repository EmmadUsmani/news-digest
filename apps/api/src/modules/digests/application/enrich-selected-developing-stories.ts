import type { developingHistory } from '../domain/developing-history';
import { matchDevelopingStoriesWithResult } from './match-developing-stories';
import type { GroupingResultPort } from './prepare-story-grouping';
import { rewriteSelectedDevelopingStories } from './rewrite-selected-developing-stories';

type RewriteInput = Parameters<typeof rewriteSelectedDevelopingStories>[0];

type SelectedStory = RewriteInput['selected'][number];
type EnrichmentInput<S extends SelectedStory = SelectedStory> = Omit<
  RewriteInput,
  'selected' | 'links'
> & {
  selected: readonly S[];
  editorialMode: 'ai' | 'fallback';
  grouping: GroupingResultPort | null;
  history: ReturnType<typeof developingHistory>;
  publishedAt: string;
};

// Callers supply budgeted ports; this helper neither reserves nor publishes.
export async function enrichSelectedDevelopingStories<S extends SelectedStory>(
  input: EnrichmentInput<S>,
) {
  const matching = await matchSelectedDevelopingStories(input);
  if (matching.status !== 'matched') return matching;
  const result = await rewriteSelectedDevelopingStories({
    ...input,
    links: matching.links,
  });
  return result.status === 'rewritten'
    ? result
    : {
        status: 'unchanged' as const,
        stories: input.selected,
        reason: 'rewrite-refused',
      };
}

/** Match independently so every topic can finish before any rewrite starts. */
export async function matchSelectedDevelopingStories<S extends SelectedStory>(
  input: EnrichmentInput<S>,
) {
  const fallback = (reason: string) => ({
    status: 'unchanged' as const,
    stories: input.selected,
    reason,
  });
  const preparation = prepareSelectedDevelopingStories(input);
  if (preparation !== 'ready') return fallback(preparation);
  const evidence = new Map(input.evidence.map((item) => [item.id, item]));
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
  if (!matching.links.length) return fallback('no-validated-links');
  return { status: 'matched' as const, links: matching.links };
}

/** Validate without model calls so a whole edition can refuse before spending. */
export function prepareSelectedDevelopingStories(input: EnrichmentInput) {
  if (input.editorialMode !== 'ai') return 'non-ai-selection';
  if (!input.selected.length) return 'empty-selection';
  if (!input.history.some((edition) => edition.stories.length))
    return 'empty-history';
  if (
    input.selected.length +
      input.history.reduce(
        (count, edition) => count + edition.stories.length,
        0,
      ) >
    40
  )
    return 'history-capacity';
  if (!input.grouping) return 'matching-unavailable';
  const evidence = new Map(input.evidence.map((item) => [item.id, item]));
  const ids = new Set(input.selected.map((item) => item.id));
  if (
    evidence.size !== input.evidence.length ||
    ids.size !== input.selected.length ||
    input.selected.some((item) => !item.id.trim() || !evidence.has(item.id))
  )
    return 'ambiguous-or-missing-evidence';
  return 'ready';
}
