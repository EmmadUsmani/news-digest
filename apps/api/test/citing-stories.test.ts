import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { DigestPreview, SelectedPost } from '@digest/contracts';

import { database } from '../src/libs/db/connections';
import { linkCitingStories } from '../src/modules/social/public/citing-stories';

void test('citation links use selected lead/coverage/evidence only and freeze titles in snapshots', async () => {
  const db = database();
  const client = await db.connect();
  const ids = Array.from({ length: 4 }, () => crypto.randomUUID());
  const posts: SelectedPost[] = ['9991071', '9991072'].map((externalId) => ({
    platform: 'x',
    externalId,
    url: `https://x.com/i/status/${externalId}`,
    author: 'Fixture',
    authorUrl: 'https://x.com/fixture',
    publishedAt: '2026-11-01T12:00:00Z',
    text: 'Synthetic post',
    metrics: {},
    reasons: [],
  }));
  const story = (id: string) => ({
    id,
    title: `Fixture ${id}`,
    url: `https://example.org/${id}`,
    excerpt: '',
    publishedAt: '2026-11-01T12:00:00Z',
    sources: ['Fixture'],
    score: 1,
    reasons: [],
  });
  const stories: DigestPreview['topics'][number]['stories'] = [
    { ...story(ids[0]), coverage: [story(ids[1])], evidence: [story(ids[2])] },
  ];
  try {
    await client.query('BEGIN');
    for (const id of ids) {
      await client.query(
        `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at) VALUES($1,$2,'Fixture','',now())`,
        [id, `https://example.org/${id}`],
      );
    }
    for (const id of ids) {
      await client.query(
        `INSERT INTO x_link_citations(external_id,item_id,source_id,canonical_url) VALUES($1,$2,'hn',$3)`,
        [posts[0].externalId, id, posts[0].url],
      );
    }
    const linked = await linkCitingStories(client, posts, stories);
    assert.deepEqual(linked[0].citingStories, [
      { id: ids[0], title: stories[0].title },
    ]);
    assert.deepEqual(linked[1].citingStories, []);
    for (const member of [ids[1], ids[2]]) {
      await client.query('DELETE FROM x_link_citations WHERE item_id <> $1', [
        member,
      ]);
      if (member === ids[2]) {
        await client.query(
          `INSERT INTO x_link_citations(external_id,item_id,source_id,canonical_url) VALUES($1,$2,'hn',$3)`,
          [posts[0].externalId, member, posts[0].url],
        );
      }
      assert.equal(
        (await linkCitingStories(client, posts, stories))[0].citingStories?.[0]
          .id,
        ids[0],
      );
    }
    await client.query('DELETE FROM x_link_citations WHERE external_id=$1', [
      posts[0].externalId,
    ]);
    assert.deepEqual(
      (await linkCitingStories(client, posts, stories))[0].citingStories,
      [],
    );
    assert.equal(linked[0].citingStories?.[0].title, stories[0].title);
    assert.equal(posts[0].citingStories, undefined);
    assert.deepEqual(await linkCitingStories(client, posts, []), posts);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});
