import { assertAbsenceSupport } from './absence-support';
import type { EditorialCandidate } from './editor';

// Same bounded current evidence and absence rules as the selection editor.
// This lexical check is not general entailment or semantic acceptance.
export function validateDevelopingRewrite(
  prose: { id: string; title: string; summary: string; whyItMatters: string },
  candidate: EditorialCandidate,
  topicName: string,
): boolean {
  if (prose.id !== candidate.id) return false;
  const evidence = (candidate.clusterEvidence ?? [candidate]).flatMap(
    (member) => [
      member.title.slice(0, 300),
      member.excerpt?.slice(0, 600) ?? '',
    ],
  );
  const isNba = topicName.trim().toLowerCase() === 'nba';
  try {
    for (const [key, field, limit] of [
      ['title', 'headline', 240],
      ['summary', 'summary', 1400],
      ['whyItMatters', 'whyItMatters', 400],
    ] as const) {
      const text = prose[key];
      if (!text.trim() || text.length > limit) return false;
      assertAbsenceSupport(text, evidence, field, isNba && field === 'summary');
    }
    return true;
  } catch {
    return false;
  }
}
