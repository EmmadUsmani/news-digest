import type { OperationsStatus } from '@digest/contracts';

// Signed offsets from the scheduler's intended time, not queue-wait measurements.
export function scheduledTiming(run: {
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}) {
  const offset = (time: string | null) => {
    if (!run.scheduledAt || !time) return null;
    const value = Date.parse(time) - Date.parse(run.scheduledAt);
    return Number.isFinite(value) ? value : null;
  };
  return {
    scheduledStartDelayMs: offset(run.startedAt),
    scheduledCompletionDelayMs: offset(run.finishedAt),
  };
}

// Select by timestamps explicitly: status can mix jobs in different queue states.
export function timingEvidence(
  runs: OperationsStatus['queues'][number]['runs'],
) {
  const latest = [...runs].sort((a, b) => {
    const time = (run: (typeof runs)[number]) =>
      Date.parse(run.finishedAt ?? run.startedAt ?? run.scheduledAt ?? '') || 0;
    return time(b) - time(a);
  });
  const scheduled = latest
    .filter((run) => run.scheduledAt !== null)
    .sort((a, b) => Date.parse(b.scheduledAt!) - Date.parse(a.scheduledAt!));
  const latestScheduled = scheduled[0] ?? null;
  const latestScheduledOutcome =
    scheduled.find((run) => ['completed', 'failed'].includes(run.state)) ??
    null;
  const completed = latest
    .filter((run) => run.state === 'completed' && run.editionId)
    .slice(0, 3);
  if (
    latestScheduledOutcome?.state === 'completed' &&
    latestScheduledOutcome.editionId &&
    !completed.some((run) => run.id === latestScheduledOutcome.id)
  ) {
    completed.push(latestScheduledOutcome);
  }
  return {
    completed,
    latestScheduled,
    latestScheduledOutcome,
    failed: latest.filter((run) => run.state === 'failed').slice(0, 3),
  };
}

// A missing snapshot or transient read must not erase other retained evidence.
// Do not expose exception messages: database/HTTP errors may contain sensitive data.
export async function collectTimingEvidence<T>(
  runs: OperationsStatus['queues'][number]['runs'],
  readRun: (run: (typeof runs)[number]) => Promise<T>,
) {
  const collected: T[] = [];
  const unavailable: (typeof runs)[number][] = [];
  for (const run of runs) {
    try {
      collected.push(await readRun(run));
    } catch {
      unavailable.push(run);
    }
  }
  return { runs: collected, unavailable, complete: unavailable.length === 0 };
}
