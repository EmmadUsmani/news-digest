import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  DirectXSearch,
  xSearchBody,
} from '../src/modules/social/adapters/x-search';
import { searchX } from '../src/modules/social/application/search-x';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';
import { PostgresXDiscoveryLedger } from '../src/modules/social/database/x-discovery.ledger';
import { readXDiscoveryReport } from '../src/modules/social/database/x-discovery-report';
import { PostgresXSearchRepository } from '../src/modules/social/database/x-search.repository';
import { XSearchError } from '../src/modules/social/domain/x-search.port';

// Synthetic protocol examples based on the public xAI OpenAPI schema, NOT recorded live responses.
const request = {
  topic: 'Fixture NBA',
  guidance: 'Highlights',
  handles: ['NBA', 'NBAPR'],
  fromDate: '2026-11-01',
  toDate: '2026-11-02',
};
const price = {
  inputPerMillion: 1.25,
  outputPerMillion: 2.5,
  perPost: 0.005,
  perProfile: 0.01,
};
const externalId = '2117000000000000001';
const fixture = () => ({
  status: 'completed',
  usage: {
    input_tokens: 1000,
    output_tokens: 100,
    server_side_tool_usage_details: { x_posts_fetched: 12, x_users_fetched: 1 },
  },
  output: [
    {
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'output_text',
          text: 'Invented prose URL https://x.com/fake/status/2117000000000000099 with 99999 likes',
          annotations: [
            {
              type: 'url_citation',
              url: `https://x.com/NBA/status/${externalId}`,
            },
            {
              type: 'url_citation',
              url: `https://twitter.com/NBA/status/${externalId}`,
            },
            {
              type: 'url_citation',
              url: 'https://x.com.evil.test/NBA/status/2117000000000000002',
            },
          ],
        },
      ],
    },
  ],
});
const fake =
  (body: unknown, status = 200): typeof fetch =>
  async () =>
    new Response(JSON.stringify(body), { status });

void test('open X discovery omits account restrictions and accepts cited outside-list posts with bounded usage', async () => {
  const open = {
    topic: request.topic,
    guidance: request.guidance,
    fromDate: request.fromDate,
    toDate: request.toDate,
  };
  const body = xSearchBody(open);
  assert.equal('allowed_x_handles' in body.tools[0], false);
  assert.equal(body.max_turns, 1);
  assert.equal(body.max_output_tokens, 1000);
  assert.match(body.input[0].content, /most-engaged, fastest-rising/);
  assert.match(body.input[0].content, /keyword and semantic/);
  assert.match(body.input[0].content, /small or unknown accounts/);
  assert.match(body.input[0].content, /request at most five results/);
  assert.match(
    body.input[0].content,
    /crypto, giveaways and routine news reposts/,
  );
  const response = fixture();
  response.output[0].content[0].annotations = [
    {
      type: 'url_citation',
      url: `https://x.com/small_builder/status/${externalId}`,
    },
  ];
  const adapter = new DirectXSearch('offline-fixture', async (_url, init) => {
    assert.deepEqual(JSON.parse(init?.body as string), body);
    return new Response(JSON.stringify(response));
  });
  const result = await adapter.search(open);
  assert.equal(result.links.length, 1);
  assert.equal(result.links[0].externalId, externalId);
  assert.equal(
    result.links[0].verificationUrl,
    `https://twitter.com/small_builder/status/${externalId}`,
  );
  assert.equal(result.usage.postsFetched, 12);
  assert.equal(result.usage.profilesFetched, 1);
});

