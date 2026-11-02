import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';

void test('concurrent scheduled retries return one immutable snapshot; manual regeneration stays versioned', async () => {
  const repository = new PostgresPreviewRepository();
  // This isolated characterization must never make paid external calls,
  // including when the developer has loaded the configured service environment.
  Object.defineProperty(repository, 'editorial', { value: null });
  const end = new Date(),
    start = new Date(end.getTime() - 86400000);
  const key = `integration:${crypto.randomUUID()}`;
  try {
    // Synthetic content exists only in the disposable test database.
    const itemId = crypto.randomUUID();
    await repository.db.query(
      `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at,image_url)
       VALUES($1,$2,'New AI developer tool released','Synthetic test excerpt',$3,'https://example.org/image.jpg')`,
      [itemId, `https://example.org/${itemId}`, new Date(end.getTime() - 1000)],
    );
    await repository.db.query(
      "INSERT INTO content_observations(item_id,source_id) VALUES($1,'hn')",
      [itemId],
    );
    const [first, retry] = await Promise.all([
      repository.generate(start, end, key),
      repository.generate(start, end, key),
    ]);
    assert.deepEqual(first, retry);
    assert.ok(
      first.topics.some((topic) =>
        topic.stories.some((story) => story.id === itemId),
      ),
    );
    for (const story of first.topics.flatMap((topic) => topic.stories)) {
      const stored = (
        await repository.db.query(
          'SELECT image_url FROM content_items WHERE id=$1',
          [story.id],
        )
      ).rows[0].image_url;
      assert.equal(
        story.imageUrl,
        stored?.startsWith('https:') ? stored : null,
      );
    }
    const laterRetry = await repository.generate(
      new Date(start.getTime() - 3600000),
      end,
      key,
    );
    assert.deepEqual(laterRetry, first);
    const manual = await repository.generate(start, end);
    assert.notEqual(manual.id, first.id);
    assert.deepEqual(await repository.find(first.id), first);
    assert.equal(
      (
        await repository.db.query(
          'SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',
          [key],
        )
      ).rows[0].count,
      1,
    );
  } finally {
    await repository.onModuleDestroy();
  }
});

void test(
  'failed scheduled publication rolls back and releases its lock for an independent retry',
  { timeout: 15000 },
  async () => {
    assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
    const failed = new PostgresPreviewRepository();
    const retry = new PostgresPreviewRepository();
    for (const repository of [failed, retry]) {
      Object.defineProperty(repository, 'editorial', { value: null });
    }
    const end = new Date('2026-11-02T00:00:00Z');
    const start = new Date('2026-11-01T00:00:00Z');
    const key = `integration:failed-publication:${crypto.randomUUID()}`;
    const failure = new Error('Synthetic publication progress failure');
    const before = await retry.history(0);
    let reachedPublication = false;
    try {
      await assert.rejects(
        failed.generate(start, end, key, async (progress) => {
          if (progress.stage === 'publishing') {
            reachedPublication = true;
            throw failure;
          }
        }),
        (error) => error === failure,
      );
      assert.equal(reachedPublication, true);
      assert.deepEqual(await retry.history(0), before);
      assert.equal(
        (
          await retry.db.query(
            'SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',
            [key],
          )
        ).rows[0].count,
        0,
      );

      // A separate pool must acquire the released session lock. Concurrent retries
      // then converge on the same immutable publication rather than duplicate it.
      const [published, duplicate] = await Promise.all([
        retry.generate(start, end, key),
        failed.generate(start, end, key),
      ]);
      assert.deepEqual(duplicate, published);
      assert.deepEqual(await retry.find(published.id), published);
      assert.equal(
        (
          await retry.db.query(
            'SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',
            [key],
          )
        ).rows[0].count,
        1,
      );
    } finally {
      await Promise.all([failed.onModuleDestroy(), retry.onModuleDestroy()]);
    }
  },
);
