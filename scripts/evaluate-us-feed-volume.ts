// Recorded public-feed snapshot; no network, LLM or production storage access.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import type { ContentItem } from '../apps/api/src/modules/ingestion/domain/ports';

const snapshot = JSON.parse(
  readFileSync('apps/api/test/fixtures/us-feed-volume-2026-11-11.json', 'utf8'),
) as {
  capturedAt: string;
  windowStart: string;
  windowEnd: string;
  feeds: { name: string; url: string; items: ContentItem[] }[];
  reviewedDomesticEvents: { label: string; urls: string[] }[];
};
assert.ok(snapshot.capturedAt > snapshot.windowEnd);
const available = new Map<string, ContentItem>();
for (const feed of snapshot.feeds) {
  const eligible = feed.items.filter(
    (item) =>
      item.publishedAt >= snapshot.windowStart &&
      item.publishedAt < snapshot.windowEnd,
  );
  for (const item of eligible) available.set(item.url, item);
  console.log(
    `${feed.name}: ${feed.items.length} retained, ${eligible.length} in window, ${eligible.filter((item) => item.excerpt.length >= 200).length} excerpts >=200 characters`,
  );
}
const reviewed = new Set<string>();
for (const event of snapshot.reviewedDomesticEvents) {
  assert.ok(event.label && event.urls.length);
  for (const url of event.urls) {
    assert.ok(available.has(url), 'Reviewed report outside captured window');
    assert.ok(
      !reviewed.has(url),
      'Report assigned to multiple reviewed events',
    );
    reviewed.add(url);
  }
  console.log(
    `Reviewed domestic event: ${event.label} (${event.urls.length} reports)`,
  );
}
assert.equal(snapshot.reviewedDomesticEvents.length, 5);
console.log(
  `${available.size} unique report URLs; five manually reviewed event examples, not a complete semantic partition or AI selection.`,
);
console.log(
  'Snapshot was fetched after cutoff: feed retention cannot reconstruct availability at the scheduled run. No activation approval.',
);