void test('X request restricts accounts, whole UTC dates, one round, model and media; validates before HTTP', async () => {
  const body = xSearchBody(request);
  assert.equal(body.model, 'grok-4.3');
  assert.equal(body.max_turns, 1);
  assert.equal(body.max_output_tokens, 1000);
  assert.equal(body.parallel_tool_calls, false);
  assert.equal(body.store, false);
  assert.deepEqual(body.tools, [
    {
      type: 'x_search',
      allowed_x_handles: ['NBA', 'NBAPR'],
      from_date: request.fromDate,
      to_date: request.toDate,
      enable_image_understanding: false,
      enable_video_understanding: false,
    },
  ]);
  for (const invalid of [
    { handles: [] },
    { handles: ['@NBA'] },
    { handles: ['NBA', 'nba'] },
    { handles: Array.from({ length: 21 }, (_, i) => `a${i}`) },
    { fromDate: '2026-02-30' },
    { fromDate: '2026-11-01T00:00:00Z' },
    { toDate: request.fromDate },
    { toDate: '2026-11-09' },
    { topic: '' },
  ])
    assert.throws(() => xSearchBody({ ...request, ...invalid }));
  let calls = 0;
  const adapter = new DirectXSearch('offline-fixture', async (url, init) => {
    calls++;
    assert.equal(url, 'https://api.x.ai/v1/responses');
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.method, 'POST');
    assert.ok(init?.signal);
    assert.equal(typeof init?.body, 'string');
    assert.deepEqual(JSON.parse(init?.body as string), body);
    return new Response(JSON.stringify(fixture()));
  });
  await assert.rejects(adapter.search({ ...request, handles: [] }));
  assert.equal(calls, 0);
  const result = await adapter.search(request);
  assert.equal(calls, 1);
  assert.deepEqual(result.links, [
    {
      externalId,
      url: `https://x.com/i/web/status/${externalId}`,
      verificationUrl: `https://twitter.com/NBA/status/${externalId}`,
    },
  ]);
  assert.deepEqual(result.usage, {
    inputTokens: 1000,
    outputTokens: 100,
    postsFetched: 12,
    profilesFetched: 1,
  });
  // Incomplete or malformed output still records valid billed usage, without promoting citations.
  const incomplete = { ...fixture(), status: 'incomplete' };
  assert.deepEqual(
    (await new DirectXSearch('fixture', fake(incomplete)).search(request))
      .links,
    [],
  );
  assert.deepEqual(
    (
      await new DirectXSearch(
        'fixture',
        fake({ ...fixture(), output: null }),
      ).search(request)
    ).links,
    [],
  );
});

void test('X errors sanitize provider text, never retry, retain ambiguous bills and identify credit depletion', async () => {
  for (const [status, body, reason] of [
    [400, { error: 'bad argument secret-fixture' }, 'rejected'],
    [401, { error: 'secret-fixture' }, 'rejected'],
    [402, { error: 'Insufficient credits secret-fixture' }, 'credits-depleted'],
    [429, { error: 'credits depleted secret-fixture' }, 'credits-depleted'],
    [429, { error: 'rate limited secret-fixture' }, 'uncertain'],
    [500, { error: 'secret-fixture' }, 'uncertain'],
    [
      200,
      { ...fixture(), usage: { input_tokens: 1, output_tokens: 1 } },
      'uncertain',
    ],
    [
      200,
      { ...fixture(), usage: { ...fixture().usage, input_tokens: -1 } },
      'uncertain',
    ],
  ] as const) {
    let calls = 0;
    const adapter = new DirectXSearch('fixture', async () => {
      calls++;
      return new Response(JSON.stringify(body), { status });
    });
    await assert.rejects(
      adapter.search(request),
      (error: unknown) =>
        error instanceof XSearchError &&
        error.reason === reason &&
        !error.message.includes('secret-fixture'),
    );
    assert.equal(calls, 1);
  }
  for (const send of [
    (async () => {
      throw new Error('secret-fixture');
    }) as typeof fetch,
    (async () => new Response('not-json')) as typeof fetch,
    (async () => new Response('x'.repeat(2 * 1024 * 1024 + 1))) as typeof fetch,
  ])
    await assert.rejects(
      new DirectXSearch('fixture', send).search(request),
      (error: unknown) =>
        error instanceof XSearchError && error.reason === 'uncertain',
    );
});

