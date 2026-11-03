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
