import assert from 'node:assert/strict';
import { test } from 'node:test';

import { XOfficialEmbed } from '../src/modules/social/adapters/x-oembed';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';
import { xPostTime } from '../src/modules/social/domain/x-post-time';

const time = '2026-11-01T12:34:56.789Z';
const id = (
  ((BigInt(Date.parse(time)) - 1288834974657n) << 22n) +
  4194303n
).toString();
const now = new Date('2026-11-02T00:00:00Z');

void test('Snowflake time preserves milliseconds and uses post time rather than observation time', () => {
  assert.equal(xPostTime(id, now), time);
  assert.equal(xPostTime(id, new Date(time)), time);
  assert.equal(xPostTime(id, new Date(Date.parse(time) - 1)), null);
  for (const invalid of [
    '123456789',
    '0',
    '-1',
    '1.5',
    '1e18',
    '9223372036854775808',
    '999999999999999999999',
    '',
  ])
    assert.equal(xPostTime(invalid, now), null);
});

void test('verified embeds receive encoded time; existing verified rows refresh idempotently without changing evidence', async () => {
  const post = await new XOfficialEmbed({
    get: async () =>
      JSON.stringify({
        type: 'rich',
        provider_name: 'X',
        provider_url: 'https://x.com',
        author_name: 'Synthetic',
        author_url: 'https://x.com/example',
        url: `https://x.com/example/status/${id}`,
        html: `<blockquote class="twitter-tweet"><a href="https://x.com/example/status/${id}">Date</a></blockquote>`,
      }),
  }).verify(id, `https://x.com/example/status/${id}`);
  assert.equal(post.publishedAt, time);
  const repository = new PostgresSocialRepository();
  try {
    await repository.store({ ...post, publishedAt: null });
    assert.equal(await repository.refreshMissingTimes(now), 1);
    assert.equal(await repository.refreshMissingTimes(now), 0);
    const rows = await repository.db.query(
      'SELECT * FROM social_posts WHERE external_id=$1',
      [id],
    );
    assert.equal(rows.rows[0].published_at.toISOString(), time);
    assert.equal(rows.rows[0].embed_html, post.embedHtml);
    assert.deepEqual(rows.rows[0].metrics, {});
    await repository.db.query(
      'UPDATE social_posts SET published_at=NULL WHERE external_id=$1',
      [id],
    );
    await repository.store(post);
    await repository.store({ ...post, publishedAt: null });
    const updated = await repository.db.query(
      'SELECT published_at FROM social_posts WHERE external_id=$1',
      [id],
    );
    assert.equal(updated.rows[0].published_at.toISOString(), time);
  } finally {
    await repository.db.end();
  }
});
