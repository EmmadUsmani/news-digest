import type { developingHistory } from './developing-history';

type History = ReturnType<typeof developingHistory>;

// References identify snapshot occurrences, since story IDs can recur in editions.
export function developingEvidence(
  current: readonly { id: string; title: string; summary?: string | null }[],
  history: History,
) {
  return [
    ...current.map((story, index) => ({
      reference: `current:${index}`,
      editionId: null as string | null,
      story: { ...story, summary: story.summary ?? null },
    })),
    ...history.flatMap((edition, editionIndex) =>
      edition.stories.map((story, storyIndex) => ({
        reference: `history:${editionIndex}:${storyIndex}`,
        editionId: edition.editionId,
        story: { ...story },
      })),
    ),
  ];
}

// Consume only explicit semantic memberships. No title rules or transitive joins.
// Callers must supply history selected by developingHistory (newest first).
export function developingLinks(
  current: Parameters<typeof developingEvidence>[0],
  history: History,
  groups: readonly (readonly string[])[],
) {
  const evidence = developingEvidence(current, history);
  const byReference = new Map(evidence.map((item) => [item.reference, item]));
  const seen = new Set<string>();
  // Reject the entire response if its partition is invalid, rather than saving partial links.
  for (const group of groups) {
    if (group.length < 2) return [];
    for (const reference of group) {
      if (!byReference.has(reference) || seen.has(reference)) return [];
      seen.add(reference);
    }
  }
  return groups.flatMap((group) => {
    const members = group.map((reference) => byReference.get(reference)!);
    const selected = members.filter((member) => member.editionId === null);
    if (selected.length !== 1) return [];
    const earlier = evidence.filter(
      (member) => member.editionId !== null && group.includes(member.reference),
    );
    if (!earlier.length) return [];
    // Multiple candidate predecessors in one edition are ambiguous; omit this group.
    const editions = new Set(earlier.map((member) => member.editionId));
    if (editions.size !== earlier.length) return [];
    const previous = earlier[0];
    return [
      {
        storyId: selected[0].story.id,
        previousEditionId: previous.editionId!,
        previousStoryId: previous.story.id,
        previousHeadline: previous.story.title,
        previousSummary: previous.story.summary,
        editionCount: editions.size + 1,
      },
    ];
  });
}
