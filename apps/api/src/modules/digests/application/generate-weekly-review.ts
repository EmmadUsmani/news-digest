import { weeklyReviewInput } from '../domain/weekly-review-input';
import type { WeeklyReviewEditor } from './weekly-review-editor';

type Target = Parameters<typeof weeklyReviewInput>[1];
type Input = ReturnType<typeof weeklyReviewInput>;
type Review = NonNullable<Awaited<ReturnType<WeeklyReviewEditor['edit']>>>;

export interface WeeklyPublication {
  id: string;
  profileId: string | null;
  kind: 'weekly';
  windowStart: string;
  windowEnd: string;
  topics: { id: string; name: string; review: Review | null }[];
}

/** Storage must insert the entire immutable snapshot atomically, and return the
 * existing publication on a generation-key conflict. Regeneration uses a new key. */
export interface WeeklyPublicationStore {
  find(generationKey: string): Promise<WeeklyPublication | null>;
  sundayDailyPublished(target: Omit<Target, 'topicId'>): Promise<boolean>;
  weeklyReviewInput(target: Target): Promise<Input>;
  publish(
    generationKey: string,
    snapshot: WeeklyPublication,
  ): Promise<WeeklyPublication>;
}

/** Separate weekly publication flow: never calls daily generation or latest(). */
export async function generateWeeklyReview(
  store: WeeklyPublicationStore,
  editor: Pick<WeeklyReviewEditor, 'edit'>,
  request: {
    id: string;
    generationKey: string;
    profileId: string | null;
    scheduledAt: string;
    topics: { id: string; name: string }[];
  },
): Promise<WeeklyPublication | null> {
  const { profileId, scheduledAt } = request;
  const bounds = weeklyReviewInput([], { profileId, scheduledAt, topicId: '' });
  if (
    !request.id ||
    !request.generationKey ||
    !request.topics.length ||
    request.topics.some((topic) => !topic.id || !topic.name) ||
    new Set(request.topics.map((topic) => topic.id)).size !==
      request.topics.length
  )
    throw new Error('Invalid weekly generation request');
  const existing = await store.find(request.generationKey);
  if (existing) return existing;
  // A delayed or failed Sunday daily must not be overtaken by the weekly job.
  if (!(await store.sundayDailyPublished({ profileId, scheduledAt })))
    return null;
  const topics: WeeklyPublication['topics'] = [];
  for (const topic of request.topics) {
    const input = await store.weeklyReviewInput({
      profileId,
      scheduledAt,
      topicId: topic.id,
    });
    if (
      input.windowStart !== bounds.windowStart ||
      input.windowEnd !== bounds.windowEnd
    )
      throw new Error('Weekly input coverage mismatch');
    const hasStories = input.editions.some(
      (edition) => edition.stories.length > 0,
    );
    const review = hasStories
      ? await editor.edit(topic, input, request.id)
      : null;
    // Quiet topics need no call; a refused/invalid call aborts the entire edition.
    if (hasStories && !review) return null;
    topics.push({ ...topic, review });
  }
  return store.publish(
    request.generationKey,
    structuredClone({
      id: request.id,
      profileId,
      kind: 'weekly',
      windowStart: bounds.windowStart,
      windowEnd: bounds.windowEnd,
      topics,
    }),
  );
}
