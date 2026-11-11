import assert from 'node:assert/strict';
import { test } from 'node:test';

import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import type { OwnedStoryGroup } from '../src/modules/curation/public/editorial';
import { jointStoryEdits } from '../src/modules/digests/application/joint-story-edits';
import { jointStoryShortlists } from '../src/modules/digests/application/joint-story-shortlists';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';

const start = new Date('2026-11-10T00:00:00Z');
const end = new Date('2026-11-11T00:00:00Z');
const article = (id: string): Candidate => ({
  id,
  title: 'Reported policy announcement',
  url: `https://example.com/${id}`,
  excerpt: 'Recorded reporting about the announcement.',
  publishedAt: '2026-11-10T12:00:00Z',
  sources: [id],
  publisher: { name: `Publisher ${id}`, url: `https://example.com/${id}` },
  points: 0,
});
const pools = [
  {
    scope: { id: 'world', name: 'World', description: 'Global', guidance: '' },
    candidates: [article('a'), article('b')],
  },
  {
    scope: { id: 'us', name: 'U.S.', description: 'Domestic', guidance: '' },
    candidates: [article('c'), article('d')],
  },
];

void test('joint ownership moves whole events before ranking, preserving coverage and scores', async () => {
  let calls = 0;
  const result = await jointStoryShortlists(
    {
      async assignTopics(scopes, candidates, runId) {
        calls++;
        assert.deepEqual(
          scopes,
          pools.map((pool) => pool.scope),
        );
        assert.equal(runId, 'edition');
        assert.deepEqual(
          candidates.map((item) => [item.id, item.topicId]),
          [
            ['a', 'world'],
            ['b', 'world'],
            ['c', 'us'],
            ['d', 'us'],
          ],
        );
        return [
          { topicId: 'us', ids: ['a', 'c'] },
          { topicId: 'world', ids: ['b', 'd'] },
        ];
      },
    },
    pools,
    start,
    end,
    'edition',
  );
  assert.equal(calls, 1);
  assert.ok(result);
  const stories = [...result.values()].flat();
  assert.equal(stories.length, 2);
  assert.deepEqual(
    result.get('us')![0].coverage.map((item) => item.id),
    ['a', 'c'],
  );
  assert.deepEqual(
    result.get('world')![0].coverage.map((item) => item.id),
    ['b', 'd'],
  );
  assert.deepEqual(
    stories.flatMap((story) => story.coverage.map((item) => item.id)).sort(),
    ['a', 'b', 'c', 'd'],
  );
  assert.equal(result.get('us')![0].coverage[1].publisher?.name, 'Publisher c');
  assert.equal(
    result.get('us')![0].score,
    rank([article('a')], start, end, 10)[0].score,
  );
  assert.deepEqual(
    pools[0].candidates.map((item) => item.id),
    ['a', 'b'],
  );
});

void test('unavailable or incomplete ownership refuses the whole split', async () => {
  const decisions: (OwnedStoryGroup[] | null)[] = [
    null,
    [],
    [{ topicId: 'us', ids: ['a', 'b', 'c'] }],
    [{ topicId: 'unknown', ids: ['a', 'b', 'c', 'd'] }],
    [{ topicId: 'us', ids: ['a', 'b', 'c', 'd', 'other'] }],
    [
      { topicId: 'us', ids: ['a', 'b', 'c', 'd'] },
      { topicId: 'world', ids: ['a'] },
    ],
    [
      { topicId: 'us', ids: ['a', 'b', 'c', 'd'] },
      { topicId: 'world', ids: [] },
    ],
  ];
  for (const decision of decisions) {
    assert.equal(
      await jointStoryShortlists(
        {
          async assignTopics() {
            return decision;
          },
        },
        pools,
        start,
        end,
        'edition',
      ),
      null,
    );
  }
  assert.equal(
    await jointStoryShortlists(
      {
        async assignTopics() {
          throw new Error('refused');
        },
      },
      pools,
      start,
      end,
      'edition',
    ),
    null,
  );
});

void test('invalid pools refuse before inference and empty pools require no request', async () => {
  const port = {
    async assignTopics(): Promise<null> {
      assert.fail('no inference');
    },
  };
  for (const invalid of [
    pools.slice(0, 1),
    [pools[0], pools[0]],
    [
      pools[0],
      {
        ...pools[1],
        candidates: [{ ...article('a'), url: 'https://other.example/a' }],
      },
    ],
    [
      pools[0],
      {
        ...pools[1],
        candidates: Array.from({ length: 40 }, (_, i) => article(`extra-${i}`)),
      },
    ],
  ]) {
    assert.equal(
      await jointStoryShortlists(port, invalid, start, end, 'edition'),
      null,
    );
  }
  assert.equal(
    await jointStoryShortlists(null, pools, start, end, 'edition'),
    null,
  );
  assert.equal(
    await jointStoryShortlists(port, pools, end, start, 'edition'),
    null,
  );
  assert.deepEqual(
    await jointStoryShortlists(
      port,
      pools.map((pool) => ({ ...pool, candidates: [] })),
      start,
      end,
      'edition',
    ),
    new Map([
      ['world', []],
      ['us', []],
    ]),
  );
});