void test('X orchestration refuses blocked budgets, settles before citation persistence and never releases spend after save failure', async () => {
  const events: string[] = [];
  const ledger = {
    reserve: async (
      _model: string,
      _run: string,
      amount: number,
      topic?: { id: string; name: string },
    ) => {
      assert.deepEqual(topic, { id: 'topic', name: request.topic });
      assert.equal(amount, 400000);
      events.push('reserve');
      return 'id';
    },
    settle: async () => {
      events.push('settle');
    },
    fail: async (_id: string, reason: string) => {
      events.push(reason);
    },
  };
  const adapter = new DirectXSearch('fixture', fake(fixture()));
  const repository = {
    save: async () => {
      events.push('save');
      throw new Error('DB unavailable');
    },
  };
  await assert.rejects(
    searchX('topic', 'run', request, adapter, ledger, repository, price),
  );
  assert.deepEqual(events, ['reserve', 'settle', 'save']);
  events.length = 0;
  const result = await searchX(
    'topic',
    'run',
    request,
    {
      search: async () => {
        events.push('search');
        throw new Error('network');
      },
    },
    ledger,
    repository,
    price,
  );
  assert.equal(result.state, 'failed');
  assert.deepEqual(events, ['reserve', 'search', 'uncertain']);
  events.length = 0;
  assert.equal(
    (
      await searchX(
        'topic',
        'run',
        request,
        {
          search: async () => {
            throw new Error('Must not call');
          },
        },
        { ...ledger, reserve: async () => null },
        repository,
        price,
      )
    ).state,
    'budget-blocked',
  );
  assert.deepEqual(events, []);
  let settledPrice = price;
  await searchX(
    'topic',
    'run',
    request,
    {
      search: async () => ({
        links: [],
        usage: {
          inputTokens: 200000,
          outputTokens: 100,
          postsFetched: 1,
          profilesFetched: 0,
        },
      }),
    },
    {
      ...ledger,
      settle: async (_id, _usage, actualPrice) => {
        settledPrice = actualPrice;
      },
    },
    { save: async () => {} },
    price,
  );
  assert.deepEqual(settledPrice, {
    ...price,
    inputPerMillion: 2.5,
    outputPerMillion: 5,
  });
});

void test('X citations join enabled topic verification/selection, preserve call provenance and dedupe idempotently in isolated Postgres', async () => {
  const social = new PostgresSocialRepository();
  const repository = new PostgresXSearchRepository(social.db);
  const ledger = new PostgresXDiscoveryLedger(social.db);
  const topicId = crypto.randomUUID();
  const calls: string[] = [];
  try {
    const seeds = await social.db.query<{ accounts: string[] }>(
      "SELECT accounts FROM topics WHERE id='00000000-0000-4000-8000-000000000014'",
    );
    assert.ok(seeds.rows[0].accounts.includes('Reuters'));
    await social.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,accounts)
      VALUES($1,'00000000-0000-4000-8000-000000000001','Fixture','Fixture','Fixture',100,'["NBA"]')`,
      [topicId],
    );
    assert.deepEqual((await repository.topic(topicId)).handles, ['NBA']);
    const result = await searchX(
      topicId,
      'offline-x-search',
      request,
      new DirectXSearch('fixture', fake(fixture())),
      ledger,
      {
        save: async (topic, call, links) => {
          calls.push(call);
          await repository.save(topic, call, links);
          await repository.save(topic, call, links);
        },
      },
      price,
    );
    assert.equal(result.state, 'completed');
    assert.equal((await ledger.status()).todayMicros, 71500);
    assert.equal(
      (
        await social.db.query(
          'SELECT 1 FROM x_search_citations WHERE call_id=$1',
          calls,
        )
      ).rowCount,
      1,
    );
    assert.deepEqual(await repository.verificationCandidates(calls[0]), [
      externalId,
    ]);
    assert.deepEqual(
      await repository.verificationCandidates(crypto.randomUUID()),
      [],
    );
    await social.checked(externalId, 'Fixture unavailable');
    assert.deepEqual(await repository.verificationCandidates(calls[0]), []);
    await social.db.query(
      "UPDATE x_embed_checks SET checked_at=now()-interval '2 days' WHERE external_id=$1",
      [externalId],
    );
    assert.deepEqual(await repository.verificationCandidates(calls[0]), [
      externalId,
    ]);
    assert.ok((await social.candidates(50)).includes(externalId));
    assert.equal(
      await social.verificationUrl(externalId),
      `https://twitter.com/NBA/status/${externalId}`,
    );
    assert.deepEqual(await social.topicPosts(topicId), []); // Citation is not verification.
    await social.store({
      platform: 'x',
      externalId,
      url: `https://x.com/i/web/status/${externalId}`,
      author: 'Fixture',
      authorUrl: 'https://x.com/NBA',
      publishedAt: '2026-11-01T12:00:00Z',
      metrics: {},
      embedHtml: '<p>Offline fixture</p>',
    });
    assert.equal((await social.topicPosts(topicId)).length, 1);
    assert.deepEqual(await repository.verificationCandidates(calls[0]), []);
    await social.checked(externalId, null);
    assert.ok(!(await social.candidates(50)).includes(externalId));
    await social.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topicId,
    ]);
    assert.equal(await repository.topic(topicId), undefined);
    await social.db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    assert.equal(
      (
        await social.db.query(
          'SELECT topic_id FROM x_search_citations WHERE call_id=$1',
          calls,
        )
      ).rows[0].topic_id,
      null,
    );
  } finally {
    await social.db.query(
      'DELETE FROM x_search_citations WHERE call_id=ANY($1::uuid[])',
      [calls],
    );
    await social.db.query(
      'DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])',
      [calls],
    );
    await social.db.query('DELETE FROM x_embed_checks WHERE external_id=$1', [
      externalId,
    ]);
    await social.db.query('DELETE FROM social_posts WHERE external_id=$1', [
      externalId,
    ]);
    await social.db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    await social.db.end();
  }
});

