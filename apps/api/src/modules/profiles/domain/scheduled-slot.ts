import type { Result } from '../../../libs/ddd/result';

// Bound recovery work after downtime. BullMQ retains the pending scheduled slot;
// it does not backfill every missed daily slot. Retrying never shifts its window.
export function scheduledSlot(
  timestamp: number | undefined,
  now: number,
): Result<{ timestamp: number; skip?: string }, string> {
  if (
    timestamp === undefined ||
    !Number.isSafeInteger(timestamp) ||
    !Number.isSafeInteger(now) ||
    !Number.isFinite(new Date(timestamp).getTime())
  )
    return { ok: false, error: 'Scheduled slot timestamp missing or invalid' };
  if (timestamp > now)
    return { ok: false, error: 'Scheduled slot is in the future' };
  return {
    ok: true,
    value: {
      timestamp,
      ...(now - timestamp > 6 * 3600000
        ? {
            skip: 'Missed run: more than six hours late; generate a custom window to recover coverage',
          }
        : {}),
    },
  };
}
