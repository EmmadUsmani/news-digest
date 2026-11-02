import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  DirectXSearch,
  xSearchBody,
} from '../src/modules/social/adapters/x-search';
import { searchX } from '../src/modules/social/application/search-x';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';
import { PostgresXDiscoveryLedger } from '../src/modules/social/database/x-discovery.ledger';
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
    reserve: async (_model: string, _run: string, amount: number) => {
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
