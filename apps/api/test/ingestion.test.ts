import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';
import { HackerNewsAdapter } from '../src/modules/ingestion/adapters/hn.adapter';
import { canonicalUrl } from '../src/modules/ingestion/domain/normalize';
import { PostgresContentRepository } from '../src/modules/ingestion/database/content.repository';
import { ingest } from '../src/modules/ingestion/ingest';
const fixture = (name: string) => readFile(`apps/api/test/fixtures/${name}`, 'utf8');
test('recorded RSS and Atom normalize real headlines, dates and safe links', async () => {
 for (const name of ['rss.xml', 'atom.xml', 'yahoo-nba.xml', 'eurogamer.xml']) {
 const items = parseFeed(await fixture(name));
 assert.equal(items.length, 2); assert.ok(items.every(i => i.title && i.url.startsWith('https://') && Date.parse(i.publishedAt)));
 }
 assert.throws(() => parseFeed('<html>blocked</html>'), /Unsupported/);
 assert.throws(() => parseFeed('<!DOCTYPE rss><rss/>'), /Invalid/);
 const encoded = parseFeed('<rss><channel><item><title>A &amp;amp; B &#039;ok&#039;</title><link>https://example.org/?a=1&amp;b=2</link><pubDate>2026-11-01T00:00:00Z</pubDate></item></channel></rss>')[0];
 assert.equal(encoded.title, "A & B 'ok'");
 assert.equal(encoded.url, 'https://example.org/?a=1&b=2');
 assert.equal(parseFeed('<rss><channel><item><title>No date</title><link>https://example.org</link></item></channel></rss>').length, 0);
 assert.equal(canonicalUrl('https://example.org/a?utm_source=x&b=2#top'), 'https://example.org/a?b=2');
 assert.equal(canonicalUrl('javascript:alert(1)'), null);
});
test('Hacker News fixture preserves engagement and excludes deleted items', async () => {
 const records = JSON.parse(await fixture('hn.json'));
 records[0].text = 'It&#x27;s &amp; more <p>text</p>';
 const adapter = new HackerNewsAdapter({ get: async url => url.endsWith('topstories.json') ? JSON.stringify([records[0].id,records[1].id,42]) : url.endsWith('/42.json') ? '{"deleted":true}' : JSON.stringify(records.find((r: { id: number }) => url.endsWith(`/${r.id}.json`))) });
 const items = await adapter.collect({ id: 'test', topicId: '', name: '', kind: 'hn', url: 'https://hacker-news.firebaseio.com/v0/topstories.json' });
 assert.equal(items.length, 2); assert.equal(items[0].engagement.points, records[0].score);
 assert.equal(items[0].excerpt, "It's & more text");
});
test('Postgres ingestion is idempotent and records failure without losing last success', async () => {
 const repository = new PostgresContentRepository();
 const id = `test-${Date.now()}`;
 try {
 await repository.db.query(`INSERT INTO content_sources(id,topic_id,name,kind,url) SELECT $1,id,'Fixture integration','feed','https://example.org/fixture' FROM topics ORDER BY position LIMIT 1`, [id]);
 const source = (await repository.sources()).find(s => s.id === id)!;
 const item = { ...parseFeed(await fixture('rss.xml'))[0], url: `https://example.org/${id}` };
 const adapter = { collect: async () => [item,item] };
 await ingest(repository, { feed: adapter, hn: adapter }, id); await ingest(repository, { feed: adapter, hn: adapter }, id);
 assert.equal((await repository.db.query('SELECT count(*)::int AS n FROM content_observations WHERE source_id=$1', [id])).rows[0].n, 1);
 const empty = { collect: async () => [] };
 await assert.rejects(ingest(repository, { feed: empty, hn: empty }, id), /no usable/);
 const state = (await repository.db.query('SELECT last_success,last_error FROM content_sources WHERE id=$1', [source.id])).rows[0];
 assert.ok(state.last_success); assert.match(state.last_error, /no usable/);
 } finally {
 await repository.db.query('DELETE FROM content_observations WHERE source_id=$1', [id]);
 await repository.db.query('DELETE FROM content_sources WHERE id=$1', [id]);
 await repository.db.query('DELETE FROM content_items WHERE canonical_url=$1', [`https://example.org/${id}`]);
 await repository.onModuleDestroy();
 }
});
