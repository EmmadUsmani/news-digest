import type { DigestPreview } from '@digest/contracts';

import type { ScheduledBudgetOutcome } from './scheduled-budget.port';

export function scheduledOutcome(
  edition: DigestPreview,
): ScheduledBudgetOutcome {
  const sections = edition.topics.flatMap((topic) => [
    topic.editorial,
    topic.postEditorial,
  ]);
  const full =
    sections.length > 0 &&
    sections.every(
      (section) => section?.mode === 'ai' && section.unscoredIds.length === 0,
    );
  const anyAi = sections.some((section) => section?.mode === 'ai');
  return {
    editionId: edition.id,
    mode: full ? 'full-ai' : anyAi ? 'mixed' : 'fallback',
    reason: full
      ? 'All article and social sections completed AI editing and triage.'
      : [
          ...new Set(
            sections.map(
              (section) => section?.reason ?? 'Editorial evidence unavailable.',
            ),
          ),
        ].join(' '),
  };
}
