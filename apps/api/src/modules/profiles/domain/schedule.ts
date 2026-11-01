import type { Result } from '../../../libs/ddd/result';

export interface ScheduleConfig {
  cadence: string;
  timezone: string;
  coverageWindow: string;
  storyBudget: number;
  postBudget: number;
}
export interface CoverageWindow {
  windowStart: Date;
  windowEnd: Date;
}
// Coverage durations are elapsed time: P1D is exactly 24 hours, including DST days.
// Calendar months/years are deliberately unsupported because their length varies.
export function durationMilliseconds(value: string): number | null {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(
    value,
  );
  if (!match || !match.slice(1).some(Boolean) || value.endsWith('T'))
    return null;
  const milliseconds =
    ((Number(match[1] ?? 0) * 24 + Number(match[2] ?? 0)) * 3600 +
      Number(match[3] ?? 0) * 60 +
      Number(match[4] ?? 0)) *
    1000;
  return Number.isSafeInteger(milliseconds) && milliseconds > 0
    ? milliseconds
    : null;
}
export function validateSchedule(
  config: ScheduleConfig,
): Result<ScheduleConfig, string> {
  // Initial scheduler contract supports a daily local time; expand when scheduler is built.
  const cron = /^(\d{1,2}) (\d{1,2}) \* \* \*$/.exec(config.cadence);
  if (!cron || Number(cron[1]) > 59 || Number(cron[2]) > 23)
    return { ok: false, error: 'Use a daily five-field cron cadence' };
  try {
    new Intl.DateTimeFormat('en', { timeZone: config.timezone });
  } catch {
    return { ok: false, error: 'Invalid IANA timezone' };
  }
  if (!durationMilliseconds(config.coverageWindow))
    return {
      ok: false,
      error: 'Use a positive day/hour/minute/second ISO duration',
    };
  if (
    ![config.storyBudget, config.postBudget].every(
      (n) => Number.isInteger(n) && n >= 0 && n <= 20,
    )
  )
    return { ok: false, error: 'Budgets must be integers between 0 and 20' };
  return { ok: true, value: config };
}
export function coverageWindow(
  end: Date,
  duration: string,
): Result<CoverageWindow, string> {
  const milliseconds = durationMilliseconds(duration);
  const start = new Date(end.getTime() - (milliseconds ?? 0));
  if (
    !milliseconds ||
    !Number.isFinite(end.getTime()) ||
    !Number.isFinite(start.getTime())
  )
    return { ok: false, error: 'Invalid coverage window' };
  return { ok: true, value: { windowStart: start, windowEnd: new Date(end) } };
}
