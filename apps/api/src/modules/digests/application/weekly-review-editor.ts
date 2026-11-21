import { z } from 'zod';

import type { weeklyReviewInput } from '../domain/weekly-review-input';

type WeeklyInput = ReturnType<typeof weeklyReviewInput>;

/** Opaque references keep repeated story IDs in separate daily editions distinct. */
export function weeklyEditorEvidence(input: WeeklyInput) {
  return input.editions.flatMap((edition, day) => [
    ...edition.stories.map((story, index) => ({
      reference: `d${day}:s${index}`,
      kind: 'story' as const,
      editionId: edition.editionId,
      itemId: story.id,
      publishedAt: edition.publishedAt,
      title: story.title,
      text: story.summary || story.excerpt || '',
      url: story.url,
    })),
    ...edition.posts.map((post, index) => ({
      reference: `d${day}:p${index}`,
      kind: 'post' as const,
      editionId: edition.editionId,
      itemId: post.externalId,
      publishedAt: edition.publishedAt,
      title: post.author,
      text: post.text,
      url: post.url,
    })),
  ]);
}

export const weeklyEditorResponseSchema = z
  .object({
    stories: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(300),
            summary: z.string().trim().min(1).max(2000),
            references: z.array(z.string()).min(1),
          })
          .strict(),
      )
      .max(5),
  })
  .strict();

/** Reject the entire response on fabricated or reused coverage. Never invent a
 * weekly fallback or mutate the saved daily snapshots when editing fails. */
export function validateWeeklyReview(input: WeeklyInput, response: unknown) {
  const parsed = weeklyEditorResponseSchema.safeParse(response);
  if (!parsed.success) return null;
  const evidence = new Map(
    weeklyEditorEvidence(input).map((item) => [item.reference, item]),
  );
  const used = new Set<string>();
  const stories = [];
  for (const story of parsed.data.stories) {
    const coverage = [];
    let hasStory = false;
    for (const reference of story.references) {
      const source = evidence.get(reference);
      if (!source || used.has(reference)) return null;
      used.add(reference);
      hasStory ||= source.kind === 'story';
      coverage.push(structuredClone(source));
    }
    // Posts may support an event, but a weekly story must have daily news coverage.
    if (!hasStory) return null;
    stories.push({ title: story.title, summary: story.summary, coverage });
  }
  return {
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    stories,
  };
}
