import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';

void test('bounded verification shares slots across enabled topics, dedupes shared posts and defers refreshes', async () => {
  const repository = new PostgresSocialRepository();
  const topics = Array.from({ length: 4 }, () => crypto.randomUUID());
  const enabled = await repository.db.query<{ id: string }>(
    'SELECT id FROM topics WHERE enabled',
  );
  const ids = Array.from(
    { length: 20 },
    (_, i) => `9992000000000000${String(i).padStart(2, '0')}`,
  );
  const sources = topics.map((_, i) => `candidate-fixture-${i}`);
  try {
    await repository.db.query('UPDATE topics SET enabled=false');
    for (const [i, topic] of topics.entries()) {
      await repository.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
        VALUES($1,'00000000-0000-4000-8000-000000000001','Fixture','Fixture','Fixture',$2)`,
        [topic, i + 100],
      );
      await repository.db.query(
        `INSERT INTO social_discovery_sources(id,topic_id,name,url) VALUES($1,$2,'Fixture',$3)`,
        [sources[i], topic, `https://example.org/candidates/${i}`],
      );
      await repository.discovered(
        sources[i],
        (i === 0 ? ids.slice(0, 16) : [ids[15 + i]]).map((externalId) => ({
          externalId,
          url: `https://x.com/fixture/status/${externalId}`,
        })),
      );
    }
    // One post is cited in two topics, yet consumes only one request.
    await repository.discovered(sources[1], [
      { externalId: ids[15], url: `https://x.com/fixture/status/${ids[15]}` },
    ]);
    await repository.store({
      platform: 'x',
      externalId: ids[18],
      url: `https://x.com/fixture/status/${ids[18]}`,
      author: 'Fixture',
      authorUrl: 'https://x.com/fixture',
      publishedAt: null,
      metrics: {},
      embedHtml: '<p>Fixture</p>',
    });
    const first = await repository.candidates(4);
    assert.equal(first.length, 4);
    assert.equal(new Set(first).size, 4);
    assert.ok(first.includes(ids[17])); // quiet third topic receives a slot
    assert.ok(first.includes(ids[16])); // second topic, even with shared post
    assert.ok(!first.includes(ids[18])); // verified fourth-topic post waits
    assert.equal((await repository.candidates(50)).at(-1), ids[18]);
    await repository.checked(ids[17], 'Unavailable');
    assert.ok(!(await repository.candidates(50)).includes(ids[17]));
    await repository.db.query(
      "UPDATE x_embed_checks SET checked_at=now()-interval '2 days' WHERE external_id=$1",
      [ids[17]],
    );
    assert.ok((await repository.candidates(50)).includes(ids[17]));
    await repository.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topics[2],
    ]);
    assert.ok(!(await repository.candidates(50)).includes(ids[17]));
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topics[1]]);
    assert.ok(!(await repository.candidates(50)).includes(ids[16]));
  } finally {
    await repository.db.query(
      'DELETE FROM social_discovery_sources WHERE id=ANY($1::text[])',
      [sources],
    );
    await repository.db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      topics,
    ]);
    await repository.db.query(
      'UPDATE topics SET enabled=true WHERE id=ANY($1::uuid[])',
      [enabled.rows.map((row) => row.id)],
    );
    await repository.db.query(
      'DELETE FROM social_posts WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await repository.db.query(
      'DELETE FROM x_embed_checks WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await repository.db.end();
  }
});