void test('X search repository pins configuration, first-write provenance, shared topics and atomic batch rollback', async () => {
  const social = new PostgresSocialRepository();
  const repository = new PostgresXSearchRepository(social.db);
  const topic = crypto.randomUUID();
  const otherTopic = crypto.randomUUID();
  const calls = [crypto.randomUUID(), crypto.randomUUID()];
  const ids = [
    '2117990000000000001',
    '2117990000000000002',
    '2117990000000000003',
  ];
  const link = (index: number) => ({
    externalId: ids[index],
    url: `https://x.com/i/web/status/${ids[index]}`,
    verificationUrl: `https://twitter.com/Fixture/status/${ids[index]}`,
  });
  try {
    for (const id of [topic, otherTopic])
      await social.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,accounts)
         VALUES($1,'00000000-0000-4000-8000-000000000001','X fixture','Fixture','Highlights',100,'["NBA","NBAPR"]')`,
        [id],
      );
    for (const id of calls)
      await social.db.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros)
         VALUES($1,'offline-fixture','repository-characterization','pending',1)`,
        [id],
      );
    assert.deepEqual(await repository.topic(topic), {
      id: topic,
      name: 'X fixture',
      guidance: 'Highlights',
      handles: ['NBA', 'NBAPR'],
    });
    await social.db.query('UPDATE topics SET post_budget=0 WHERE id=$1', [
      topic,
    ]);
    assert.equal(await repository.topic(topic), undefined);
    await social.db.query(
      `UPDATE topics SET post_budget=5,include_guidance='Updated',accounts='[]' WHERE id=$1`,
      [topic],
    );
    assert.equal((await repository.topic(topic)).guidance, 'Updated');
    assert.deepEqual((await repository.topic(topic)).handles, []);
    await repository.save(topic, calls[0], []);
    await repository.save(topic, calls[0], [link(0), link(0)]);
    await repository.save(otherTopic, calls[0], [
      { ...link(0), verificationUrl: 'https://example.com/changed' },
    ]);
    assert.equal(await social.verificationUrl(ids[0]), link(0).verificationUrl);
    // The key is call + post, so a repeated call cannot reassign the original topic.
    await social.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topic,
    ]);
    assert.ok(!(await social.candidates(50)).includes(ids[0]));
    await repository.save(otherTopic, calls[1], [link(0)]);
    assert.equal(
      (await social.candidates(50)).filter((id) => id === ids[0]).length,
      1,
    );
    await social.db.query('DELETE FROM topics WHERE id=$1', [topic]);
    assert.equal(await repository.topic(topic), undefined);
    assert.ok((await social.candidates(50)).includes(ids[0]));

    // Fixture-only final-row rejection exercises a real partial-batch rollback.
    await social.db
      .query(`ALTER TABLE x_search_citations ADD CONSTRAINT fixture_x_search_reject
      CHECK (external_id <> '2117990000000000003') NOT VALID`);
    await assert.rejects(
      repository.save(otherTopic, calls[1], [link(1), link(2)]),
    );
    assert.ok(!(await social.candidates(50)).includes(ids[1]));
    assert.equal(await social.verificationUrl(ids[1]), undefined);
    assert.equal(await social.verificationUrl(ids[0]), link(0).verificationUrl);
    await social.db.query(
      'ALTER TABLE x_search_citations DROP CONSTRAINT fixture_x_search_reject',
    );
    await repository.save(otherTopic, calls[1], [link(1), link(2)]);
    for (const id of ids) assert.ok((await social.candidates(50)).includes(id));
    await assert.rejects(
      repository.save(otherTopic, crypto.randomUUID(), [
        { ...link(1), externalId: '2117990000000000004' },
      ]),
    );
    await assert.rejects(
      repository.save(crypto.randomUUID(), calls[1], [
        { ...link(1), externalId: '2117990000000000004' },
      ]),
    );
    await social.db.query('DELETE FROM topics WHERE id=$1', [otherTopic]);
    for (const id of ids)
      assert.ok(!(await social.candidates(50)).includes(id));
    // Deleting configuration removes eligibility while retaining call provenance.
    assert.equal(await social.verificationUrl(ids[1]), link(1).verificationUrl);
  } finally {
    await social.db.query(
      'ALTER TABLE x_search_citations DROP CONSTRAINT IF EXISTS fixture_x_search_reject',
    );
    await social.db.query(
      'DELETE FROM x_search_citations WHERE call_id=ANY($1::uuid[])',
      [calls],
    );
    await social.db.query(
      'DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])',
      [calls],
    );
    await social.db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      [topic, otherTopic],
    ]);
    await social.db.end();
  }
});

