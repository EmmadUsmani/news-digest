import type {
  EditorialResult,
  StoryScope,
} from '../../curation/public/editorial';
import type { rank } from '../domain/rank';
import {
  jointStoryShortlists,
  type OwnershipPort,
  type StoryPool,
} from './joint-story-shortlists';

interface EditorPort {
  edit(
    scope: StoryScope,
    candidates: ReturnType<typeof rank>,
    budget: number,
    runId: string,
  ): Promise<EditorialResult | null>;
}

// Prepared only: callers must supply completely triaged pools and establish
// whole-edition admission before enabling this path. No persistence or fallback.
export async function jointStoryEdits(
  ownership: OwnershipPort | null,
  editor: EditorPort,
  pools: (StoryPool & { budget: number })[],
  start: Date,
  end: Date,
  runId: string,
) {
  if (
    pools.some(
      ({ budget }) => !Number.isInteger(budget) || budget < 0 || budget > 10,
    )
  )
    return null;
  const shortlists = await jointStoryShortlists(
    ownership,
    pools,
    start,
    end,
    runId,
  );
  if (!shortlists) return null;
  const results = new Map<
    string,
    { ranked: ReturnType<typeof rank>; editorial: EditorialResult }
  >();
  try {
    // Sequential calls stop spending after the first refused scope.
    for (const { scope, budget } of pools) {
      const ranked = shortlists.get(scope.id)!;
      const editorial = await editor.edit(scope, ranked, budget, runId);
      if (!editorial || editorial.stories.length > budget) return null;
      const ids = new Set(ranked.map((story) => story.id));
      const selected = new Set<string>();
      for (const story of editorial.stories) {
        if (
          !ids.has(story.id) ||
          selected.has(story.id) ||
          !story.evidenceIds.includes(story.id) ||
          story.evidenceIds.some((id) => !ids.has(id))
        )
          return null;
        selected.add(story.id);
      }
      results.set(scope.id, { ranked, editorial });
    }
    return results;
  } catch {
    return null;
  }
}
