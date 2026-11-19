// Offline projection of immutable editor inputs, never of published summaries.
import { createHash } from 'node:crypto';

import { z } from 'zod';

import type { EditorialCandidate } from '../src/modules/curation/application/editor';

const member = z.object({
  id: z.string().min(1),
  title: z.string(),
  excerpt: z.string().nullable(),
  sources: z.array(z.string()),
  publisher: z.string().nullable().optional(),
});
const promptSchema = z.object({
  topic: z.object({ id: z.string() }),
  candidates: z.array(
    member.extend({
      url: z.string().optional(),
      clusterEvidence: z.array(member).optional(),
    }),
  ),
});

export function savedEditorialEvidence(
  prompt: string | undefined,
  topicId: string,
  selectedIds: readonly string[],
): { promptSha256: string; evidence: EditorialCandidate[] } | null {
  if (
    !prompt ||
    !selectedIds.length ||
    new Set(selectedIds).size !== selectedIds.length
  )
    return null;
  try {
    const parsed = promptSchema.parse(JSON.parse(prompt));
    if (parsed.topic.id !== topicId) return null;
    const ids = parsed.candidates.map((candidate) => candidate.id);
    if (new Set(ids).size !== ids.length) return null;
    const evidence: EditorialCandidate[] = [];
    for (const id of selectedIds) {
      const candidate = parsed.candidates.find((item) => item.id === id);
      if (!candidate) return null;
      const { publisher, clusterEvidence, ...current } = candidate;
      const members = [current, ...(clusterEvidence ?? [])];
      if (new Set(members.map((item) => item.id)).size !== members.length)
        return null;
      evidence.push({
        ...current,
        ...(publisher !== undefined
          ? {
              publisher:
                publisher === null ? null : { name: publisher, url: null },
            }
          : {}),
        // The saved prompt omits the representative from its supplemental list.
        // Restore it for the current-evidence guard, which scans this array.
        ...(clusterEvidence !== undefined
          ? {
              clusterEvidence: [
                {
                  ...current,
                  ...(publisher !== undefined ? { publisher } : {}),
                },
                ...clusterEvidence,
              ].map(({ publisher: name, ...item }) => ({
                ...item,
                ...(name ? { publisher: name } : {}),
              })),
            }
          : {}),
      });
    }
    return {
      promptSha256: createHash('sha256').update(prompt).digest('hex'),
      evidence,
    };
  } catch {
    return null;
  }
}
