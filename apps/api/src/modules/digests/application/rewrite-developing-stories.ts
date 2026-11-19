import type { developingLinks } from '../domain/developing-links';
import { snapshotDevelopingStories } from './snapshot-developing-stories';

type Prose = {
  id: string;
  title: string;
  summary: string;
  whyItMatters: string;
};
type Link = ReturnType<typeof developingLinks>[number];

// Prepared contract only. No provider, ledger or generation wiring yet.
export async function rewriteDevelopingStories<
  S extends { id: string; title: string },
  E extends { id: string },
>(input: {
  selected: readonly S[];
  evidence: readonly E[];
  links: readonly Link[];
  rewrite: (
    stories: { selected: S; evidence: E; earlierCoverage: Link }[],
  ) => Promise<unknown>;
  // Production must supply the existing current-evidence factual guards.
  validate: (prose: Prose, evidence: E) => boolean;
}) {
  const fallback = { status: 'unchanged' as const, stories: input.selected };
  if (!input.links.length) return fallback;
  const selected = new Map(input.selected.map((story) => [story.id, story]));
  const evidence = new Map(input.evidence.map((story) => [story.id, story]));
  const links = new Map(input.links.map((link) => [link.storyId, link]));
  if (
    selected.size !== input.selected.length ||
    evidence.size !== input.evidence.length ||
    links.size !== input.links.length ||
    input.selected.some((story) => !story.id.trim()) ||
    input.links.some(
      (link) => !selected.has(link.storyId) || !evidence.has(link.storyId),
    )
  )
    return fallback;
  const matched = input.selected.filter((story) => links.has(story.id));
  try {
    // Isolate accepted output and original evidence from adapter mutation.
    const result = await input.rewrite(
      matched.map((story) => ({
        selected: structuredClone(story),
        evidence: structuredClone(evidence.get(story.id)!),
        earlierCoverage: structuredClone(links.get(story.id)!),
      })),
    );
    if (!Array.isArray(result) || result.length !== matched.length)
      return fallback;
    const replacements = new Map<string, Prose>();
    for (const [index, value] of (result as unknown[]).entries()) {
      if (!value || typeof value !== 'object') return fallback;
      const fields = value as Record<string, unknown>;
      if (
        Object.keys(fields).sort().join(',') !==
          'id,summary,title,whyItMatters' ||
        fields.id !== matched[index].id ||
        ![fields.title, fields.summary, fields.whyItMatters].every(
          (field) => typeof field === 'string' && field.trim(),
        )
      )
        return fallback;
      const prose = value as Prose;
      if (
        !input.validate(
          structuredClone(prose),
          structuredClone(evidence.get(prose.id)!),
        )
      )
        return fallback;
      replacements.set(prose.id, prose);
    }
    return {
      status: 'rewritten' as const,
      stories: snapshotDevelopingStories(
        input.selected.map((story) => ({
          ...story,
          ...replacements.get(story.id),
        })),
        [...input.links],
      ),
    };
  } catch {
    // Refusals, guard errors and invalid relationship metadata fail atomically.
    return fallback;
  }
}