void test('concurrent X search saves attribute each new post to exactly one call', async () => {
  const social = new PostgresSocialRepository();
  const first = new PostgresXSearchRepository(social.db);
  const second = new PostgresXSearchRepository(social.db);
  const topic = crypto.randomUUID();
  const calls = [crypto.randomUUID(), crypto.randomUUID()];
  const ids = ['2117991000000000001', '2117991000000000002'];
  const links = ids.map((externalId) => ({
    externalId,
    url: `https://x.com/i/web/status/${externalId}`,
  }));
  try {
    await social.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
       VALUES($1,'00000000-0000-4000-8000-000000000001','Concurrent search','Fixture','Fixture',100)`,
      [topic],
    );
    for (const id of calls)
      await social.db.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros)
         VALUES($1,'offline-fixture','concurrent-attribution','pending',1)`,
        [id],
      );
    for (let attempt = 0; attempt < 3; attempt++) {
      await Promise.all([
        first.save(topic, calls[0], links),
        second.save(topic, calls[1], [...links].reverse()),
      ]);
      const candidates = await Promise.all(
        calls.map((id) => first.verificationCandidates(id)),
      );
      assert.deepEqual(candidates, [[...ids].reverse(), [...ids].reverse()]);
      const report = await readXDiscoveryReport(
        social.db,
        new Date().toISOString().slice(0, 10),
      );
      const evidence = report.calls.filter((call) => calls.includes(call.id));
      assert.equal(evidence.length, 2);
      assert.deepEqual(
        evidence.map((call) => call.topics[0].citations),
        [2, 2],
      );
      assert.deepEqual(
        evidence.map((call) => call.topics[0].newCandidates).sort(),
        [0, 2],
      );
      for (const call of evidence) {
        assert.equal(call.topics[0].topicId, topic);
        assert.equal(call.topics[0].unknownBaseline, 0);
        assert.equal(call.topics[0].newVerifiedNow, 0);
      }
    }
  } finally {
    await social.db.query(
      'DELETE FROM x_search_citations WHERE call_id=ANY($1::uuid[])',
      [calls],
    );
    await social.db.query(
      'DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])',
      [calls],
    );
    await social.db.query('DELETE FROM topics WHERE id=$1', [topic]);
    await social.db.end();
  }
});

void test('scheduled search retries never reach HTTP again after a provider rejection', async () => {
  const social = new PostgresSocialRepository();
  const ledger = new PostgresXDiscoveryLedger(social.db);
  const runId = crypto.randomUUID();
  let calls = 0;
  try {
    const {
      rows: [day],
    } = await social.db.query<{ today: string }>(
      "SELECT to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD') AS today",
    );
    const search = {
      search: async () => {
        calls++;
        throw new XSearchError('rejected');
      },
    };
    const save = {
      save: async () => {
        throw new Error('Must not save');
      },
    };
    assert.equal(
      (
        await searchX(
          'fixture',
          runId,
          request,
          search,
          ledger,
          save,
          price,
          day.today,
        )
      ).state,
      'failed',
    );
    assert.equal(
      (
        await searchX(
          'fixture',
          runId,
          request,
          search,
          new PostgresXDiscoveryLedger(social.db),
          save,
          price,
          day.today,
        )
      ).state,
      'budget-blocked',
    );
    assert.equal(calls, 1);
    assert.equal((await ledger.status()).availableMicros, 400000);
  } finally {
    await social.db.query('DELETE FROM x_discovery_calls WHERE run_id=$1', [
      runId,
    ]);
    await social.db.end();
  }
});

