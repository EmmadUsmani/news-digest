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

export function timingOptions(args: string[]) {
  let limit = 3;
  let scheduledOnly = false;
  const seen = new Set<string>();
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (seen.has(key)) throw new Error('Duplicate timing option');
    seen.add(key);
    if (key === '--scheduled-only') scheduledOnly = true;
    else if (key === '--limit') {
      const value = args[++i] ?? '';
      if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 20)
        throw new Error('--limit must be 1–20');
      limit = Number(value);
    } else throw new Error('Unknown timing option');
  }
  return { limit, scheduledOnly };
}

// Select by timestamps explicitly: status can mix jobs in different queue states.
export function timingEvidence(
  runs: OperationsStatus['queues'][number]['runs'],
  options = timingOptions([]),
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
  const selected = options.scheduledOnly ? scheduled : latest;
  const completed = selected
    .filter((run) => run.state === 'completed' && run.editionId)
    .slice(0, options.limit);
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
    failed: selected
      .filter((run) => run.state === 'failed')
      .slice(0, options.limit),
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
