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
        topics:
          index === 0
            ? [
                {
                  id: randomUUID(),
                  name: 'History topic',
                  candidateCount: 0,
                  stories: [],
                  editorial: {
                    mode: 'ai',
                    model: 'recorded-fixture',
                    reason: 'fixture',
                    brief: [],
                    triage: [],
                    unscoredIds: [],
                  },
                },
              ]
            : [],
      };
      snapshots.push(snapshot);
      await adapter.db.query(
        'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot,scheduled_key) VALUES($1,$2,$3,$4,$5,$6,$7)',
        [
          snapshot.id,
          profile,
          '1900-01-01T16:00:00-08:00',
          snapshot.windowStart,
          snapshot.windowEnd,
          snapshot,
          `on-demand:history-${snapshot.id}`,
        ],
      );
    }
    snapshots.sort((a, b) => b.id.localeCompare(a.id));
    const foreign = { ...snapshots[0], id: randomUUID() };
    await adapter.db.query(
      'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot,scheduled_key) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [
        foreign.id,
        otherProfile,
        '2100-01-01T00:00:00Z',
        foreign.windowStart,
        foreign.windowEnd,
        foreign,
        `on-demand:foreign-${foreign.id}`,
      ],
    );
    const ownKey = `on-demand:history-${snapshots[0].id}`;
    const foreignKey = `on-demand:foreign-${foreign.id}`;
    assert.deepEqual(await repository.findByGenerationKey(ownKey), {
      id: snapshots[0].id,
    });
    assert.equal(await repository.findByGenerationKey(foreignKey), null);
    assert.equal(
      await repository.findByGenerationKey(`${ownKey}-missing`),
      null,
    );
    assert.equal(await repository.find(foreign.id), null);
    assert.equal(await repository.find(randomUUID()), null);
    assert.deepEqual(await repository.latest(), latest ?? snapshots[0]);
    const expected = snapshots.map(({ topics, ...entry }) => ({
      ...entry,
      topicModes: topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        stories: topic.editorial?.mode ?? null,
        posts: topic.postEditorial?.mode ?? null,
      })),
    }));
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

void test('latest and history order by stored timestamps before IDs and distinguish exactly full pages', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const adapter = new PostgresPreviewRepository();
  const repository: PreviewRepository = adapter;
  const profile = '00000000-0000-4000-8000-000000000001';
  try {
    const offset = Number(
      (
        await adapter.db.query(
          'SELECT count(*) FROM digest_previews WHERE profile_id=$1',
          [profile],
        )
      ).rows[0].count,
    );
    const snapshots: DigestPreview[] = [];
    // Older than other fixtures, with IDs deliberately opposed to chronology.
    for (let index = 0; index < 20; index++) {
      const snapshot: DigestPreview = {
        id: `00000000-0000-4000-8000-${String(960000 + index).padStart(12, '0')}`,
        createdAt: new Date(
          Date.UTC(1800, 0, 20 - Math.floor(index / 2)),
        ).toISOString(),
        windowStart: '1799-12-31T23:00:00.123Z',
        windowEnd: '1800-01-01T23:00:00.456Z',
        method: 'signals-v6',
        topics: [],
      };
      snapshots.push(snapshot);
      await adapter.db.query(
        'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot) VALUES($1,$2,$3,$4,$5,$6)',
        [
          snapshot.id,
          profile,
          snapshot.createdAt,
          snapshot.windowStart,
          snapshot.windowEnd,
          snapshot,
        ],
      );
    }
    const expected = snapshots.sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
    );
    const entries = expected.map(({ topics: _topics, ...entry }) => ({
      ...entry,
      topicModes: [],
    }));
    assert.deepEqual(await repository.history(offset), {
      entries,
      hasMore: false,
    });
    assert.deepEqual(await repository.history(offset + 19), {
      entries: entries.slice(19),
      hasMore: false,
    });
    assert.deepEqual(await repository.history(offset + 20), {
      entries: [],
      hasMore: false,
    });
    await assert.rejects(repository.history(-1));
    assert.deepEqual(await repository.history(offset), {
      entries,
      hasMore: false,
    });

    // latest uses the persisted sort keys, even if snapshot metadata differs.
    for (const snapshot of expected.slice(0, 2)) {
      const future = { ...snapshot, id: randomUUID() };
      await adapter.db.query(
        'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot) VALUES($1,$2,$3,$4,$5,$6)',
        [
          future.id,
          profile,
          '2200-01-01T08:00:00+08:00',
          future.windowStart,
          future.windowEnd,
          future,
        ],
      );
      snapshots.push(future);
    }
    const newest = snapshots.slice(-2).sort((a, b) => b.id.localeCompare(a.id));
    assert.deepEqual(await repository.latest(), newest[0]);
    assert.deepEqual(await repository.find(newest[1].id), newest[1]);
    const latest = await repository.latest();
    assert.ok(latest);
    latest.topics.push({
      id: randomUUID(),
      name: 'Caller mutation',
      candidateCount: 0,
      stories: [],
      posts: [],
    });
    assert.deepEqual(await repository.latest(), newest[0]);
    assert.equal(
      (await repository.history(0)).entries[0].createdAt,
      '2200-01-01T00:00:00.000Z',
    );
  } finally {
    await adapter.onModuleDestroy();
  }
});
