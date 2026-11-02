import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { RiverDiscovery } from '../src/modules/social/adapters/river-discovery';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';

void test('recorded public river links remain discovery evidence and respect failed-check cooldown', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/techmeme-river.txt',
    'utf8',
  );
  const adapter = new RiverDiscovery({ get: async () => html });
  const links = await adapter.collect('https://www.techmeme.com/');
  assert.ok(links.length > 0);
  assert.ok(links.some((link) => link.externalId === '2116948532477468673'));
  assert.equal(
    new Set(links.map((link) => link.externalId)).size,
    links.length,
  );
  const empty = new RiverDiscovery({
    get: async () =>
      readFile('apps/api/test/fixtures/memeorandum-river.txt', 'utf8'),
  });
  assert.deepEqual(await empty.collect('https://www.memeorandum.com/'), []);
  const repository = new PostgresSocialRepository();
  try {
    const source = (await repository.discoverySources()).find(
      (s) => s.id === 'techmeme',
    )!;
    assert.ok(source);
    await repository.discovered(source.id, links);
    await repository.discovered(source.id, links);
    const rows = await repository.db.query(
      'SELECT * FROM social_discovery_citations WHERE source_id=$1',
      [source.id],
    );
    assert.equal(rows.rowCount, links.length);
    assert.ok(rows.rows.every((row) => row.first_seen_at <= row.last_seen_at));
    const id = links[0].externalId;
    assert.equal(
      await repository.verificationUrl(id),
      links[0].verificationUrl,
    );
    assert.ok((await repository.candidates(50)).includes(id));
    await repository.checked(id, 'Official embed unavailable or invalid');
    assert.ok(!(await repository.candidates(50)).includes(id));
    await repository.discoveryFailed(source.id);
    const failed = await repository.db.query(
      'SELECT * FROM social_discovery_sources WHERE id=$1',
      [source.id],
    );
    assert.ok(failed.rows[0].last_success);
    assert.ok(failed.rows[0].last_error);
    await repository.discovered(source.id, []);
    const recovered = await repository.db.query(
      'SELECT * FROM social_discovery_sources WHERE id=$1',
      [source.id],
    );
    assert.equal(recovered.rows[0].last_link_count, 0);
    assert.equal(recovered.rows[0].last_error, null);
    assert.equal(
      (
        await repository.db.query(
          'SELECT * FROM social_discovery_citations WHERE source_id=$1',
          [source.id],
        )
      ).rowCount,
      links.length,
    );
    assert.equal(
      (
        await repository.db.query(
          'SELECT * FROM social_posts WHERE external_id=$1',
          [id],
        )
      ).rowCount,
      0,
    );
  } finally {
    await repository.db.end();
  }
});

void test('river discovery upserts preserve evidence and roll back a whole failed collection', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresSocialRepository();
  const source = 'river-transaction-fixture';
  const id = '2116948532477468601';
  const other = '2116948532477468602';
  const link = {
    externalId: id,
    url: `https://x.com/i/status/${id}`,
    verificationUrl: `https://x.com/fixture/status/${id}`,
  };
  const snapshot = async () => ({
    source: (
      await repository.db.query(
        'SELECT * FROM social_discovery_sources WHERE id=$1',
        [source],
      )
    ).rows[0],
    citations: (
      await repository.db.query(
        'SELECT * FROM social_discovery_citations WHERE source_id=$1 ORDER BY external_id',
        [source],
      )
    ).rows,
  });
  try {
    await repository.db.query(
      `INSERT INTO social_discovery_sources(id,topic_id,name,url)
       SELECT $1,id,'River transaction fixture','https://example.org/river-fixture' FROM topics ORDER BY id LIMIT 1`,
      [source],
    );
    await repository.discovered(source, [link, link]);
    await repository.db.query(
      `UPDATE social_discovery_citations SET first_seen_at='2020-01-01Z',last_seen_at='2020-01-02Z' WHERE source_id=$1`,
      [source],
    );
    const initial = await snapshot();
    assert.equal(initial.citations.length, 1);
    assert.equal(initial.source.last_link_count, 2);
    await repository.discovered(source, [
      { externalId: id, url: 'https://example.org/changed' },
    ]);
    const updated = await snapshot();
    assert.equal(updated.citations[0].canonical_url, link.url);
    assert.equal(updated.citations[0].verification_url, link.verificationUrl);
    assert.deepEqual(
      updated.citations[0].first_seen_at,
      initial.citations[0].first_seen_at,
    );
    assert.ok(
      updated.citations[0].last_seen_at > initial.citations[0].last_seen_at,
    );
    assert.equal(await repository.verificationUrl(id), link.verificationUrl);
    const replacement = `https://twitter.com/newfixture/status/${id}`;
    await repository.discovered(source, [
      { ...link, verificationUrl: replacement },
    ]);
    assert.equal(await repository.verificationUrl(id), replacement);
    await repository.discoveryFailed(source);
    const before = await snapshot();
    await assert.rejects(
      repository.discovered(source, [
        { ...link, verificationUrl: 'https://example.org/must-roll-back' },
        { externalId: other, url: `https://x.com/i/status/${other}` },
        { externalId: '2116948532477468603', url: null as unknown as string },
      ]),
    );
    assert.deepEqual(await snapshot(), before);
    assert.equal(await repository.verificationUrl(other), undefined);
    await repository.discovered(source, []);
    const recovered = await snapshot();
    assert.equal(recovered.source.last_error, null);
    assert.equal(recovered.source.last_link_count, 0);
    assert.deepEqual(recovered.citations, before.citations);
  } finally {
    await repository.db.query(
      'DELETE FROM social_discovery_citations WHERE source_id=$1',
      [source],
    );
    await repository.db.query(
      'DELETE FROM social_discovery_sources WHERE id=$1',
      [source],
    );
    await repository.db.end();
  }
});
