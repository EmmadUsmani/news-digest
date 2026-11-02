import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresXDiscoveryLedger } from '../src/modules/social/database/x-discovery.ledger';
import { readXDiscoveryReport } from '../src/modules/social/database/x-discovery-report';
import { PostgresXSearchRepository } from '../src/modules/social/database/x-search.repository';

void test('X daily evidence preserves zero-yield calls, counts cost once and uses UTC boundaries', async () => {
  const db = database();
  const client = await db.connect();
  const topic = '00000000-0000-4000-8000-000000000011';
  const ids = [1, 2, 3, 4, 5].map(
    (n) => `11223344-0000-4000-8000-00000000000${n}`,
  );
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL TIME ZONE 'America/Los_Angeles'");
    for (const [index, id] of ids.entries()) {
      const status =
        index === 2 ? 'uncertain' : index === 3 ? 'failed' : 'succeeded';
      const at =
        index === 4 ? '2032-01-03T00:00:00Z' : `2032-01-02T0${index}:00:00Z`;
      await client.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,cost_micros,created_at)
        VALUES($1,'fixture','fixture-report',$2,400000,$3,$4)`,
        [id, status, status === 'succeeded' ? 25000 : null, at],
      );
    }
    for (const externalId of ['887711', '887712', '887713'])
      await client.query(
        `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url)
        VALUES($1,$2,$3,'https://x.com/a/status/' || $3)`,
        [ids[0], topic, externalId],
      );
    await client.query(`INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,embed_html) VALUES
      ('x','887711','https://x.com/a/status/887711','a','https://x.com/a','2032-01-01T12:00:00Z','fixture'),
      ('x','887712','https://x.com/a/status/887712','a','https://x.com/a',NULL,'fixture')`);
    const report = await readXDiscoveryReport(client, '2032-01-02');
    assert.equal(report.calls.length, 4);
    assert.equal(report.costMicros, 50000);
    assert.equal(report.heldMicros, 400000);
    assert.deepEqual(report.calls[0].topics, [
      {
        topicId: topic,
        name: 'Tech & AI',
        citations: 3,
        verifiedNow: 2,
        datedNow: 1,
        newCandidates: 0,
        newVerifiedNow: 0,
        unknownBaseline: 3,
        outsideListVerifiedNow: 2,
        outsideListNewVerifiedNow: 0,
        unknownAuthorVerifiedNow: 0,
        selectedInDay: 0,
        outsideListSelectedInDay: 0,
      },
    ]);
    assert.deepEqual(report.calls[1].topics, []);
    assert.equal(report.calls[1].requestedTopic, null);
    assert.equal(report.calls[1].searchType, null);
    assert.equal(report.calls[3].heldMicros, 0);
    assert.equal(
      (await readXDiscoveryReport(client, '2032-01-04')).calls.length,
      0,
    );
    for (const day of ['2032-02-30', '2032-1-02', 'garbage'])
      await assert.rejects(readXDiscoveryReport(client, day), /valid UTC date/);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});

void test('X reservation snapshots attribute failed and zero-yield calls after topic deletion', async () => {
  const db = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const topicId = crypto.randomUUID();
  const runId = crypto.randomUUID();
  const calls: string[] = [];
  try {
    await db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
      VALUES($1,'00000000-0000-4000-8000-000000000001','Original topic','Fixture','Fixture',100)`,
      [topicId],
    );
    const snapshot = { id: topicId, name: 'Original topic' };
    const failed = await ledger.reserve(
      'fixture',
      runId,
      400000,
      snapshot,
      undefined,
      'open-topic',
    );
    assert.ok(failed);
    calls.push(failed);
    await ledger.fail(failed, 'rejected');
    const empty = await ledger.reserve(
      'fixture',
      runId,
      400000,
      snapshot,
      undefined,
      'account-list',
    );
    assert.ok(empty);
    calls.push(empty);
    await ledger.settle(
      empty,
      { inputTokens: 0, outputTokens: 0, postsFetched: 0, profilesFetched: 0 },
      {
        inputPerMillion: 1.25,
        outputPerMillion: 2.5,
        perPost: 0.005,
        perProfile: 0.01,
      },
    );
    await db.query("UPDATE topics SET name='Renamed' WHERE id=$1", [topicId]);
    await db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    // Pin the report date independently of the clock or UTC midnight.
    await db.query(
      "UPDATE x_discovery_calls SET created_at='2033-02-01T12:00:00Z' WHERE run_id=$1",
      [runId],
    );
    const report = await readXDiscoveryReport(db, '2033-02-01');
    assert.equal(report.calls.length, 2);
    assert.deepEqual(
      new Set(report.calls.map((call) => call.searchType)),
      new Set(['open-topic', 'account-list']),
    );
    for (const call of report.calls) {
      assert.deepEqual(call.requestedTopic, snapshot);
      assert.deepEqual(call.topics, []);
    }
    assert.deepEqual(
      new Set(report.calls.map((c) => c.status)),
      new Set(['failed', 'succeeded']),
    );
  } finally {
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      calls,
    ]);
    await db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    await db.end();
  }
});

