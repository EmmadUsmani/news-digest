import assert from 'node:assert/strict';
import { test } from 'node:test';

import { eventAdmission } from '../src/modules/digests/domain/event-admission';

void test('event admission preserves every baseline event at all redundancy levels', () => {
  const ranked = Array.from({ length: 80 }, (_, i) => ({ id: String(i) }));
  const baseline = ranked.slice(0, 40);
  for (let count = 1; count <= 40; count++) {
    const groups = Array.from({ length: count }, () => ({
      ids: [] as string[],
    }));
    baseline.forEach(({ id }, i) => groups[i % count].ids.push(id));
    const before = structuredClone({ ranked, baseline, groups });
    const result = eventAdmission(ranked, baseline, groups, 40)!;
    assert.equal(result.length, 40);
    assert.equal(new Set(result.map(({ id }) => id)).size, 40);
    for (const group of groups)
      assert.ok(result.some(({ id }) => group.ids.includes(id)));
    assert.equal(
      result.filter(({ id }) => Number(id) >= 40).length,
      40 - count,
    );
    assert.deepEqual({ ranked, baseline, groups }, before);
    assert.deepEqual(eventAdmission(ranked, baseline, groups, 40), result);
  }
});

void test('event admission keeps ranking and backfills corroboration when tails run out', () => {
  const ranked = ['b', 'a', 'c', 'd'].map((id) => ({ id }));
  assert.deepEqual(
    eventAdmission(ranked, ranked.slice(0, 3), [{ ids: ['a', 'b', 'c'] }], 3),
    [ranked[0], ranked[1], ranked[3]],
  );
  assert.deepEqual(eventAdmission([], [], [], 0), []);
});

void test('event admission refuses incomplete, overlapping or foreign membership and invalid caps', () => {
  const ranked = ['a', 'b', 'c'].map((id) => ({ id }));
  const baseline = ranked.slice(0, 2);
  for (const groups of [
    [{ ids: ['a'] }],
    [{ ids: ['a', 'b'] }, { ids: ['b'] }],
    [{ ids: ['a', 'b', 'c'] }],
    [{ ids: ['a', 'b'] }, { ids: [] }],
  ])
    assert.equal(eventAdmission(ranked, baseline, groups, 2), null);
  const groups = [{ ids: ['a', 'b'] }];
  for (const limit of [-1, 1, 2.5, NaN, Infinity])
    assert.equal(eventAdmission(ranked, baseline, groups, limit), null);
  assert.equal(eventAdmission([ranked[0]], baseline, groups, 2), null);
  assert.equal(
    eventAdmission([...ranked, ranked[0]], baseline, groups, 2),
    null,
  );
  assert.equal(eventAdmission(ranked, [ranked[0], ranked[0]], groups, 2), null);
});
