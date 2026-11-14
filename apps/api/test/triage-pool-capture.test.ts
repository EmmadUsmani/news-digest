import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  poolAdmission,
  poolOptions,
  poolTextEvidence,
} from '../../../scripts/capture-triage-pool';
import type { Candidate } from '../src/modules/digests/domain/rank';

void test('pool capture accepts prospective edition ends but rejects invalid windows', () => {
  const now = Date.parse('2026-11-04T01:00Z');
  assert.equal(
    poolOptions(
      ['2026-11-03T15:00Z', '2026-11-04T15:00Z', '/tmp/pool'],
      now,
    ).end.toISOString(),
    '2026-11-04T15:00:00.000Z',
  );
  for (const args of [
    [],
    ['bad', '2026-11-04', '/tmp/a'],
    ['2026-11-05', '2026-11-06', '/tmp/a'],
    ['2026-11-01', '2026-11-04', '/tmp/a'],
    ['2026-11-04', '2026-11-03', '/tmp/a'],
  ])
    assert.throws(() => poolOptions(args, now), /started window/);
});

void test('pool evidence preserves semantic recovery and excludes only hard rules or disabled stories', () => {
  const candidate = {
    id: 'one',
    title: 'New research result',
    excerpt: '',
    url: 'https://example.com/a',
    publishedAt: '2026-11-04T00:00Z',
    sources: ['Example'],
    points: 0,
  } satisfies Candidate;
  const policy = { includeAny: ['basketball'], excludeAny: ['promotion'] };
  const rows = poolAdmission(
    [
      candidate,
      { ...candidate, id: 'two', title: 'Promotion today' },
      { ...candidate, id: 'three', title: 'How to watch tonight' },
    ],
    policy,
    5,
  );
  assert.deepEqual(
    rows.map((r) => r.triageEligible),
    [true, false, false],
  );
  assert.equal(rows[0].id, candidate.id);
  assert.equal(poolAdmission([candidate], policy, 0)[0].triageEligible, false);
});

void test('pool text evidence separates recorded URL-only HN excerpts without changing admission', () => {
  // Stored Tech excerpts captured 2026-11-14, iteration 2259; shortened URLs
  // are the saved text, not reconstructed destinations or source reporting.
  const excerpts = [
    'https://www.fly.faa.gov/adv/adv_otherdis?adv_date=11132026&a... https://www.fly.faa.gov/adv/adv_otherdis?adv_date=11142026&a... https://www.nytimes.com/live/2026/11/13/us/ground-stop-natio...',
    'https://www.nytimes.com/live/2026/11/13/us/ground-stop-natio...',
  ];
  for (const excerpt of excerpts) {
    assert.equal(poolTextEvidence(excerpt), 'urls-only');
    assert.equal(poolTextEvidence(` \n${excerpt}\t`), 'urls-only');
    const candidate = {
      id: 'recorded-text-control',
      title: 'FAA Issues National Ground Stop',
      excerpt,
      url: 'https://example.org/report',
      publishedAt: '2026-11-13T20:00Z',
      sources: ['Fixture source'],
      points: 0,
    } satisfies Candidate;
    const [row] = poolAdmission(
      [candidate],
      { includeAny: [], excludeAny: [] },
      5,
    );
    assert.equal(row.textEvidence, 'urls-only');
    assert.equal(row.triageEligible, true);
    for (const key of Object.keys(candidate) as (keyof Candidate)[])
      assert.deepEqual(row[key], candidate[key]);
  }
  for (const empty of ['', '  \n\t'])
    assert.equal(poolTextEvidence(empty), 'empty');
  for (const text of [
    'Flights resumed after the ground stop.',
    'Details: https://example.org/report',
    'https://example.org/report Controllers resumed departures.',
    'HUD OCIO Reorganization to Establish Data and AI Division ExecutiveGov',
    'http is a protocol',
  ])
    assert.equal(poolTextEvidence(text), 'other-text');
});
