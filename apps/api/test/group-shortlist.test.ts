import assert from 'node:assert/strict';
import { test } from 'node:test';

import { storyGroupingEnabled } from '../src/modules/curation/public/editorial';
import { groupShortlist } from '../src/modules/digests/application/group-shortlist';
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