void test('X search verification pins ten-post priority, exact retry boundary and topic eligibility', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const social = new PostgresSocialRepository();
  const client = await social.db.connect();
  const repository = new PostgresXSearchRepository(social.db);
  Object.defineProperty(repository, 'db', { value: client });
  const topic = crypto.randomUUID();
  const call = crypto.randomUUID();
  // Different lengths distinguish numeric-ID ordering from lexical ordering.
  const ids = [
    '9',
    '99',
    ...Array.from(
      { length: 12 },
      (_, i) => `21179800000000000${String(i).padStart(2, '0')}`,
    ),
  ];
  const ordered = [...ids].reverse();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL TIME ZONE 'America/Los_Angeles'");
    await client.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
       VALUES($1,'00000000-0000-4000-8000-000000000001','Verification fixture','Fixture','Fixture',100)`,
      [topic],
    );
    await client.query(
      `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros)
       VALUES($1,'offline-fixture','verification-bounds','pending',1)`,
      [call],
    );
    for (const id of ids)
      await client.query(
        `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url)
         VALUES($1,$2,$3,$4)`,
        [call, topic, id, `https://x.com/i/web/status/${id}`],
      );
    assert.deepEqual(
      await repository.verificationCandidates(call),
      ordered.slice(0, 10),
    );
    // now() is fixed for this transaction: equality must remain in cooldown.
    await client.query(
      `INSERT INTO x_embed_checks(external_id,checked_at,error)
       VALUES($1,now()-interval '1 day','Fixture unavailable')`,
      [ordered[0]],
    );
    assert.deepEqual(
      await repository.verificationCandidates(call),
      ordered.slice(1, 11),
    );
    await client.query(
      "UPDATE x_embed_checks SET checked_at=checked_at-interval '1 millisecond' WHERE external_id=$1",
      [ordered[0]],
    );
    assert.deepEqual(
      await repository.verificationCandidates(call),
      ordered.slice(0, 10),
    );
    await client.query(
      `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,metrics,embed_html)
       VALUES('x',$1,$2,'Fixture','https://x.com/fixture','{}','<p>Fixture</p>')`,
      [ordered[0], `https://x.com/i/web/status/${ordered[0]}`],
    );
    assert.deepEqual(
      await repository.verificationCandidates(call),
      ordered.slice(1, 11),
    );
    await client.query('UPDATE topics SET post_budget=0 WHERE id=$1', [topic]);
    assert.deepEqual(await repository.verificationCandidates(call), []);
    await client.query(
      'UPDATE topics SET post_budget=5,enabled=false WHERE id=$1',
      [topic],
    );
    assert.deepEqual(await repository.verificationCandidates(call), []);
    await client.query('UPDATE topics SET enabled=true WHERE id=$1', [topic]);
    assert.deepEqual(
      await repository.verificationCandidates(call),
      ordered.slice(1, 11),
    );
    await client.query('DELETE FROM social_posts WHERE external_id=$1', [
      ordered[0],
    ]);
    // Recent checks, including success-shaped null errors, exclude all candidates.
    await client.query(
      `INSERT INTO x_embed_checks(external_id,checked_at,error)
       SELECT unnest($1::text[]),now(),NULL
       ON CONFLICT(external_id) DO UPDATE SET checked_at=excluded.checked_at,error=NULL`,
      [ids],
    );
    assert.deepEqual(await repository.verificationCandidates(call), []);
    await client.query(
      "UPDATE x_embed_checks SET checked_at=now()-interval '1 day 1 millisecond' WHERE external_id=ANY($1::text[])",
      [ids],
    );
    // Exhausting longer IDs proves the shorter IDs retain numeric order too.
    await client.query(
      'DELETE FROM x_search_citations WHERE call_id=$1 AND external_id=ANY($2::text[])',
      [call, ids.slice(2)],
    );
    assert.deepEqual(await repository.verificationCandidates(call), [
      '99',
      '9',
    ]);
    await client.query('DELETE FROM topics WHERE id=$1', [topic]);
    assert.deepEqual(await repository.verificationCandidates(call), []);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await social.db.end();
  }
});