void test('X yield snapshots exclude existing posts, repeated searches and historical citations', async () => {
  const db = database();
  const repository = new PostgresXSearchRepository(db);
  const topic = '00000000-0000-4000-8000-000000000011';
  const calls = [crypto.randomUUID(), crypto.randomUUID()];
  const posts = ['889921', '889922', '889923', '889924'];
  const link = (externalId: string) => ({
    externalId,
    url: `https://x.com/a/status/${externalId}`,
  });
  try {
    for (const id of calls)
      await db.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,cost_micros,created_at)
        VALUES($1,'fixture','yield-fixture','succeeded',400000,0,'2034-01-02T12:00:00Z')`,
        [id],
      );
    await db.query(
      `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,embed_html)
      VALUES('x',$1,'https://x.com/a/status/' || $1,'a','https://x.com/a','fixture')`,
      [posts[1]],
    );
    await db.query(
      `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url)
      VALUES($1,$2,$3,'https://x.com/a/status/1')`,
      [calls[0], topic, posts[3]],
    );
    // Concurrent saves must allocate each new post to one search only.
    await Promise.all(
      calls.map((id) => repository.save(topic, id, posts.map(link))),
    );
    await db.query(
      `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,embed_html)
      VALUES('x',$1,'https://x.com/a/status/' || $1,'a','https://x.com/a','fixture')`,
      [posts[0]],
    );
    const report = await readXDiscoveryReport(db, '2034-01-02');
    const evidence = report.calls.flatMap((call) => call.topics);
    assert.equal(
      evidence.reduce((n, t) => n + t.newCandidates, 0),
      2,
    );
    assert.equal(
      evidence.reduce((n, t) => n + t.newVerifiedNow, 0),
      1,
    );
    assert.equal(
      evidence.reduce((n, t) => n + t.unknownBaseline, 0),
      1,
    );
    // Idempotent re-saving must not erase the original baseline.
    await repository.save(topic, calls[0], posts.map(link));
    assert.deepEqual(await readXDiscoveryReport(db, '2034-01-02'), report);
  } finally {
    await db.query(
      'DELETE FROM x_search_citations WHERE call_id=ANY($1::uuid[])',
      [calls],
    );
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      calls,
    ]);
    await db.query(
      "DELETE FROM social_posts WHERE platform='x' AND external_id=ANY($1::text[])",
      [posts],
    );
    await db.end();
  }
});

void test('X search saves roll back partial citations and preserve first-search attribution on retry', async () => {
  const db = database();
  const repository = new PostgresXSearchRepository(db);
  const topic = '00000000-0000-4000-8000-000000000011';
  const calls = [crypto.randomUUID(), crypto.randomUUID()];
  const link = (externalId: string) => ({
    externalId,
    url: `https://x.com/a/status/${externalId}`,
    verificationUrl: `https://x.com/reporter/status/${externalId}`,
  });
  try {
    for (const id of calls)
      await db.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,cost_micros,created_at)
         VALUES($1,'fixture','rollback-fixture','succeeded',400000,0,'2036-01-02T12:00:00Z')`,
        [id],
      );
    await repository.save(topic, calls[0], [link('889931')]);
    const before = await readXDiscoveryReport(db, '2036-01-02');
    // The duplicate is ignored, the next insert succeeds, then a malformed
    // later row fails. Neither the new citation nor its attribution may leak.
    await assert.rejects(
      repository.save(topic, calls[0], [
        { ...link('889931'), url: 'https://x.com/changed/status/889931' },
        link('889932'),
        { ...link('889933'), url: null as unknown as string },
      ]),
      { code: '23502' },
    );
    assert.deepEqual(await readXDiscoveryReport(db, '2036-01-02'), before);
    assert.deepEqual(await repository.verificationCandidates(calls[0]), [
      '889931',
    ]);
    assert.deepEqual(await repository.verificationCandidates(calls[1]), []);

    // A later successful search owns the rolled-back post's first attribution.
    await repository.save(topic, calls[1], [link('889932'), link('889932')]);
    await repository.save(topic, calls[0], [link('889932')]);
    const report = await readXDiscoveryReport(db, '2036-01-02');
    const first = report.calls.find((call) => call.id === calls[0])!;
    const second = report.calls.find((call) => call.id === calls[1])!;
    assert.equal(first.topics[0].citations, 2);
    assert.equal(first.topics[0].newCandidates, 1);
    assert.equal(second.topics[0].citations, 1);
    assert.equal(second.topics[0].newCandidates, 1);
    assert.deepEqual(await repository.verificationCandidates(calls[0]), [
      '889932',
      '889931',
    ]);
    await repository.save(topic, calls[0], []);
    assert.deepEqual(await readXDiscoveryReport(db, '2036-01-02'), report);
  } finally {
    await db.query(
      'DELETE FROM x_search_citations WHERE call_id=ANY($1::uuid[])',
      [calls],
    );
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      calls,
    ]);
    await db.end();
  }
});

void test('X verification admission caps numeric ordering and respects exact cooldown and topic eligibility', async () => {
  const db = database();
  const client = await db.connect();
  const call = crypto.randomUUID();
  const otherCall = crypto.randomUUID();
  const topic = crypto.randomUUID();
  const posts = [
    '999',
    ...Array.from({ length: 12 }, (_, i) => String(880000 + i)),
  ];
  try {
    await client.query('BEGIN');
    // now() is transaction-stable, making the exact one-day boundary deterministic.
    await client.query("SET LOCAL TIME ZONE 'Pacific/Auckland'");
    await client.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
       VALUES($1,'00000000-0000-4000-8000-000000000001','Verification fixture','','',100)`,
      [topic],
    );
    for (const id of [call, otherCall])
      await client.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,cost_micros)
         VALUES($1,'fixture','verification-admission','succeeded',1,0)`,
        [id],
      );
    for (const id of posts)
      await client.query(
        `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url)
         VALUES($1,$2,$3,'https://x.com/a/status/' || $3)`,
        [call, topic, id],
      );
    const repository = new PostgresXSearchRepository(client as never);
    assert.deepEqual(await repository.verificationCandidates(otherCall), []);
    // Length precedes lexical order: 999 cannot outrank six-digit IDs.
    assert.deepEqual(
      await repository.verificationCandidates(call),
      posts.slice(3).reverse(),
    );
    await client.query(
      `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,embed_html)
       VALUES('x','880011','https://x.com/a/status/880011','a','https://x.com/a','fixture')`,
    );
    await client.query(
      `INSERT INTO x_embed_checks(external_id,checked_at,error) VALUES
       ('880010',now() - interval '1 day','fixture'),
       ('880009',now() - interval '1 day' - interval '1 millisecond','fixture'),
       ('880008',now() - interval '1 day' + interval '1 millisecond',NULL),
       ('880007',now() + interval '1 hour','fixture')`,
    );
    const eligible = [
      '880009',
      '880006',
      '880005',
      '880004',
      '880003',
      '880002',
      '880001',
      '880000',
      '999',
    ];
    assert.deepEqual(await repository.verificationCandidates(call), eligible);
    await client.query('UPDATE topics SET enabled=false WHERE id=$1', [topic]);
    assert.deepEqual(await repository.verificationCandidates(call), []);
    await client.query(
      'UPDATE topics SET enabled=true,post_budget=0 WHERE id=$1',
      [topic],
    );
    assert.deepEqual(await repository.verificationCandidates(call), []);
    await client.query('UPDATE topics SET post_budget=5 WHERE id=$1', [topic]);
    assert.deepEqual(await repository.verificationCandidates(call), eligible);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});

void test('X outside-list yield uses verified authors and every current list without multiplying citations', async () => {
  const db = database();
  const client = await db.connect();
  const call = crypto.randomUUID();
  const topic = '00000000-0000-4000-8000-000000000011';
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE topics SET accounts='["@KNOWN","known"]'::jsonb,enabled=false`,
    );
    await client.query(
      `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,cost_micros,created_at)
      VALUES($1,'fixture','outside-list','succeeded',1,0,'2037-01-02T12:00:00Z')`,
      [call],
    );
    const authors = [
      'https://twitter.com/KnOwN/',
      'https://x.com/outsider',
      'https://example.com/unknown',
      'https://x.com/outsider',
    ];
    for (const [i, author] of authors.entries()) {
      const id = String(887800 + i);
      await client.query(
        `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,embed_html)
        VALUES('x',$1,'https://x.com/i/status/' || $1,'Display name is not a handle',$2,'fixture')`,
        [id, author],
      );
      await client.query(
        `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url,new_candidate)
        VALUES($1,$2,$3,'https://x.com/i/status/' || $3,$4)`,
        [call, topic, id, i !== 3],
      );
    }
    // A citation URL alone cannot establish an officially verified author.
    await client.query(
      `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url,new_candidate)
      VALUES($1,$2,'887899','https://x.com/outsider/status/887899',true)`,
      [call, topic],
    );
    const evidence = async () =>
      (await readXDiscoveryReport(client, '2037-01-02')).calls[0].topics[0];
    // Repeated publication must not multiply selected posts; wrong topics,
    // platforms and editions before the search or on later days do not qualify.
    for (const [at, topicId, platform, ids] of [
      ['2037-01-02T11:00:00Z', topic, 'x', ['887803']],
      ['2037-01-03T00:00:00Z', topic, 'x', ['887803']],
      ['2037-01-02T13:00:00Z', crypto.randomUUID(), 'x', ['887803']],
      ['2037-01-02T13:00:00Z', topic, 'reddit', ['887803']],
      ['2037-01-02T13:00:00Z', topic, 'x', ['887800', '887801']],
      ['2037-01-02T14:00:00Z', topic, 'x', ['887800', '887801']],
    ] as const) {
      await client.query(
        `INSERT INTO digest_previews(profile_id,created_at,window_start,window_end,snapshot)
        VALUES('00000000-0000-4000-8000-000000000001',$1,'2037-01-01','2037-01-02',$2)`,
        [
          at,
          {
            topics: [
              {
                id: topicId,
                posts: ids.map((externalId) => ({ platform, externalId })),
              },
            ],
          },
        ],
      );
    }
    const before = await evidence();
    assert.equal(before.citations, 5);
    assert.equal(before.selectedInDay, 2);
    assert.equal(before.outsideListSelectedInDay, 1);
    assert.equal(before.verifiedNow, 4);
    assert.equal(before.outsideListVerifiedNow, 2);
    assert.equal(before.outsideListNewVerifiedNow, 1);
    assert.equal(before.unknownAuthorVerifiedNow, 1);
    await client.query(`UPDATE topics SET accounts='["outsider"]'::jsonb`);
    const after = await evidence();
    assert.equal(after.outsideListVerifiedNow, 1);
    assert.equal(after.selectedInDay, 2);
    assert.equal(after.outsideListSelectedInDay, 1);
    assert.equal(after.outsideListNewVerifiedNow, 1);
    assert.equal(after.unknownAuthorVerifiedNow, 1);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});
