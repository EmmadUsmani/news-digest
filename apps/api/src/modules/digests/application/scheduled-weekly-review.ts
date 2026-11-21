import { scheduledSlot } from '../../profiles/public/scheduled-slot';
import type { generateWeeklyReview } from './generate-weekly-review';

type Request = Parameters<typeof generateWeeklyReview>[2];
type Generate = (request: Request) => ReturnType<typeof generateWeeklyReview>;

export const weeklySchedule = Object.freeze({
  pattern: '0 17 * * 0',
  tz: 'UTC',
});

/** The queue's original slot owns coverage and idempotency, even after restart.
 * Null publication is a failed attempt, never a successful empty weekly edition. */
export async function runScheduledWeeklyReview(
  generate: Generate,
  request: {
    timestamp: number | undefined;
    now: number;
    id: string;
    topics: Request['topics'];
  },
) {
  const slot = scheduledSlot(request.timestamp, request.now);
  if (!slot.ok) throw new Error(slot.error);
  const date = new Date(slot.value.timestamp);
  if (
    date.getUTCDay() !== 0 ||
    date.getUTCHours() !== 17 ||
    date.getUTCMinutes() !== 0 ||
    date.getUTCSeconds() !== 0 ||
    date.getUTCMilliseconds() !== 0
  )
    throw new Error('Weekly review requires a Sunday 17:00 UTC slot');
  if (slot.value.skip) return { skipped: slot.value.skip };
  const scheduledAt = date.toISOString();
  const publication = await generate({
    id: request.id,
    generationKey: `weekly:public:${scheduledAt}`,
    profileId: null,
    scheduledAt,
    topics: request.topics,
  });
  if (!publication)
    throw new Error(
      'Weekly publication unavailable: daily prerequisite or editor refused',
    );
  return { editionId: publication.id, windowEnd: publication.windowEnd };
}
