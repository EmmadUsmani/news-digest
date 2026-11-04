import { parseExpression } from 'cron-parser';

import {
  coverageWindow,
  type ScheduleConfig,
  validateSchedule,
} from '../domain/schedule';

// Prepared schedule boundary only; no timer or paid work is started here.
// Resolve from current settings on each tick. Include the exact publication
// instant so a tick at that boundary cannot jump past the cutoff to tomorrow.
export function incrementalTriageWindow(schedule: ScheduleConfig, now: Date) {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid tick time');
  const valid = validateSchedule(schedule);
  if (!valid.ok) throw new Error(valid.error);
  const nextEdition = parseExpression(schedule.cadence, {
    currentDate: new Date(now.getTime() - 1),
    tz: schedule.timezone,
  })
    .next()
    .toDate();
  const window = coverageWindow(nextEdition, schedule.coverageWindow);
  if (!window.ok) throw new Error(window.error);
  return {
    ...window.value,
    nextEditionAt: nextEdition.getTime(),
    cutoffMs: 2 * 60 * 60 * 1000,
  };
}
