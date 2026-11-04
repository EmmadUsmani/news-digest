import type { Pool } from 'pg';

import { IncrementalTriageRunner } from '../application/incremental-triage-runner';
import { IncrementalTriageScheduler } from '../application/incremental-triage-scheduler';
import type { CandidateTriage } from '../application/triage';
import { PostgresIncrementalTriageAdmission } from '../database/incremental-triage-admission';
import { incrementalTriageServices } from './incremental-triage';

// Composition boundary for the optional worker caller. Shared admission is
// mandatory here, even though the application runner also supports offline use.
export function composeIncrementalTriageScheduler(
  db: Pool,
  triage: Pick<CandidateTriage, 'pending' | 'score'>,
  schedule: ConstructorParameters<typeof IncrementalTriageRunner>[1],
  now: () => number = Date.now,
) {
  return new IncrementalTriageScheduler(
    new IncrementalTriageRunner(
      triage,
      schedule,
      now,
      new PostgresIncrementalTriageAdmission(db),
    ),
    { minimumPending: 1, maximumItems: 25 },
  );
}

// No timer is installed. Default-off returns before constructing any service or
// touching the database. The owner must review Nov 4 before worker activation.
export function incrementalTriageScheduler(
  db: Pool,
  schedule: ConstructorParameters<typeof IncrementalTriageRunner>[1],
  env: NodeJS.ProcessEnv = process.env,
) {
  const triage = incrementalTriageServices(db, env);
  return triage
    ? composeIncrementalTriageScheduler(db, triage, schedule)
    : null;
}
