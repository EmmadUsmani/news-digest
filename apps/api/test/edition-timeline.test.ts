import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { evaluateEditionTimeline } from '../scripts/evaluate-edition-timeline';

void test('saved five-topic timeline retains late fifth-topic work and conserves all HTTP intervals', () => {
  const events = JSON.parse(
    readFileSync(
      new URL('./fixtures/edition-timeline-2026-11-12.json', import.meta.url),
      'utf8',
    ),
  );
  const result = evaluateEditionTimeline(events);
  assert.equal(result.elapsedMs, 232297);
  assert.equal(result.topics.length, 5);
  assert.equal(
    result.occupancy.reduce((sum, row) => sum + row.ms, 0),
    result.elapsedMs,
  );
  assert.equal(
    result.occupancy.reduce((sum, row) => sum + row.ms * row.calls, 0),
    852391,
  );
  const us = result.topics.find((topic) => topic.topic.endsWith('15'))!;
  const world = result.topics.find((topic) => topic.topic.endsWith('14'))!;
  assert.equal(us.triageMs, 173524);
  assert.equal(world.triageMs, 120267);
  assert.equal(us.readyMs, 232267);
  assert.equal(result.lastTopicTail.elapsedMs, 4512);
  assert.deepEqual(
    result.lastTopicTail.calls.map((call) => call.purpose),
    ['social-editor-v2'],
  );
});

void test('saved timeline conserves HTTP work and identifies the serialized social tail', () => {
  const result = evaluateEditionTimeline(
    JSON.parse(
      readFileSync(
        new URL('./fixtures/edition-timeline-2026-11-05.json', import.meta.url),
        'utf8',
      ),
    ),
  );
  assert.equal(result.elapsedMs, 152273);
  assert.equal(
    result.occupancy.reduce((sum, row) => sum + row.ms, 0),
    result.elapsedMs,
  );
  assert.equal(
    result.occupancy.reduce((sum, row) => sum + row.ms * row.calls, 0),
    550600,
  );
  assert.equal(
    result.topics.find((topic) => topic.topic.endsWith('11'))!.postsMs,
    55895,
  );
  assert.equal(result.lastTopicTail.elapsedMs, 8804);
  assert.deepEqual(result.lastTopicTail.occupancy, [
    { calls: 0, ms: 141 },
    { calls: 1, ms: 8663 },
  ]);
  assert.deepEqual(
    result.lastTopicTail.calls.map((call) => call.purpose),
    ['social-triage-v1', 'bluesky-social-editor-v1'],
  );
});

const stages = ['triage', 'editing', 'posts', 'ready'].map((stage, i) => ({
  event: 'edition.step',
  topic: 'one',
  stage,
  time: i * 10,
}));
const fixture = [
  { event: 'edition.start', time: 0 },
  ...stages,
  {
    event: 'external.call',
    time: 20,
    durationMs: 10,
    purpose: 'first',
    outcome: 'error',
  },
  {
    event: 'external.call',
    time: 30,
    durationMs: 10,
    purpose: 'second',
    outcome: 'success',
  },
  { event: 'edition.finish', time: 40 },
];
void test('touching HTTP intervals do not overlap and failed work retains its time', () => {
  const result = evaluateEditionTimeline(fixture);
  assert.deepEqual(result.occupancy, [
    { calls: 0, ms: 20 },
    { calls: 1, ms: 20 },
  ]);
  assert.equal(result.lastTopicTail.elapsedMs, 40);
});
void test('incomplete or reversed stages cannot silently produce timing evidence', () => {
  assert.throws(
    () =>
      evaluateEditionTimeline(
        fixture.filter((e) => !('stage' in e) || e.stage !== 'posts'),
      ),
    /Incomplete topic/,
  );
  assert.throws(
    () =>
      evaluateEditionTimeline(
        fixture.map((e) =>
          'stage' in e && e.stage === 'posts' ? { ...e, time: 5 } : e,
        ),
      ),
    /out of order/,
  );
  assert.throws(
    () =>
      evaluateEditionTimeline([
        ...fixture,
        { event: 'edition.start', time: 0 },
      ]),
    /exactly one/,
  );
});
