import type { developingHistory } from '../domain/developing-history';
import { matchDevelopingStories } from './match-developing-stories';
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
  const fallback = { status: 'unchanged' as const, stories: input.selected };
  if (input.editorialMode !== 'ai' || !input.selected.length) return fallback;
  const evidence = new Map(input.evidence.map((item) => [item.id, item]));
  const ids = new Set(input.selected.map((item) => item.id));
  if (
    evidence.size !== input.evidence.length ||
    ids.size !== input.selected.length ||
    input.selected.some((item) => !item.id.trim() || !evidence.has(item.id))
  )
    return fallback;
  // Matching uses current reporting, never the accepted editor's rewritten prose.
  const current = input.selected.map(({ id }) => {
    const source = evidence.get(id)!;
    return { id, title: source.title, summary: source.excerpt ?? '' };
  });
  const links = await matchDevelopingStories(
    input.grouping,
    input,
    current,
    input.history,
  );
  if (!links.length) return fallback;
  return rewriteSelectedDevelopingStories({ ...input, links });
}
