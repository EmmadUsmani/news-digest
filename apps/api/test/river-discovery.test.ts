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
