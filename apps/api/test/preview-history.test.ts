import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { type DigestPreview } from '@digest/contracts';

import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';
import { type PreviewRepository } from '../src/modules/digests/domain/preview.repository';

void test('edition reads preserve JSON, profile isolation and stable 20-entry history pages', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const adapter = new PostgresPreviewRepository();
  const repository: PreviewRepository = adapter;
  const profile = '00000000-0000-4000-8000-000000000001';
  try {
    const latest = await repository.latest();
    const offset = Number(
      (
        await adapter.db.query(
          'SELECT count(*) FROM digest_previews WHERE profile_id=$1',
          [profile],
        )
      ).rows[0].count,
    );
    const otherProfile = randomUUID();
    await adapter.db.query('INSERT INTO profiles(id,name) VALUES($1,$2)', [
      otherProfile,
      'Isolated history fixture',
    ]);
    const snapshots: DigestPreview[] = [];
    for (let index = 0; index < 22; index++) {
      const snapshot: DigestPreview = {
        id: randomUUID(),
        createdAt: '1900-01-02T00:00:00.000Z',
        windowStart: '1900-01-01T00:00:00.000Z',
        windowEnd: '1900-01-02T00:00:00.000Z',
        method: index % 2 ? 'signals-v6' : 'editorial-v1',
        topics: [],
      };
      snapshots.push(snapshot);
      await adapter.db.query(
        'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot) VALUES($1,$2,$3,$4,$5,$6)',
        [
          snapshot.id,
          profile,
          '1900-01-01T16:00:00-08:00',
          snapshot.windowStart,
          snapshot.windowEnd,
          snapshot,
        ],
      );
    }
    snapshots.sort((a, b) => b.id.localeCompare(a.id));
    const foreign = { ...snapshots[0], id: randomUUID() };
    await adapter.db.query(
      'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot) VALUES($1,$2,$3,$4,$5,$6)',
      [
        foreign.id,
        otherProfile,
        '2100-01-01T00:00:00Z',
        foreign.windowStart,
        foreign.windowEnd,
        foreign,
      ],
    );
    assert.equal(await repository.find(foreign.id), null);
    assert.equal(await repository.find(randomUUID()), null);
    assert.deepEqual(await repository.latest(), latest ?? snapshots[0]);
    const expected = snapshots.map(({ topics: _topics, ...entry }) => entry);
    assert.deepEqual(await repository.history(offset), {
      entries: expected.slice(0, 20),
      hasMore: true,
    });
    assert.deepEqual(await repository.history(offset + 20), {
      entries: expected.slice(20),
      hasMore: false,
    });
    assert.deepEqual(await repository.history(offset + 22), {
      entries: [],
      hasMore: false,
    });
    const retrieved = await repository.find(snapshots[0].id);
    assert.deepEqual(retrieved, snapshots[0]);
    retrieved.topics.push({
      id: randomUUID(),
      name: 'Local mutation',
      candidateCount: 0,
      stories: [],
      posts: [],
    });
    assert.deepEqual(await repository.find(snapshots[0].id), snapshots[0]);
  } finally {
    await adapter.onModuleDestroy();
  }
});
