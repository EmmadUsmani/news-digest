// Offline review aid: saved cluster membership only; no semantic inference.
import { readFileSync, writeFileSync } from 'node:fs';

import { readerEditionSchema } from '@digest/contracts';
import { z } from 'zod';

import { canonicalUrl } from '../src/modules/ingestion/domain/normalize';

const captureSchema = z.object({
  schemaVersion: z.literal(1),
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }),
  capturedAt: z.string().datetime({ offset: true }),
  windowEnded: z.boolean().optional(),
  feeds: z.array(
    z.object({
      topic: z.string(),
      name: z.string(),
      observedAt: z.string().datetime({ offset: true }),
      error: z.string().optional(),
      stories: z
        .array(
          z.object({
            title: z.string(),
            excerpt: z.string().nullable().optional(),
            url: z.string().url(),
            publishedAt: z.string().datetime({ offset: true }),
          }),
        )
        .optional(),
    }),
  ),
});

export function traceReferenceStories(
  captureInput: unknown,
  editionInput: unknown,
) {
  const capture = captureSchema.parse(captureInput);
  const edition = readerEditionSchema.parse(editionInput);
  const start = Date.parse(capture.start);
  const end = Date.parse(capture.end);
  if (
    start >= end ||
    start !== Date.parse(edition.windowStart) ||
    end !== Date.parse(edition.windowEnd)
  )
    throw new Error('Reference and edition windows must match exactly');
  const names = edition.topics.map((topic) => topic.name);
  if (new Set(names).size !== names.length)
    throw new Error('Ambiguous topic names');
  return {
    editionId: edition.id,
    windowStart: edition.windowStart,
    windowEnd: edition.windowEnd,
    capturedAt: capture.capturedAt,
    windowEnded: Date.parse(capture.capturedAt) >= end,
    purpose:
      'Saved selected-cluster URL trace; unresolved entries require event and importance review, not automatic misses or recall',
    feeds: capture.feeds.map((feed) => {
      const topic = edition.topics.find((item) => item.name === feed.topic);
      if (feed.error || !feed.stories)
        return {
          topic: feed.topic,
          name: feed.name,
          observedAt: feed.observedAt,
          error: feed.error ?? 'Missing stories',
        };
      return {
        topic: feed.topic,
        name: feed.name,
        observedAt: feed.observedAt,
        topicAvailable: !!topic,
        stories: feed.stories.map((reference) => {
          const date = Date.parse(reference.publishedAt);
          if (date < start || date >= end)
            throw new Error('Reference outside edition window');
          const url = canonicalUrl(reference.url);
          if (!url) throw new Error('Invalid reference URL');
          const selectedClusters = (topic?.stories ?? [])
            .filter((story) =>
              [
                story.url,
                ...(story.coverage ?? []).map((member) => member.url),
              ].some((candidate) => canonicalUrl(candidate) === url),
            )
            .map((story) => ({ id: story.id, title: story.title }));
          return {
            ...reference,
            selectedClusters,
            status: selectedClusters.length
              ? 'selected-cluster-url'
              : 'needs-event-review',
          };
        }),
      };
    }),
  };
}

if (require.main === module) {
  const [capture, edition, output] = process.argv.slice(2);
  if (process.argv.length !== 5 || !output)
    throw new Error(
      'Usage: tsx apps/api/scripts/trace-reference-stories.ts capture.json reader.json output.json',
    );
  const report = traceReferenceStories(
    JSON.parse(readFileSync(capture, 'utf8')),
    JSON.parse(readFileSync(edition, 'utf8')),
  );
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n', {
    flag: 'wx',
    mode: 0o600,
  });
  console.log(
    JSON.stringify({ editionId: report.editionId, feeds: report.feeds.length }),
  );
}
