import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createLogger } from '../src/libs/observability/logging';
import { announceDigest } from '../src/modules/digests/adapters/digest-notifications';
import type { DigestPublished } from '../src/modules/digests/domain/digest-published';

void test('notification failure is contained after publication and logs no exception details', async () => {
  const lines: Record<string, unknown>[] = [];
  const log = createLogger(
    'test',
    {
      write(line) {
        lines.push(JSON.parse(line));
      },
    },
    [],
  );
  const event: DigestPublished = {
    type: 'DigestPublished',
    editionId: 'edition',
    profileId: 'profile',
    publishedAt: '2026-11-05T15:00:00Z',
    windowStart: '2026-11-04T15:00:00Z',
    windowEnd: '2026-11-05T15:00:00Z',
  };
  await announceDigest(
    {
      async published(received) {
        assert.deepEqual(received, event);
        throw new Error('private delivery credentials');
      },
    },
    event,
    log,
  );
  assert.equal(lines.length, 1);
  assert.equal(lines[0].event, 'digest.notification.failure');
  assert.equal(lines[0].editionId, 'edition');
  assert.ok(!JSON.stringify(lines).includes('private'));
});
