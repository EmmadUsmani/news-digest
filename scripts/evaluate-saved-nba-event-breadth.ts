// Offline comparison of manual labels; no provider, database or network imports.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const root = new URL('../docs/edition-reviews/', import.meta.url);
const saved = JSON.parse(
  readFileSync(new URL('2026-11-18-bluesky-selection.json', root), 'utf8'),
) as {
  editionId: string;
  topics: {
    topic: string;
    posts: { author: string; text: string }[];
    otherPostTexts: { author: string; text: string }[];
  }[];
};
const labels = JSON.parse(
  readFileSync(new URL('2026-11-18-nba-event-labels.json', root), 'utf8'),
) as {
  editionId: string;
  posts: {
    id: string;
    author: string;
    textSha256: string;
    event: string;
    standalone: boolean;
  }[];
  preferred: string[];
};
assert.equal(saved.editionId, labels.editionId);
const nba = saved.topics.find((topic) => topic.topic === 'NBA');
assert.ok(nba);
const published = [...nba.otherPostTexts, ...nba.posts];
assert.equal(published.length, labels.posts.length);
assert.equal(new Set(labels.posts.map((post) => post.id)).size, 4);
for (const label of labels.posts) {
  const matches = published.filter(
    (post) =>
      post.author === label.author &&
      createHash('sha256').update(post.text).digest('hex') === label.textSha256,
  );
  assert.equal(matches.length, 1, `Saved text drift: ${label.id}`);
}
type Post = (typeof labels.posts)[number];
function measure(posts: Post[]) {
  const events = new Set(posts.map((post) => post.event));
  return {
    slots: posts.length,
    labeledEvents: events.size,
    repeatedEventSlots: posts.length - events.size,
    nonStandalone: posts.filter((post) => !post.standalone).length,
  };
}
const preferred = labels.preferred.map((id) => {
  const post = labels.posts.find((post) => post.id === id);
  assert.ok(post, `Unknown preferred ID: ${id}`);
  return post;
});
// Enumerate every subset, rather than blessing only the preferred answer.
const acceptable: string[][] = [];
for (let mask = 0; mask < 1 << labels.posts.length; mask++) {
  const subset = labels.posts.filter((_, index) => mask & (1 << index));
  const metrics = measure(subset);
  if (
    metrics.labeledEvents === 2 &&
    metrics.repeatedEventSlots === 0 &&
    metrics.nonStandalone === 0
  ) {
    acceptable.push(subset.map((post) => post.id));
  }
}
assert.deepEqual(acceptable, [
  ['curry-contract', 'lakers-streak'],
  ['curry-contract', 'lakers-duo'],
]);
assert.deepEqual(measure(labels.posts), {
  slots: 4,
  labeledEvents: 2,
  repeatedEventSlots: 2,
  nonStandalone: 1,
});
assert.deepEqual(measure(preferred), {
  slots: 2,
  labeledEvents: 2,
  repeatedEventSlots: 0,
  nonStandalone: 0,
});
console.log(
  JSON.stringify({
    mode: 'offline-manual-label-comparison',
    exactTexts: published.length,
    subsets: 1 << labels.posts.length,
    published: measure(labels.posts),
    preferred: measure(preferred),
    acceptable,
    providerCalls: 0,
    productionSelectionChanged: false,
  }),
);
