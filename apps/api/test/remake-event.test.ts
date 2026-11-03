import assert from 'node:assert/strict';
import test from 'node:test';

import type { Candidate } from '../src/modules/digests/domain/rank';
import {
  sameAbandonedFastTravel,
  sameWaterTempleAdjustment,
} from '../src/modules/digests/domain/remake-event';

const item = (title: string): Candidate => ({
  id: title,
  title,
  excerpt: '',
  url: 'https://example.org',
  publishedAt: '2026-11-02T12:00:00Z',
  sources: ['Fixture'],
  points: 0,
});
const lead = item(
  'Nintendo tried adding fast travel to The Legend of Zelda: Ocarina of Time remake, before devs realised "we were missing out on the moments of discovery"',
);
const other = item(
  'Zelda: Ocarina Of Time Remake Devs Tried Adding Even More Fast Travel Points, But That Sucked',
);

void test('abandoned remake fast travel matches explicit experiment and full game identity', () => {
  assert.equal(sameAbandonedFastTravel(lead, other), true);
  assert.equal(sameAbandonedFastTravel(other, lead), true);
  assert.equal(
    sameAbandonedFastTravel(lead, {
      ...other,
      publishedAt: '2026-11-04T00:00:00Z',
    }),
    true,
  );
});

void test('remake experiments stay separate from other games, features, uncertainty and old reports', () => {
  for (const candidate of [
    item(other.title.replace('Ocarina Of Time', 'Majoras Mask')),
    item(other.title.replace('Zelda:', 'Other Quest:')),
    item(other.title.replace('Fast Travel', 'Combat')),
    item(other.title.replace('Tried Adding Even More', 'Added')),
    item(other.title.replace('But That Sucked', 'And Players Loved It')),
    item(`${other.title}?`),
    item(`${other.title}, rumor`),
    item(`${other.title} in 2020`),
    item(`Previously ${other.title}`),
    item(
      'Zelda: Ocarina of Time remake had a Breath of the Wild QoL feature, but it was cut for ruining vibes',
    ),
    { ...other, publishedAt: 'invalid' },
    { ...other, publishedAt: '2026-11-04T00:00:01Z' },
  ]) {
    assert.equal(
      sameAbandonedFastTravel(lead, candidate),
      false,
      candidate.title,
    );
    assert.equal(
      sameAbandonedFastTravel(candidate, lead),
      false,
      candidate.title,
    );
  }
});

void test('Water Temple adjustment requires full game identity, quoted rationale and remake context', () => {
  const a = {
    ...item(
      'OG Zelda: Ocarina of Time dev responsible for the infamous water temple used the remake to atone',
    ),
    excerpt:
      '15 years after remaking the game for 3DS purely to "do something about the water temple" with some overdue homework',
  };
  const b = {
    ...item(
      'The Director Of The Original Zelda: Ocarina Of Time Calls Fixing The Infamous Water Temple ‘Overdue Homework’',
    ),
    excerpt: 'I had the team make some adjustments in this version',
  };
  assert.equal(sameWaterTempleAdjustment(a, b), true);
  assert.equal(sameWaterTempleAdjustment(b, a), true);
  for (const bad of [
    { ...b, title: b.title.replace('Ocarina Of Time', 'Majoras Mask') },
    { ...b, title: b.title.replace('Water Temple', 'Fire Temple') },
    { ...b, title: b.title + '?' },
    { ...b, title: 'Previously ' + b.title },
    { ...b, excerpt: 'The original dungeon was difficult' },
    { ...b, publishedAt: 'invalid' },
    { ...b, publishedAt: '2026-11-04T00:00:01Z' },
  ]) {
    assert.equal(sameWaterTempleAdjustment(a, bad), false, bad.title);
    assert.equal(sameWaterTempleAdjustment(bad, a), false, bad.title);
  }
  assert.equal(sameWaterTempleAdjustment({ ...a, excerpt: '' }, b), false);
});
