import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';

test('concurrent scheduled retries return one immutable snapshot; manual regeneration stays versioned', async () => {
 const repository = new PostgresPreviewRepository();
 const end = new Date(), start = new Date(end.getTime() - 86400000);
 const key = `integration:${crypto.randomUUID()}`;
 try {
 const [first, retry] = await Promise.all([repository.generate(start,end,key), repository.generate(start,end,key)]);
 assert.deepEqual(first,retry);
 for (const story of first.topics.flatMap(topic => topic.stories)) {
 const stored = (await repository.db.query('SELECT image_url FROM content_items WHERE id=$1',[story.id])).rows[0].image_url;
 assert.equal(story.imageUrl, stored?.startsWith('https:') ? stored : null);
 }
 const laterRetry = await repository.generate(new Date(start.getTime()-3600000),end,key);
 assert.deepEqual(laterRetry,first);
 const manual = await repository.generate(start,end);
 assert.notEqual(manual.id,first.id);
 assert.deepEqual(await repository.find(first.id),first);
 assert.equal((await repository.db.query('SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',[key])).rows[0].count,1);
 } finally { await repository.onModuleDestroy(); }
});
