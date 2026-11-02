import { parseExpression } from 'cron-parser';

import { type ScheduleConfig, validateSchedule } from '../domain/schedule';

// Match BullMQ's cron-parser version and timezone/DST behavior. Resolve from
// UTC midnight, not from "now": a delayed or completed slot must not disappear.
export function budgetDaySlot(
  day: string,
  schedule: ScheduleConfig,
): Date | null {
  const start = new Date(`${day}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !Number.isFinite(start.getTime()) ||
    start.toISOString().slice(0, 10) !== day
  )
    throw new Error('Invalid UTC budget day');
  const valid = validateSchedule(schedule);
  if (!valid.ok) throw new Error(valid.error);
  const slot = parseExpression(schedule.cadence, {
    currentDate: new Date(start.getTime() - 1),
    tz: schedule.timezone,
  })
    .next()
    .toDate();
  // Some local daily schedules have no occurrence within a particular UTC day.
  // A day has one reserve identity; if DST produces two slots, the first wins.
  return slot.getTime() < start.getTime() + 86400000 ? slot : null;
}
