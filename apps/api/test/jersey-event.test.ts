import assert from 'node:assert/strict';
import test from 'node:test';

import { sameJerseyCeremony } from '../src/modules/digests/domain/jersey-event';
import type { Candidate } from '../src/modules/digests/domain/rank';
import { sameEventWithStudioClosure } from '../src/modules/digests/domain/studio-event';

const item = (title: string, excerpt: string): Candidate => ({
  id: title,
  title,
  excerpt,
  publishedAt: '2026-11-02T12:00:00Z',
  url: 'https://example.org',
  sources: ['Synthetic'],
  points: 0,
});
const lead = item(
  'Thunder to retire Russell Westbrook’s jersey on Feb. 7',
  'The Thunder will retire Russell Westbrook’s No. 0 jersey on February 7, 2027.',
);
const other = item(
  'Russell Westbrook number retirement: OKC Thunder to hang No. 0 from the rafters in February',
  'His number goes in the rafters on Feb. 7.',
);

void test('jersey ceremonies require matching player, franchise, number and upcoming full date', () => {
  assert.equal(sameJerseyCeremony(lead, other), true);
  assert.equal(sameJerseyCeremony(other, lead), true);
  for (const candidate of [
    {
      ...other,
      title: other.title.replace('Russell Westbrook', 'Kevin Durant'),
    },
    { ...other, title: other.title.replace('Thunder', 'Lakers') },
    { ...other, title: other.title.replace('No. 0', 'No. 1') },
    { ...other, excerpt: 'The ceremony is in February.' },
    { ...other, excerpt: 'His number goes in the rafters on Feb. 8.' },
    { ...other, excerpt: 'His number goes in the rafters on Feb. 7, 2028.' },
    { ...other, excerpt: 'His number goes in the rafters on Feb. 30.' },
    { ...other, excerpt: 'His number went in the rafters on Feb. 7, 2026.' },
    { ...other, excerpt: 'His number went in the rafters on Feb. 7, 1999.' },
    {
      ...other,
      excerpt: 'His number goes in the rafters on Feb. 7 or Feb. 8.',
    },
    { ...other, excerpt: 'His No. 1 goes in the rafters on Feb. 7.' },
    { ...other, excerpt: 'The ceremony could be on Feb. 7.' },
    { ...other, excerpt: 'The ceremony was postponed from Feb. 7.' },
    {
      ...other,
      title: 'Russell Westbrook retires from basketball',
      excerpt: 'No. 0 played for Thunder. Feb. 7.',
    },
    { ...other, publishedAt: 'invalid' },
    { ...other, publishedAt: '2026-11-05T12:00:00Z' },
  ]) {
    assert.equal(
      sameJerseyCeremony(lead, candidate),
      false,
      JSON.stringify(candidate),
    );
    assert.equal(
      sameJerseyCeremony(candidate, lead),
      false,
      JSON.stringify(candidate),
    );
  }
});

void test('upcoming ceremony dates handle year rollover, May and leap dates explicitly', () => {
  const pair = (
    date: string,
    explicit: string,
    publishedAt = lead.publishedAt,
  ) =>
    [
      {
        ...lead,
        title: 'Thunder to retire Russell Westbrook’s jersey',
        excerpt: `No. 0 ceremony on ${explicit}.`,
        publishedAt,
      },
      { ...other, excerpt: `Ceremony on ${date}.`, publishedAt },
    ] as const;
  assert.equal(sameJerseyCeremony(...pair('May 7', 'May 7, 2027')), true);
  assert.equal(sameJerseyCeremony(...pair('Jan. 7', 'January 7, 2027')), true);
  assert.equal(
    sameJerseyCeremony(
      ...pair('Feb. 29', 'February 29, 2028', '2027-11-02T12:00:00Z'),
    ),
    true,
  );
  assert.equal(
    sameJerseyCeremony(...pair('Feb. 29', 'February 29, 2027')),
    false,
  );
});

void test('ceremony identity guards identical headlines before lexical fallback', () => {
  const base = {
    ...lead,
    title: 'Thunder to retire Russell Westbrook’s jersey',
  };
  for (const excerpt of [
    'No. 0 ceremony on February 8, 2027.',
    'No. 1 ceremony on February 7, 2027.',
    'The ceremony might be on February 7, 2027.',
  ]) {
    const conflict = { ...base, excerpt };
    assert.equal(sameEventWithStudioClosure(base, conflict), false);
    assert.equal(sameEventWithStudioClosure(conflict, base), false);
  }
});
