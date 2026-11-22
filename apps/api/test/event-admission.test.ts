import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  editorEventAdmission,
  eventAdmission,
  restoreEventCoverage,
} from '../src/modules/digests/domain/event-admission';

void test('editor cutoff reserves all baseline events even when new ranking displaces them', () => {
  const ranked = Array.from({ length: 20 }, (_, i) => ({
    topicId: 'world',
    ids: [String(i)],
  }));
  for (let count = 0; count <= 10; count++) {
    const baseline = ranked.slice(20 - count);
    const before = structuredClone({ ranked, baseline });
    const result = editorEventAdmission(ranked, baseline, 10)!;
    assert.equal(result.length, 10);
    assert.deepEqual(result, [...ranked.slice(0, 10 - count), ...baseline]);
    assert.deepEqual({ ranked, baseline }, before);
  }
  assert.deepEqual(editorEventAdmission([], [], 0), []);
  assert.deepEqual(
    editorEventAdmission(ranked.slice(0, 2), [], 10),
    ranked.slice(0, 2),
  );
});

void test('editor cutoff refuses lost evidence, changed boundaries, scope and impossible caps', () => {
  const baseline = [{ topicId: 'world', ids: ['a', 'b'] }];
  for (const ranked of [
    [{ topicId: 'world', ids: ['a'] }],
    [{ topicId: 'world', ids: ['c'] }],
    [
      { topicId: 'world', ids: ['a'] },
      { topicId: 'world', ids: ['b'] },
    ],
    [{ topicId: 'us', ids: ['a', 'b'] }],
    [...baseline, { topicId: 'us', ids: ['c'] }],
    [...baseline, { topicId: 'world', ids: ['a'] }],
  ])
    assert.equal(editorEventAdmission(ranked, baseline, 10), null);
  for (const limit of [-1, 0, 1.5, NaN, Infinity])
    assert.equal(editorEventAdmission(baseline, baseline, limit), null);
  assert.equal(
    editorEventAdmission(
      [{ topicId: 'world', ids: ['a', 'b', 'c'] }],
      [...baseline, { topicId: 'world', ids: ['c'] }],
      10,
    ),
    null,
  );
});

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

void test('coverage restoration retains full baseline evidence and new reports without mutation', () => {
  const baseline = [
    { topicId: 'world', ids: ['a', 'b'], label: 'original' },
    { topicId: 'us', ids: ['c', 'd'], label: 'second' },
  ];
  const admitted = ['a', 'c', 'e', 'f'];
  const regrouped = [
    { topicId: 'us', ids: ['c', 'e'], label: 'expanded' },
    { topicId: 'world', ids: ['a'], label: 'retained' },
    { topicId: 'world', ids: ['f'], label: 'new' },
  ];
  const before = structuredClone({ baseline, admitted, regrouped });
  const result = restoreEventCoverage(baseline, admitted, regrouped)!;
  assert.deepEqual(
    result.map((group) => group.ids),
    [['c', 'e', 'd'], ['a', 'b'], ['f']],
  );
  assert.equal(result[0].label, 'expanded');
  assert.deepEqual({ baseline, admitted, regrouped }, before);
  result[0].ids.push('mutation');
  assert.deepEqual({ baseline, admitted, regrouped }, before);
  assert.deepEqual(restoreEventCoverage([], [], []), []);
});

void test('coverage restoration refuses merged, split, lost or reassigned baseline events', () => {
  const baseline = [
    { topicId: 'world', ids: ['a', 'b'] },
    { topicId: 'world', ids: ['c'] },
  ];
  for (const groups of [
    [{ topicId: 'world', ids: ['a', 'b', 'c'] }],
    [
      { topicId: 'world', ids: ['a'] },
      { topicId: 'world', ids: ['b', 'c'] },
    ],
    [{ topicId: 'world', ids: ['a', 'b'] }],
    [
      { topicId: 'us', ids: ['a', 'b'] },
      { topicId: 'world', ids: ['c'] },
    ],
    [
      { topicId: 'world', ids: ['a', 'b'] },
      { topicId: 'world', ids: ['c', 'foreign'] },
    ],
    [
      { topicId: 'world', ids: ['a', 'b'] },
      { topicId: 'world', ids: ['c', 'a'] },
    ],
  ])
    assert.equal(restoreEventCoverage(baseline, ['a', 'b', 'c'], groups), null);
  assert.equal(
    restoreEventCoverage(baseline, ['a'], [{ topicId: 'world', ids: ['a'] }]),
    null,
  );
  assert.equal(restoreEventCoverage(baseline, ['a', 'a'], []), null);
  for (const invalid of [
    [{ topicId: 'world', ids: [] }],
    [{ topicId: '', ids: ['a'] }],
    [{ topicId: 'world', ids: ['a', 'a'] }],
  ])
    assert.equal(
      restoreEventCoverage(invalid, ['a'], [{ topicId: 'world', ids: ['a'] }]),
      null,
    );
});