void test('real ownership parser feeds the ranked bridge with a recorded response', async () => {
  const grouping = new EventGrouping(
    {
      async json(request, parse) {
        assert.equal(request.purpose, 'joint-story-grouping-v1');
        return parse({
          groups: [{ topicId: 'us', ids: ['a', 'b', 'c', 'd'] }],
        });
      },
    },
    { id: 'recorded', input: 0, cacheWrite: 0, cacheRead: 0, output: 0 },
  );
  const result = await jointStoryShortlists(
    grouping,
    pools,
    start,
    end,
    'recorded',
  );
  assert.ok(result);
  assert.deepEqual(result.get('world'), []);
  assert.equal(result.get('us')!.length, 1);
  assert.equal(result.get('us')![0].coverage.length, 4);
});

void test('shared articles enter ownership once with merged source evidence and no input mutation', async () => {
  const shared = article('shared');
  const input = [
    { ...pools[0], candidates: [{ ...shared, sources: ['World feed'] }] },
    {
      ...pools[1],
      candidates: [{ ...shared, sources: ['US feed'] }, article('domestic')],
    },
  ];
  const before = structuredClone(input);
  const result = await jointStoryShortlists(
    {
      async assignTopics(scopes, candidates) {
        assert.equal(scopes.length, 2);
        assert.deepEqual(
          candidates.map((item) => item.id),
          ['shared', 'domestic'],
        );
        assert.equal(candidates[0].outlet, 'US feed, World feed');
        return [{ topicId: 'us', ids: ['shared', 'domestic'] }];
      },
    },
    input,
    start,
    end,
    'edition',
  );
  assert.ok(result);
  assert.deepEqual(result.get('world'), []);
  const coverage = result.get('us')![0].coverage;
  assert.deepEqual(coverage.map((item) => item.id).sort(), [
    'domestic',
    'shared',
  ]);
  assert.deepEqual(result.get('us')![0].sources, [
    'US feed',
    'World feed',
    'domestic',
  ]);
  assert.deepEqual(input, before);
});

void test('shared pool size counts unique reports before the ownership bound', async () => {
  const candidates = Array.from({ length: 40 }, (_, i) =>
    article(`report-${i}`),
  );
  let calls = 0;
  const result = await jointStoryShortlists(
    {
      async assignTopics(_scopes, items) {
        calls++;
        assert.equal(items.length, 40);
        return [{ topicId: 'us', ids: items.map((item) => item.id) }];
      },
    },
    pools.map((pool) => ({ ...pool, candidates })),
    start,
    end,
    'edition',
  );
  assert.ok(result);
  assert.equal(calls, 1);
  assert.equal(result.get('us')![0].coverage.length, 40);
});

void test('conflicting shared snapshots refuse before ownership instead of silently losing evidence', async () => {
  for (const changed of [
    { title: 'Different report' },
    { excerpt: 'Different evidence' },
    { publishedAt: '2026-11-10T13:00:00Z' },
    { points: 42 },
    { publisher: { name: 'Other publisher', url: null } },
    { imageUrl: 'https://example.com/image.jpg' },
  ]) {
    assert.equal(
      await jointStoryShortlists(
        {
          async assignTopics() {
            assert.fail('conflict must refuse before inference');
          },
        },
        [
          { ...pools[0], candidates: [article('shared')] },
          { ...pools[1], candidates: [{ ...article('shared'), ...changed }] },
        ],
        start,
        end,
        'edition',
      ),
      null,
    );
  }
});

void test('paired edits use exclusive owned shortlists and return both results together', async () => {
  const calls: string[] = [];
  const result = await jointStoryEdits(
    {
      async assignTopics() {
        return [
          { topicId: 'world', ids: ['a', 'c'] },
          { topicId: 'us', ids: ['b', 'd'] },
        ];
      },
    },
    {
      async edit(scope, ranked, budget, runId) {
        calls.push(scope.id);
        assert.equal(budget, 5);
        assert.equal(runId, 'paired');
        assert.deepEqual(
          ranked[0].coverage.map((item) => item.id),
          scope.id === 'world' ? ['a', 'c'] : ['b', 'd'],
        );
        return {
          model: 'recorded',
          brief: ['Recorded development'],
          stories: [
            {
              id: ranked[0].id,
              evidenceIds: [ranked[0].id],
              headline: 'Recorded headline',
              summary: 'Recorded summary',
              whyItMatters: 'Recorded significance',
              rationale: 'Recorded selection',
            },
          ],
        };
      },
    },
    pools.map((pool) => ({ ...pool, budget: 5 })),
    start,
    end,
    'paired',
  );
  assert.deepEqual(calls, ['world', 'us']);
  assert.deepEqual([...result!.keys()], ['world', 'us']);
});

