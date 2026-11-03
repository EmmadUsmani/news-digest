import assert from 'node:assert/strict';
import test from 'node:test';

import type { Candidate } from '../src/modules/digests/domain/rank';
import { sameAbandonedFastTravel } from '../src/modules/digests/domain/remake-event';

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
