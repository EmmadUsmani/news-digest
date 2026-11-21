import type { DigestPreview } from '@digest/contracts';

/** Explicit publication metadata must come from storage, not snapshot dates. */
export interface WeeklySourceEdition {
  profileId: string | null;
  kind: 'daily' | 'weekly' | 'test';
  publishedAt: string | null;
  snapshot: DigestPreview;
}

/** Only saved selections enter the weekly editor; never raw candidate pools. */
export function weeklyReviewInput(
  editions: readonly WeeklySourceEdition[],
  target: { profileId: string | null; topicId: string; scheduledAt: string },
) {
  const end = Date.parse(target.scheduledAt);
  const date = new Date(end);
  if (
    !Number.isFinite(end) ||
    date.getUTCDay() !== 0 ||
    date.getUTCHours() !== 17 ||
    date.getUTCMinutes() !== 0 ||
    date.getUTCSeconds() !== 0 ||
    date.getUTCMilliseconds() !== 0
  )
    throw new Error('Weekly review requires a Sunday 17:00 UTC slot');
  const start = end - 7 * 24 * 60 * 60 * 1000;
  const windows = new Map<string, WeeklySourceEdition>();
  for (const edition of editions) {
    const published = Date.parse(edition.publishedAt ?? '');
    const windowStart = Date.parse(edition.snapshot.windowStart);
    const windowEnd = Date.parse(edition.snapshot.windowEnd);
    if (
      edition.kind !== 'daily' ||
      edition.profileId !== target.profileId ||
      !Number.isFinite(published) ||
      published > end ||
      !Number.isFinite(windowStart) ||
      !Number.isFinite(windowEnd) ||
      windowStart >= windowEnd ||
      windowEnd <= start ||
      windowEnd > end
    )
      continue;
    // A regeneration supersedes the same coverage window, not another day.
    const key = `${windowStart}/${windowEnd}`;
    const previous = windows.get(key);
    if (
      !previous ||
      published > Date.parse(previous.publishedAt!) ||
      (published === Date.parse(previous.publishedAt!) &&
        edition.snapshot.id.localeCompare(previous.snapshot.id) > 0)
    )
      windows.set(key, edition);
  }
  return {
    windowStart: new Date(start).toISOString(),
    windowEnd: new Date(end).toISOString(),
    editions: [...windows.values()]
      .sort(
        (a, b) =>
          Date.parse(a.snapshot.windowEnd) - Date.parse(b.snapshot.windowEnd) ||
          a.snapshot.id.localeCompare(b.snapshot.id),
      )
      .flatMap((edition) => {
        const topic = edition.snapshot.topics.find(
          (topic) => topic.id === target.topicId,
        );
        if (!topic) return [];
        return [
          {
            editionId: edition.snapshot.id,
            publishedAt: edition.publishedAt!,
            windowEnd: edition.snapshot.windowEnd,
            stories: structuredClone(topic.stories),
            posts: structuredClone(topic.posts ?? []),
          },
        ];
      }),
  };
}
