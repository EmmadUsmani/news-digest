import assert from 'node:assert/strict';
import { test } from 'node:test';

import { XOfficialEmbed } from '../src/modules/social/adapters/x-oembed';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';

// Synthetic protocol fixture; never treated as live content.
const fixture = {
  type: 'rich',
  provider_name: 'Twitter',
  provider_url: 'https://twitter.com',
  author_name: 'Example',
  author_url: 'https://twitter.com/example',
  url: 'https://twitter.com/example/status/123456789',
  html: '<blockquote class="twitter-tweet"><p>Example post</p><a href="https://twitter.com/example/status/123456789">Date</a></blockquote>',
};
void test('official embed binds exact post ID, leaves unknown time and metrics empty, and stores idempotently', async () => {
  const adapter = new XOfficialEmbed({
    get: async (url) => {
      assert.equal(new URL(url).hostname, 'publish.twitter.com');
      assert.equal(new URL(url).searchParams.get('omit_script'), 'true');
      assert.equal(
        new URL(url).searchParams.get('url'),
        'https://twitter.com/example/status/123456789',
      );
      return JSON.stringify(fixture);
    },
  });
  const post = await adapter.verify(
    '123456789',
    'https://twitter.com/example/status/123456789',
  );
  assert.equal(post.publishedAt, null);
  assert.deepEqual(post.metrics, {});
  const repository = new PostgresSocialRepository();
  try {
    await repository.store(post);
    await repository.store(post);
    await repository.checked(post.externalId, null);
    const result = await repository.db.query(
      'SELECT * FROM social_posts WHERE external_id=$1',
      [post.externalId],
    );
    assert.equal(result.rowCount, 1);
    assert.equal(result.rows[0].author, 'Example');
    assert.equal(result.rows[0].published_at, null);
    assert.deepEqual(result.rows[0].metrics, {});
    const checks = await repository.db.query(
      'SELECT error FROM x_embed_checks WHERE external_id=$1',
      [post.externalId],
    );
    assert.equal(checks.rows[0].error, null);
  } finally {
    await repository.db.end();
  }
});
void test('rejects unavailable, mismatched or unsafe embeds instead of promoting citations', async () => {
  for (const change of [
    { url: 'https://twitter.com/example/status/999' },
    { author_url: 'https://twitter.com.evil.org/example' },
    { html: fixture.html + '<script>alert(1)</script>' },
    { html: fixture.html.replace('<p>', '<p onclick="x()">') },
    {
      html: '<blockquote class="twitter-tweet">Missing post link</blockquote>',
    },
    { provider_name: 'Other' },
  ]) {
    const adapter = new XOfficialEmbed({
      get: async () => JSON.stringify({ ...fixture, ...change }),
    });
    await assert.rejects(adapter.verify('123456789'));
  }
  await assert.rejects(
    new XOfficialEmbed({
      get: async () => {
        throw new Error('must not fetch');
      },
    }).verify('123456789', 'https://evil.org/example/status/123456789'),
    /Invalid X verification URL/,
  );
  await assert.rejects(
    new XOfficialEmbed({ get: async () => '<html>Unavailable</html>' }).verify(
      '123456789',
    ),
  );
  await assert.rejects(
    new XOfficialEmbed({
      get: async () => {
        throw new Error('HTTP 404');
      },
    }).verify('123456789'),
  );
});

void test('accepts current official X branding with a named post URL', async () => {
  const post = await new XOfficialEmbed({
    get: async () =>
      JSON.stringify({
        ...fixture,
        provider_name: 'X',
        provider_url: 'https://x.com',
      }),
  }).verify('123456789', 'https://x.com/example/status/123456789');
  assert.equal(post.externalId, '123456789');
});