void test('paired edit refusal never returns a partial edition or calls later editors', async () => {
  for (const failure of [
    'first',
    'second',
    'throw',
    'foreign',
    'evidence',
    'duplicate',
    'budget',
  ]) {
    let calls = 0;
    const result = await jointStoryEdits(
      {
        async assignTopics() {
          return [
            { topicId: 'world', ids: ['a', 'b'] },
            { topicId: 'us', ids: ['c', 'd'] },
          ];
        },
      },
      {
        async edit(_scope, ranked) {
          calls++;
          if (failure === 'throw') throw new Error('unavailable');
          if (failure === 'first' || (failure === 'second' && calls === 2))
            return null;
          const story = {
            id: failure === 'foreign' ? 'c' : ranked[0].id,
            evidenceIds: failure === 'evidence' ? ['c'] : [ranked[0].id],
            headline: 'Recorded headline',
            summary: 'Recorded summary',
            whyItMatters: 'Recorded significance',
            rationale: 'Recorded rationale',
          };
          return {
            model: 'recorded',
            brief: [],
            stories:
              failure === 'second'
                ? []
                : failure === 'duplicate' || failure === 'budget'
                  ? [story, story]
                  : [story],
          };
        },
      },
      pools.map((pool) => ({ ...pool, budget: failure === 'budget' ? 1 : 5 })),
      start,
      end,
      'paired',
    );
    assert.equal(result, null, failure);
    assert.equal(calls, failure === 'second' ? 2 : 1, failure);
  }
});

void test('paired edit validates budgets and ownership before editing', async () => {
  const editor = {
    async edit() {
      assert.fail('no editor request');
    },
  };
  for (const budget of [-1, 11, 1.5, NaN]) {
    assert.equal(
      await jointStoryEdits(
        null,
        editor,
        pools.map((pool) => ({ ...pool, budget })),
        start,
        end,
        'paired',
      ),
      null,
    );
  }
  assert.equal(
    await jointStoryEdits(
      null,
      editor,
      pools.map((pool) => ({ ...pool, budget: 5 })),
      start,
      end,
      'paired',
    ),
    null,
  );
});

void test('paired triage uses destination scores after ownership and retains whole-event evidence', async () => {
  const calls: string[] = [];
  const result = await jointStoryEdits(
    {
      async assignTopics() {
        calls.push('ownership');
        return [
          { topicId: 'us', ids: ['a', 'c'] },
          { topicId: 'world', ids: ['b'] },
          { topicId: 'us', ids: ['d'] },
        ];
      },
    },
    {
      async edit(scope, ranked) {
        calls.push(`edit:${scope.id}`);
        assert.deepEqual(
          ranked.flatMap((story) => story.coverage.map((report) => report.id)),
          scope.id === 'us' ? ['a', 'c'] : [],
        );
        return { model: 'recorded', brief: [], stories: [] };
      },
    },
    pools.map((pool) => ({ ...pool, budget: 5 })),
    start,
    end,
    'scored',
    {
      async score(scope, candidates) {
        calls.push(`triage:${scope.id}`);
        return {
          unscoredIds: [],
          scores: candidates.map(({ id }) => ({
            id,
            relevance: scope.id === 'us' && id === 'a' ? 9 : 1,
            importance: 8,
            event: id,
            rationale: 'Recorded scope assessment',
          })),
        };
      },
    },
  );
  assert.ok(result);
  assert.deepEqual(calls, [
    'triage:world',
    'triage:us',
    'ownership',
    'edit:world',
    'edit:us',
  ]);
});

void test('incomplete paired triage stops ownership and editing', async () => {
  const result = await jointStoryEdits(
    {
      async assignTopics() {
        assert.fail('ownership must not run');
      },
    },
    {
      async edit() {
        assert.fail('editor must not run');
      },
    },
    pools.map((pool) => ({ ...pool, budget: 5 })),
    start,
    end,
    'refused',
    {
      async score() {
        return { scores: [], unscoredIds: ['a'] };
      },
    },
  );
  assert.equal(result, null);
});

void test('destination importance selects ten whole events before recency ranking', async () => {
  const candidates = Array.from({ length: 12 }, (_, index) =>
    article(String(index).padStart(2, '0')),
  );
  const result = await jointStoryShortlists(
    {
      async assignTopics() {
        return candidates.map(({ id }) => ({ topicId: 'us', ids: [id] }));
      },
    },
    [
      { scope: pools[0].scope, candidates },
      { scope: pools[1].scope, candidates: [] },
    ],
    start,
    end,
    'importance',
    {
      async score(scope, reports) {
        return {
          unscoredIds: [],
          scores: reports.map(({ id }) => ({
            id,
            relevance: 8,
            importance: scope.id === 'us' && ['10', '11'].includes(id) ? 10 : 4,
            event: id,
            rationale: 'Recorded priority',
          })),
        };
      },
    },
  );
  assert.ok(result);
  const ids = result.get('us')!.map(({ id }) => id);
  assert.equal(ids.length, 10);
  assert.ok(ids.includes('10') && ids.includes('11'));
  assert.ok(!ids.includes('08') && !ids.includes('09'));
});
