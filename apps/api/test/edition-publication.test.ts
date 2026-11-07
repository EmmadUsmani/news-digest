import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  historicalEditionPublication as classify,
  newEditionPublication,
} from '../src/modules/digests/domain/edition-publication';

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

void test('future scheduled saves publish at save time without the backfill cutoff', () => {
  for (const timestamp of [
    '2026-11-02T23:59:59.999Z',
    '2026-11-08T15:03:00Z',
    '2027-01-01T00:00:00+05:00',
  ]) {
    const savedAt = new Date(timestamp);
    assert.deepEqual(newEditionPublication('scheduled', 'daily:run', savedAt), {
      kind: 'scheduled',
      publishedAt: savedAt.toISOString(),
    });
  }
});

void test('explicit tests and legacy integration keys never publish on save', () => {
  const savedAt = new Date('2026-11-08T15:00:00Z');
  for (const key of [null, 'daily:run', 'integration:fixture']) {
    assert.deepEqual(newEditionPublication('test', key, savedAt), {
      kind: 'test',
      publishedAt: null,
    });
  }
  for (const intent of ['scheduled', 'manual', 'test'] as const) {
    assert.deepEqual(
      newEditionPublication(intent, 'integration:fixture', savedAt),
      {
        kind: 'test',
        publishedAt: null,
      },
    );
  }
  assert.deepEqual(newEditionPublication('manual', null, savedAt), {
    kind: 'manual',
    publishedAt: null,
  });
});

void test('ambiguous future publication requests fail before persistence', () => {
  const savedAt = new Date('2026-11-08T15:00:00Z');
  for (const key of [null, '', '  '])
    assert.throws(
      () => newEditionPublication('scheduled', key, savedAt),
      /require a scheduled key/,
    );
  assert.throws(
    () => newEditionPublication('manual', 'daily:run', savedAt),
    /cannot have a scheduled key/,
  );
  for (const intent of ['scheduled', 'manual', 'test'] as const)
    assert.throws(
      () => newEditionPublication(intent, null, new Date('invalid')),
      /Invalid edition save time/,
    );
});
