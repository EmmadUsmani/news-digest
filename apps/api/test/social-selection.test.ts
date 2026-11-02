import assert from 'node:assert/strict';
import { test } from 'node:test';

import { digestPreviewSchema } from '@digest/contracts';

import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';

void test('editions freeze scoped screened posts, honor budgets and preserve scheduled retries after post refresh', async () => {
  const repository = new PostgresPreviewRepository();
  const social = new PostgresSocialRepository();
  Object.defineProperty(repository, 'editorial', { value: null });
  const topicId = '00000000-0000-4000-8000-000000000011';
  const start = new Date('2026-10-15T00:00:00Z');
  const end = new Date('2026-10-16T00:00:00Z');
  const ids = Array.from({ length: 6 }, (_, i) => `99910000000000000${i}`);
  try {
    await repository.db.query('UPDATE topics SET post_budget=1 WHERE id=$1', [
      topicId,
    ]);
    for (const [i, id] of ids.entries()) {
      await social.store({
        platform: 'x',
        externalId: id,
        url: `https://x.com/i/web/status/${id}`,
        author: 'Synthetic fixture',
        authorUrl: 'https://x.com/fixture',
        publishedAt:
          i === 4
            ? end.toISOString()
            : new Date(start.getTime() + i * 1000).toISOString(),
        metrics: {},
        embedHtml: `<p>${i === 3 ? 'AI crypto promo' : i === 2 ? 'Unrelated text' : 'AI demo launch'}</p>`,
      });
      if (i !== 5)
        await social.discovered('techmeme', [
          { externalId: id, url: `https://x.com/i/web/status/${id}` },
        ]);
    }
    const key = `social-test:${crypto.randomUUID()}`;
    const first = await repository.generate(start, end, key);
    digestPreviewSchema.parse(first);
    const topic = first.topics.find((t) => t.id === topicId)!;
    assert.deepEqual(
      topic.posts?.map((post) => post.externalId),
      [ids[1]],
    );
    assert.deepEqual(topic.posts?.[0].metrics, {});
    assert.equal(first.topics.find((t) => t.id !== topicId)?.posts?.length, 0);
    await social.db.query(
      'UPDATE social_posts SET embed_html=$2,author=$3 WHERE external_id=$1',
      [ids[1], '<p>AI changed text</p>', 'Changed author'],
    );
    await repository.db.query('UPDATE topics SET post_budget=0 WHERE id=$1', [
      topicId,
    ]);
    assert.deepEqual(await repository.generate(start, end, key), first);
    assert.deepEqual(await repository.find(first.id), first);
    const next = await repository.generate(start, end);
    assert.deepEqual(next.topics.find((t) => t.id === topicId)?.posts, []);
    await repository.db.query('UPDATE topics SET post_budget=5 WHERE id=$1', [
      topicId,
    ]);
    const regenerated = await repository.generate(start, end);
    const posts = regenerated.topics.find((t) => t.id === topicId)!.posts!;
    assert.equal(posts.length, 2); // repeated original text occupies one slot
    assert.equal(posts[0].author, 'Changed author');
    assert.notEqual(regenerated.id, first.id);
  } finally {
    await repository.db.query('UPDATE topics SET post_budget=5 WHERE id=$1', [
      topicId,
    ]);
    await social.db.query(
      'DELETE FROM social_discovery_citations WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await social.db.query(
      'DELETE FROM social_posts WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await social.db.end();
    await repository.onModuleDestroy();
  }
});
