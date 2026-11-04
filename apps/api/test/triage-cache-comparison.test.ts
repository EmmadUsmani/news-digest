import assert from 'node:assert/strict';
import { test } from 'node:test';

import { compareTriageCache } from '../../../scripts/compare-triage-cache';

function capture(hour: number) {
  return {
    capturedAt: `2026-11-04T0${hour}:00:00.000Z`,
    windowStart: '2026-11-03T15:00:00.000Z',
    windowEnd: '2026-11-04T15:00:00.000Z',
    pools: [
      {
        topic: {
          id: 'tech',
          name: 'Tech',
          description: 'Technology',
          include_guidance: '',
          exclude_guidance: '',
          relevance_policy: { includeAny: [], excludeAny: [] },
        },
        candidates: ['a', 'b', 'c'].map((id) => ({
          id,
          title: id,
          excerpt: null as string | null,
          sources: ['News'],
          triageEligible: true,
        })),
      },
    ],
  };
}

void test('offline cache comparison separates retained changes, losses and compatible entries', async () => {
  const before = capture(1);
  const after = capture(2);
  after.pools[0].candidates[0].title = 'updated title';
  after.pools[0].candidates[1].triageEligible = false;
  const topic = (await compareTriageCache(before, after, 'fixture-model'))
    .topics[0];
  assert.equal(topic.retainedEligible, 2);
  assert.equal(topic.compatibleFingerprints, 1);
  assert.equal(topic.changedRetainedFingerprints, 1);
  assert.equal(topic.potentiallyUnusablePriorFingerprints, 2);
});

void test('topic guidance invalidates retained fingerprints; unused title suffix does not', async () => {
  const before = capture(1);
  const after = capture(2);
  after.pools[0].topic.include_guidance = 'Prefer launches';
  assert.equal(
    (await compareTriageCache(before, after, 'fixture-model')).topics[0]
      .changedRetainedFingerprints,
    3,
  );
  after.pools[0].topic.include_guidance = '';
  before.pools[0].candidates[0].title = 'x'.repeat(500) + 'old';
  after.pools[0].candidates[0].title = 'x'.repeat(500) + 'new';
  assert.equal(
    (await compareTriageCache(before, after, 'fixture-model')).topics[0]
      .compatibleFingerprints,
    3,
  );
});

void test('cache comparison handles removed topics and refuses incomplete evidence', async () => {
  const before = capture(1);
  const after = capture(2);
  after.pools = [];
  assert.equal(
    (await compareTriageCache(before, after, 'fixture-model')).topics[0]
      .potentiallyUnusablePriorFingerprints,
    3,
  );
  await assert.rejects(
    compareTriageCache(before, before, 'fixture-model'),
    /chronological/,
  );
  await assert.rejects(compareTriageCache(before, after, ''), /explicit/);
  await assert.rejects(
    compareTriageCache(
      {
        ...before,
        pools: [{ topic: { id: 'tech', name: 'Tech' }, candidates: [] }],
      },
      after,
      'fixture-model',
    ),
  );
});

void test('excerpt, source and required-phrase changes invalidate the production cache identity', async () => {
  const before = capture(1);
  const after = capture(2);
  after.pools[0].candidates[0].excerpt = 'New reporting';
  after.pools[0].candidates[1].sources = ['Another outlet'];
  assert.equal(
    (await compareTriageCache(before, after, 'fixture-model')).topics[0]
      .changedRetainedFingerprints,
    2,
  );
  const policyChanged = {
    ...capture(2),
    pools: capture(2).pools.map((pool) => ({
      ...pool,
      topic: {
        ...pool.topic,
        relevance_policy: { includeAny: ['chips'], excludeAny: [] },
      },
    })),
  };
  assert.equal(
    (await compareTriageCache(before, policyChanged, 'fixture-model')).topics[0]
      .changedRetainedFingerprints,
    3,
  );
});

void test('invalidation causes reconcile using production keys rather than raw field changes', async () => {
  const before = capture(1);
  const after = capture(2);
  after.pools[0].topic.description = 'Updated topic';
  after.pools[0].candidates[0].title = 'Updated title';
  before.pools[0].candidates[1].excerpt = 'x'.repeat(10000) + 'before';
  after.pools[0].candidates[1].excerpt = 'x'.repeat(10000) + 'after';
  after.pools[0].candidates[2].triageEligible = false;
  const topic = (await compareTriageCache(before, after, 'fixture-model'))
    .topics[0];
  assert.deepEqual(topic.changedFingerprintCauses, {
    articleOnly: 0,
    topicOnly: 1,
    articleAndTopic: 1,
  });
  assert.equal(
    Object.values(topic.changedFingerprintCauses).reduce((a, b) => a + b, 0),
    topic.changedRetainedFingerprints,
  );
  assert.equal(topic.potentiallyUnusablePriorFingerprints, 3);
  after.pools[0].topic.description = before.pools[0].topic.description;
  const article = (await compareTriageCache(before, after, 'fixture-model'))
    .topics[0];
  assert.deepEqual(article.changedFingerprintCauses, {
    articleOnly: 1,
    topicOnly: 0,
    articleAndTopic: 0,
  });
  assert.equal(article.compatibleFingerprints, 1);
});
