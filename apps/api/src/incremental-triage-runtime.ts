import type { Pool } from 'pg';

import { prepareIncrementalTriageTick } from './incremental-triage-tick';
import { prepareIncrementalTriageTimer } from './incremental-triage-timer';
import { incrementalTriageScheduler } from './modules/curation/public/incremental-triage-scheduler';
import { loadIncrementalTriagePool } from './modules/digests/public/incremental-triage-pool';

// Dependency composition for the optional worker timer.
// The caller owns the pool and must await stop before closing it.
export function prepareIncrementalTriageRuntime(
  deps: {
    db: Pool;
    settings: Parameters<typeof prepareIncrementalTriageTick>[0]['settings'];
    onError: (error: unknown) => void;
    everyMs: number;
    env?: NodeJS.ProcessEnv;
  },
  compose = incrementalTriageScheduler,
  timer = prepareIncrementalTriageTimer,
) {
  // Resolve the gate before allocating any timer or reading settings/content.
  // Keep the same scheduler instance for round-robin and admission state.
  let enabled = false;
  const tick = prepareIncrementalTriageTick({
    settings: deps.settings,
    pool: (topicId, start, end) =>
      loadIncrementalTriagePool(deps.db, topicId, start, end),
    scheduler: (schedule) => {
      const scheduler = compose(deps.db, schedule, deps.env);
      enabled = scheduler !== null;
      return scheduler;
    },
  });
  if (!enabled) return async () => {};
  return timer({ tick, onError: deps.onError, everyMs: deps.everyMs });
}
