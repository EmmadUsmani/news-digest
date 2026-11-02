import type { DigestPreview } from '@digest/contracts';

import type {
  ScheduledBudgetOutcome,
  ScheduledBudgetRepository,
} from './modules/curation/domain/scheduled-budget.port';

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

// Called only by the scheduled BullMQ processor, after queue lock acquisition.
// attemptsStarted includes stalled redeliveries, unlike attemptsMade.
export async function runScheduledBudgetAttempt(
  budgets: ScheduledBudgetRepository,
  scheduledAt: Date,
  runId: string,
  attemptsStarted: number,
  attemptsMade: number,
  maxAttempts: number,
  generate: () => Promise<DigestPreview>,
) {
  const observed = await budgets.read(scheduledAt.toISOString().slice(0, 10));
  // Additional cron slots in the same UTC day do not own the daily reserve.
  if (
    !observed ||
    observed.runId !== runId ||
    observed.state === 'succeeded' ||
    observed.state === 'failed'
  )
    return generate();
  const claimed = await budgets.claim(
    runId,
    attemptsStarted > 1 && observed.state === 'running'
      ? observed.attempt
      : undefined,
  );
  if (!claimed)
    throw new Error('Scheduled budget attempt could not be claimed');
  try {
    const edition = await generate();
    await budgets.finishAttempt(
      runId,
      claimed.attempt,
      'succeeded',
      scheduledOutcome(edition),
    );
    return edition;
  } catch (error) {
    await budgets.finishAttempt(
      runId,
      claimed.attempt,
      attemptsMade + 1 < maxAttempts ? 'retrying' : 'failed',
    );
    throw error;
  }
}
