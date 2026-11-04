import { randomUUID } from 'node:crypto';

import type { IncrementalTriageScheduler } from './modules/curation/application/incremental-triage-scheduler';
import type { loadIncrementalTriagePool } from './modules/digests/public/incremental-triage-pool';
import { incrementalTriageWindow } from './modules/profiles/adapters/incremental-triage-window';
import type { ScheduleConfig } from './modules/profiles/domain/schedule';

// Prepared composition only. No worker imports this module and no timer starts.
// Keep one scheduler across ticks so round-robin state survives settings reads.
export function prepareIncrementalTriageTick(deps: {
  settings(): Promise<{ schedule: ScheduleConfig; topicIds: string[] }>;
  pool(
    topicId: string,
    start: Date,
    end: Date,
  ): ReturnType<typeof loadIncrementalTriagePool>;
  scheduler(
    schedule: () => { nextEditionAt: number; cutoffMs: number },
  ): Pick<IncrementalTriageScheduler, 'tick'> | null;
  now?: () => number;
}) {
  const now = deps.now ?? Date.now;
  let active = false;
  let window: ReturnType<typeof incrementalTriageWindow>;
  const scheduler = deps.scheduler(() => window);
  return async () => {
    if (!scheduler) return { status: 'disabled' as const };
    if (active) return { status: 'busy' as const };
    active = true;
    try {
      const settings = await deps.settings();
      // Pin this tick to its pool window, even if a slow load crosses publication.
      window = incrementalTriageWindow(settings.schedule, new Date(now()));
      return await scheduler.tick(
        settings.topicIds.map((id) => ({
          id,
          load: async () => {
            const input = await deps.pool(
              id,
              window.windowStart,
              window.windowEnd,
            );
            // Topics can be disabled/deleted after the settings read. Empty
            // work preserves scheduler identity without scoring stale input.
            return {
              ...(input ?? {
                topic: { id, name: '', description: '', guidance: '' },
                candidates: [],
              }),
              runId: `incremental:${randomUUID()}`,
            };
          },
        })),
      );
    } finally {
      active = false;
    }
  };
}
