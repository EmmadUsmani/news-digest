import assert from 'node:assert/strict';
import { test } from 'node:test';

import { storyGroupingEnabled } from '../src/modules/curation/public/editorial';
import { groupShortlist } from '../src/modules/digests/application/group-shortlist';
import { clusterEvidence } from '../src/modules/digests/domain/cluster-evidence';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';

const start = new Date('2026-11-01T00:00:00Z');
const end = new Date('2026-11-02T00:00:00Z');
const candidates: Candidate[] = ['a', 'b', 'c'].map((id) => ({
  id,
  title: 'A reported launch',
  url: `https://example.com/${id}`,
  excerpt: 'Recorded article facts.',
  sources: [id],
  points: 0,
  publishedAt: '2026-11-01T12:00:00Z',
}));

void test('publication grouping is explicit, bounded and preserves coverage without a score bonus', async () => {
  let calls = 0;
  const matches = await groupShortlist(
    {
      async group(topic, items, run) {
        calls++;
        assert.equal(topic, 'topic');
        assert.equal(run, 'edition');
        assert.deepEqual(
          items,
          candidates.map((item) => ({
            id: item.id,
            topicId: 'topic',
            title: item.title,
            outlet: item.sources.join(', '),
            publishedAt: item.publishedAt,
            excerpt: item.excerpt,
          })),
        );
        return [['a', 'b']];
      },
    },
    'topic',
    candidates,
    'edition',
  );
  const grouped = rank(candidates, start, end, 10, matches);
  const separate = rank(candidates, start, end, 10);
  assert.equal(calls, 1);
  assert.equal(grouped.length, 2);
  assert.deepEqual(
    grouped[0].coverage.map((item) => item.id),
    ['a', 'b'],
  );
  assert.deepEqual(grouped[0].sources, ['a', 'b']);
  assert.equal(grouped[0].score, separate[0].score);
  assert.equal(matches(candidates[0], candidates[2]), false);
  assert.equal(matches(candidates[0], candidates[0]), false);
});

void test('cluster evidence preserves bounded member reporting separately from an empty lead excerpt', () => {
  const pool: Candidate[] = [
    'lead',
    'empty',
    'verge',
    'other',
    'overflow',
    'unrelated',
  ].map((id, index) => ({
    id,
    title:
      id === 'lead' ? 'NVIDIA CEO transition announced' : `${id} reporting`,
    url: `https://example.com/${id}`,
    excerpt: ['lead', 'empty'].includes(id)
      ? ''
      : `${id} attributed facts. `.repeat(100),
    publisher: { name: id, url: `https://example.com/${id}` },
    sources: [id],
    points: 100 - index,
    publishedAt: '2026-11-01T12:00:00Z',
  }));
  const grouped = rank(
    pool,
    start,
    end,
    10,
    (a, b) => a.id !== 'unrelated' && b.id !== 'unrelated',
  );
  const original = rank(pool, start, end, 10).find(
    (item) => item.id === 'lead',
  )!;
  assert.equal(grouped.length, 2);
  const story = grouped[0];
  assert.equal(story.id, original.id);
  assert.equal(story.score, original.score);
  assert.equal(story.title, original.title);
  assert.equal(story.excerpt, '');
  assert.equal(story.coverage.length, 5);
  const evidence = clusterEvidence(story, pool);
  assert.deepEqual(
    evidence.map((item) => item.id),
    ['lead', 'verge', 'other'],
  );
  assert.deepEqual(evidence[1].publisher, pool[2].publisher);
  assert.deepEqual(evidence[1].sources, ['verge']);
  assert.equal(evidence[1].url, pool[2].url);
  assert.ok(evidence.every((item) => item.excerpt.length <= 600));
  assert.ok(evidence.every((item) => item.title.length <= 300));
  assert.deepEqual(
    clusterEvidence(grouped[1], pool).map((item) => item.id),
    ['unrelated'],
  );
  assert.deepEqual(
    rank(
      [...pool].reverse(),
      start,
      end,
      10,
      (a, b) => a.id !== 'unrelated' && b.id !== 'unrelated',
    ),
    grouped,
  );
  assert.equal(pool[2].excerpt.length > 600, true);
  const malformedCoverage = {
    ...story,
    coverage: [
      story.coverage[0],
      story.coverage[2],
      story.coverage[2],
      { ...story.coverage[2], id: 'missing' },
      story.coverage[3],
    ],
  };
  assert.deepEqual(
    clusterEvidence(malformedCoverage, pool).map((item) => item.id),
    ['lead', 'verge', 'other'],
  );
  assert.throws(
    () => clusterEvidence(story, []),
    /Missing cluster representative/,
  );
  assert.equal(
    clusterEvidence(story, [...pool].reverse())[1].excerpt,
    evidence[1].excerpt,
  );
  assert.equal(
    clusterEvidence(
      story,
      pool.map((item) =>
        item.id === 'verge'
          ? { ...item, excerpt: 'a'.repeat(599) + '😀' }
          : item,
      ),
    )[1].excerpt,
    'a'.repeat(599),
  );
});

void test('disabled, refused, failed and invalid grouping leave every article separate', async () => {
  for (const groups of [
    [],
    [['a', 'unknown']],
    [
      ['a', 'b'],
      ['b', 'c'],
    ],
    [['a']],
    [['a', 'a']],
  ]) {
    const matches = await groupShortlist(
      {
        async group() {
          return groups;
        },
      },
      'topic',
      candidates,
      'edition',
    );
    assert.equal(rank(candidates, start, end, 10, matches).length, 3);
  }
  for (const port of [
    null,
    {
      async group(): Promise<string[][]> {
        throw new Error('unavailable');
      },
    },
  ]) {
    const matches = await groupShortlist(port, 'topic', candidates, 'edition');
    assert.equal(rank(candidates, start, end, 10, matches).length, 3);
  }
  for (const items of [
    [],
    [candidates[0]],
    Array.from({ length: 41 }, () => candidates[0]),
  ]) {
    await groupShortlist(
      {
        async group() {
          assert.fail('must not call grouping');
        },
      },
      'topic',
      items,
      'edition',
    );
  }
});

void test('story grouping requires an explicit valid deployment switch', () => {
  assert.equal(storyGroupingEnabled({}), false);
  assert.equal(
    storyGroupingEnabled({ LLM_STORY_GROUPING_ENABLED: '0' }),
    false,
  );
  assert.equal(storyGroupingEnabled({ LLM_STORY_GROUPING_ENABLED: '1' }), true);
  assert.throws(
    () => storyGroupingEnabled({ LLM_STORY_GROUPING_ENABLED: 'true' }),
    /Invalid/,
  );
});

void test('forty scored articles group before the ten-story editor cap', async () => {
  const pool = Array.from({ length: 40 }, (_, index) => ({
    ...candidates[0],
    id: String(index),
    url: `https://example.com/article/${index}`,
    title: `Reported development ${index}`,
  }));
  let received = 0;
  const matches = await groupShortlist(
    {
      async group(_topic, items) {
        received = items.length;
        // The first thirty reports concern one event; ten others are distinct.
        return [items.slice(0, 30).map((item) => item.id)];
      },
    },
    'topic',
    pool,
    'edition',
  );
  const ranked = rank(pool, start, end, 10, matches);
  assert.equal(received, 40);
  assert.equal(ranked.length, 10);
  assert.ok(ranked.some((item) => item.coverage.length === 30));
  assert.ok(ranked.some((item) => Number(item.id) >= 30));
});
