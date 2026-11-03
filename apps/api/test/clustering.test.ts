import assert from 'node:assert/strict';
import { test } from 'node:test';

import { clusterCandidates } from '../src/modules/digests/domain/cluster';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';
const item = (id: string): Candidate => ({
  id,
  title: 'Identical recorded headline',
  sources: [id],
  url: `https://example.org/${id}`,
  excerpt: '',
  publishedAt: '2026-11-01T12:00:00Z',
  points: 0,
});
void test('production default keeps even identical headlines separate', () => {
  const candidates = [item('a'), item('b')];
  assert.deepEqual(
    clusterCandidates(candidates),
    candidates.map((c) => [c]),
  );
  const stories = rank(
    candidates,
    new Date('2026-11-01'),
    new Date('2026-11-02'),
    2,
  );
  assert.deepEqual(
    stories.map((s) => s.coverage.map((c) => c.id)),
    [['a'], ['b']],
  );
});
void test('generic matcher preserves coverage and strongest lead without a cluster score bonus', () => {
  const a = { ...item('a'), points: 10 },
    b = item('b'),
    c = item('c');
  const matches = (x: Candidate, y: Candidate) => x.id !== 'c' && y.id !== 'c';
  const stories = rank(
    [c, b, a],
    new Date('2026-11-01'),
    new Date('2026-11-02'),
    2,
    matches,
  );
  assert.equal(stories[0].id, 'a');
  assert.deepEqual(
    stories[0].coverage.map((c) => c.id),
    ['a', 'b'],
  );
  assert.deepEqual(stories[0].sources, ['a', 'b']);
  assert.equal(
    stories[0].score,
    rank([a], new Date('2026-11-01'), new Date('2026-11-02'), 1)[0].score,
  );
});
void test('generic complete-link plumbing does not chain incompatible members', () => {
  const candidates = [item('a'), item('b'), item('c')];
  const matches = (a: Candidate, b: Candidate) =>
    [a.id, b.id].sort().join('') !== 'ac';
  assert.deepEqual(
    clusterCandidates(candidates, matches).map((g) => g.map((c) => c.id)),
    [['a', 'b'], ['c']],
  );
});
