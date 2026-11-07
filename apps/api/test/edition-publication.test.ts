import assert from 'node:assert/strict';
import { test } from 'node:test';

import { historicalEditionPublication as classify } from '../src/modules/digests/domain/edition-publication';

void test('publication backfill uses UTC creation time and the owner cutoff', () => {
  assert.deepEqual(
    classify('scheduled', new Date('2026-11-02T23:59:59.999Z')),
    { kind: 'manual', publishedAt: null },
  );
  assert.deepEqual(classify('scheduled', new Date('2026-11-03T00:00:00Z')), {
    kind: 'scheduled',
    publishedAt: '2026-11-03T00:00:00.000Z',
  });
  assert.equal(
    classify('scheduled', new Date('2026-11-02T20:00:00-04:00')).kind,
    'scheduled',
  );
  assert.equal(
    classify('scheduled', new Date('2027-01-01Z')).kind,
    'scheduled',
  );
});

void test('integration keys never publish, and unkeyed editions remain manual', () => {
  for (const time of ['2026-11-01Z', '2026-11-07Z', '2027-01-01Z']) {
    assert.deepEqual(classify('integration:fixture', new Date(time)), {
      kind: 'test',
      publishedAt: null,
    });
    assert.deepEqual(classify(null, new Date(time)), {
      kind: 'manual',
      publishedAt: null,
    });
  }
  assert.throws(
    () => classify('scheduled', new Date('invalid')),
    /Invalid edition creation time/,
  );
});
