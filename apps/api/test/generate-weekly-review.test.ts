import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  generateWeeklyReview,
  type WeeklyPublication,
  type WeeklyPublicationStore,
} from '../src/modules/digests/application/generate-weekly-review';
import { WeeklyReviewEditor } from '../src/modules/digests/application/weekly-review-editor';
import { weeklyReviewInput } from '../src/modules/digests/domain/weekly-review-input';

const request = {
  id: 'weekly-1',
  generationKey: 'week:1',
  profileId: null,
  scheduledAt: '2026-11-22T17:00:00Z',
  topics: [
    { id: 'tech', name: 'Tech' },
    { id: 'quiet', name: 'Quiet' },
  ],
};
function setup() {
  const saved = new Map<string, WeeklyPublication>();
  let ready = true;
  let calls = 0;
  let refuse = false;
  const input = {
    ...weeklyReviewInput([], { ...request, topicId: 'tech' }),
    editions: [
      {
        editionId: 'daily',
        publishedAt: '2026-11-22T15:00:00Z',
        windowEnd: '2026-11-22T15:00:00Z',
        stories: [
          {
            id: 'story',
            title: 'Daily',
            url: 'https://example.com',
            excerpt: 'Saved facts.',
            sources: ['Source'],
            publishedAt: '2026-11-22T14:00:00Z',
            score: 1,
            reasons: [],
          },
        ],
        posts: [],
      },
    ],
  };
  const store: WeeklyPublicationStore = {
    async find(key) {
      return structuredClone(saved.get(key) ?? null);
    },
    async sundayDailyPublished() {
      return ready;
    },
    async weeklyReviewInput(target) {
      return target.topicId === 'quiet'
        ? { ...input, editions: [] }
        : structuredClone(input);
    },
    async publish(key, snapshot) {
      if (!saved.has(key)) saved.set(key, structuredClone(snapshot));
      return structuredClone(saved.get(key)!);
    },
  };
  const editor = new WeeklyReviewEditor(
    {
      async json() {
        calls++;
        return refuse
          ? null
          : {
              stories: [
                {
                  title: 'Weekly',
                  summary: 'Saved facts.',
                  references: ['d0:s0'],
                },
              ],
            };
      },
    },
    { id: 'test-model', input: 0, output: 0, cacheWrite: 0, cacheRead: 0 },
  );
  return {
    store,
    editor,
    saved,
    input,
    get calls() {
      return calls;
    },
    set ready(value: boolean) {
      ready = value;
    },
    set refuse(value: boolean) {
      refuse = value;
    },
  };
}

void test('weekly publication saves all topics with provenance, skips quiet calls and keeps regeneration immutable', async () => {
  const s = setup();
  const before = structuredClone(s.input);
  const first = await generateWeeklyReview(s.store, s.editor, request);
  assert.equal(first?.kind, 'weekly');
  assert.equal(
    first?.topics[0].review?.stories[0].coverage[0].editionId,
    'daily',
  );
  assert.equal(first?.topics[1].review, null);
  assert.equal(s.calls, 1);
  first.topics[0].name = 'Changed';
  assert.equal(
    (await generateWeeklyReview(s.store, s.editor, request))?.topics[0].name,
    'Tech',
  );
  assert.equal(s.calls, 1);
  await generateWeeklyReview(s.store, s.editor, {
    ...request,
    id: 'weekly-2',
    generationKey: 'week:2',
  });
  assert.equal(s.saved.size, 2);
  assert.equal(s.saved.get('week:1')?.id, 'weekly-1');
  assert.deepEqual(s.input, before);
});

void test('weekly publication waits for daily and never publishes partial editor failures', async () => {
  const s = setup();
  s.ready = false;
  assert.equal(await generateWeeklyReview(s.store, s.editor, request), null);
  assert.equal(s.calls, 0);
  s.ready = true;
  const edit = s.editor.edit.bind(s.editor);
  let calls = 0;
  assert.equal(
    await generateWeeklyReview(
      s.store,
      {
        async edit(...args) {
          return ++calls === 2 ? null : edit(...args);
        },
      },
      {
        ...request,
        topics: [request.topics[0], { id: 'world', name: 'World' }],
      },
    ),
    null,
  );
  assert.equal(calls, 2);
  assert.equal(s.saved.size, 0);
});

void test('invalid weekly slots, duplicate topics and mismatched input fail before publication', async () => {
  const s = setup();
  await assert.rejects(
    generateWeeklyReview(s.store, s.editor, {
      ...request,
      scheduledAt: '2026-11-21T17:00:00Z',
    }),
  );
  await assert.rejects(
    generateWeeklyReview(s.store, s.editor, {
      ...request,
      topics: [request.topics[0], request.topics[0]],
    }),
  );
  s.store.weeklyReviewInput = async () => ({
    ...s.input,
    windowEnd: '2026-11-23T17:00:00Z',
  });
  await assert.rejects(
    generateWeeklyReview(s.store, s.editor, request),
    /coverage mismatch/,
  );
  assert.equal(s.calls, 0);
  assert.equal(s.saved.size, 0);
});
