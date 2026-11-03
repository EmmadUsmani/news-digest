import assert from 'node:assert/strict';
import test from 'node:test';

import {
  type FollowupTopic,
  runSearchFollowups,
} from '../src/modules/social/application/search-followups';

const topics: FollowupTopic[] = ['NBA', 'Gaming'].map((id) => ({
  id,
  request: {
    topic: id,
    guidance: '',
    fromDate: '2026-11-02',
    toDate: '2026-11-03',
  },
  openState: 'completed',
  openVerifiedAdditions: 0,
  stories: [{ id: `${id}-event`, title: `${id} event`, importance: 1 }],
  handles: [id],
}));

void test('optional searches wait for every open search, then prioritize reactions over accounts', async () => {
  const calls: string[] = [];
  const execute = async (id: string, request: FollowupTopic['request']) => {
    calls.push(`${id}:${request.reactionStory ? 'reaction' : 'accounts'}`);
    return { state: 'completed' as const };
  };
  for (const openState of ['pending', 'failed', 'budget-blocked'] as const) {
    assert.deepEqual(
      await runSearchFollowups(
        [topics[0], { ...topics[1], openState }],
        async () => true,
        execute,
      ),
      [],
    );
  }
  await runSearchFollowups(topics, async () => true, execute);
  assert.deepEqual(calls, ['NBA:reaction', 'Gaming:reaction']);
});

void test('optional searches stop on budget denial or changed schedule/window', async () => {
  let calls = 0;
  const blocked = await runSearchFollowups(
    topics,
    async () => true,
    async () => {
      calls++;
      return { state: 'budget-blocked' };
    },
  );
  assert.equal(calls, 1);
  assert.equal(blocked.length, 1);
  let checks = 0;
  const stopped = await runSearchFollowups(
    topics,
    async () => ++checks < 2,
    async () => ({ state: 'completed' }),
  );
  assert.equal(checks, 2);
  assert.equal(stopped.length, 1);
});

void test('invalid account lists are skipped and duplicate topic input cannot spend', async () => {
  const input = structuredClone(topics);
  input[0].handles = ['NBA', 'nba'];
  input[1].handles = [];
  const before = structuredClone(input);
  const results = await runSearchFollowups(
    input,
    async () => true,
    async () => ({ state: 'completed' }),
  );
  assert.equal(results.length, 2);
  assert.ok(
    results.every(
      ({ request }) => request.reactionStory && request.handles === undefined,
    ),
  );
  assert.deepEqual(input, before);
  assert.deepEqual(
    await runSearchFollowups(
      [topics[0], topics[0]],
      async () => true,
      async () => {
        throw new Error('must not execute');
      },
    ),
    [],
  );
});

void test('followups reject restricted or already specialized base requests', async () => {
  for (const request of [
    { ...topics[0].request, handles: ['NBA'] },
    { ...topics[0].request, reactionStory: { id: 'event', title: 'Event' } },
  ]) {
    assert.deepEqual(
      await runSearchFollowups(
        [{ ...topics[0], request }],
        async () => true,
        async () => {
          throw new Error('must not execute');
        },
      ),
      [],
    );
  }
});

void test('only low-yield open searches qualify; invalid or missing counts fail closed', async () => {
  for (const openVerifiedAdditions of [
    0,
    1,
    2,
    3,
    4,
    -1,
    0.5,
    NaN,
    Infinity,
    undefined,
  ]) {
    let calls = 0;
    const results = await runSearchFollowups(
      [{ ...topics[0], openVerifiedAdditions } as FollowupTopic],
      async () => true,
      async () => {
        calls++;
        return { state: 'completed' };
      },
    );
    const allowed = [0, 1, 2].includes(openVerifiedAdditions as number);
    assert.equal(calls, allowed ? 1 : 0);
    assert.equal(results.length, calls);
  }
});

void test('one optional attempt per topic, including failures; accounts fill topics without stories', async () => {
  const input = structuredClone(topics);
  input[0].stories.push({
    id: 'bigger',
    title: 'Biggest event',
    importance: 2,
  });
  input[1].stories = [];
  const before = structuredClone(input);
  const results = await runSearchFollowups(
    input,
    async () => true,
    async () => ({ state: 'failed' }),
  );
  assert.deepEqual(
    results.map(({ topicId, request }) => ({
      topicId,
      story: request.reactionStory?.id,
      handles: request.handles,
    })),
    [
      { topicId: 'NBA', story: 'bigger', handles: undefined },
      { topicId: 'Gaming', story: undefined, handles: ['Gaming'] },
    ],
  );
  assert.deepEqual(input, before);
});
