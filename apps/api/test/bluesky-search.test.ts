import assert from 'node:assert/strict';
import test from 'node:test';

import { BlueskySearch } from '../src/modules/social/adapters/bluesky-search';

const since = new Date('2026-11-02T00:00:00Z');
const until = new Date('2026-11-03T00:00:00Z');
const session = {
  accessJwt: 'access',
  refreshJwt: 'refresh',
  did: 'did:plc:author',
  didDoc: {
    service: [
      {
        id: '#atproto_pds',
        serviceEndpoint: 'https://test.us-east.host.bsky.network',
      },
    ],
  },
};
const post = {
  uri: 'at://did:plc:author/app.bsky.feed.post/abc123',
  author: { did: 'did:plc:author', handle: 'writer.bsky.social' },
  record: { text: 'A new game demo', createdAt: '2026-11-02T12:00:00Z' },
  embed: {
    $type: 'app.bsky.embed.images#view',
    images: [
      {
        thumb: 'https://cdn.bsky.app/t.jpg',
        fullsize: 'https://cdn.bsky.app/f.jpg',
        alt: 'Demo',
      },
    ],
  },
  likeCount: 42,
  repostCount: 8,
  replyCount: 3,
};
function fixture(
  responses: {
    status?: number;
    data?: unknown;
    headers?: Record<string, string>;
  }[],
) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const waits: number[] = [];
  const client = new BlueskySearch(
    { handle: 'owner', password: 'secret' },
    async (url, init) => {
      calls.push({
        url:
          typeof url === 'string'
            ? url
            : url instanceof URL
              ? url.href
              : url.url,
        init,
      });
      const response = responses.shift();
      assert.ok(response, 'unexpected HTTP request');
      return new Response(JSON.stringify(response.data ?? {}), {
        status: response.status ?? 200,
        headers: response.headers,
      });
    },
    () => until.getTime(),
    async (ms) => {
      waits.push(ms);
    },
  );
  return { client, calls, waits };
}
void test('Bluesky open search uses account PDS, bounds pagination, filters windows and reuses session', async () => {
  const { client, calls } = fixture([
    { data: session },
    {
      data: {
        posts: [
          post,
          { ...post, uri: 'invalid' },
          {
            ...post,
            record: { ...post.record, createdAt: until.toISOString() },
          },
        ],
        cursor: 'next',
      },
    },
    { data: { posts: [post], cursor: 'third' } },
    { data: { posts: [] } },
  ]);
  const posts = await client.search('game demo', since, until);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].media?.[0].type, 'image');
  assert.deepEqual(posts[0].metrics, { likes: 42, reposts: 8, replies: 3 });
  assert.equal(
    posts[0].url,
    'https://bsky.app/profile/did%3Aplc%3Aauthor/post/abc123',
  );
  assert.equal(
    new URL(calls[1].url).hostname,
    'test.us-east.host.bsky.network',
  );
  assert.equal(new URL(calls[1].url).searchParams.get('sort'), 'top');
  assert.equal(new URL(calls[2].url).searchParams.get('cursor'), 'next');
  await client.search('NBA', since, until);
  assert.equal(
    calls.filter((call) => call.url.includes('createSession')).length,
    1,
  );
});
void test('Bluesky refreshes expired access once and retries with new token', async () => {
  const { client, calls } = fixture([
    { data: session },
    { status: 401 },
    { data: { ...session, accessJwt: 'new-access' } },
    { data: { posts: [post] } },
  ]);
  assert.equal((await client.search('games', since, until)).length, 1);
  assert.equal(
    (calls[2].init?.headers as Record<string, string>).Authorization,
    'Bearer refresh',
  );
  assert.equal(
    (calls[3].init?.headers as Record<string, string>).Authorization,
    'Bearer new-access',
  );
});
void test('Bluesky honors rate-limit backoff on next search without retry storms', async () => {
  const { client, calls, waits } = fixture([
    { data: session },
    { status: 429, headers: { 'retry-after': '120' } },
    { data: { posts: [] } },
  ]);
  await assert.rejects(client.search('games', since, until), /HTTP 429/);
  assert.equal(calls.length, 2);
  await client.search('games', since, until);
  assert.equal(waits.at(-1), 120000);
});
void test('Bluesky rejects credential redirection and invalid windows before search', async () => {
  const { client, calls } = fixture([
    {
      data: {
        ...session,
        didDoc: {
          service: [
            { id: '#atproto_pds', serviceEndpoint: 'https://attacker.example' },
          ],
        },
      },
    },
  ]);
  await assert.rejects(client.search('games', until, since), /Invalid/);
  assert.equal(calls.length, 0);
  await assert.rejects(client.search('games', since, until), /Unsupported/);
  assert.equal(calls.length, 1);
});
void test('Bluesky never retries a repeatedly expired token or leaks authentication response bodies', async () => {
  const expired = fixture([
    { data: session },
    { status: 401 },
    { data: session },
    { status: 401 },
  ]);
  await assert.rejects(
    expired.client.search('games', since, until),
    /^Error: Bluesky search HTTP 401$/,
  );
  assert.equal(expired.calls.length, 4);
  const denied = fixture([
    { status: 403, data: { message: 'secret access refresh' } },
  ]);
  await assert.rejects(
    denied.client.search('games', since, until),
    /^Error: Bluesky authentication HTTP 403$/,
  );
});
void test('Bluesky rejects oversized responses and mismatched post authors', async () => {
  const oversized = fixture([
    { data: session },
    { data: { padding: 'x'.repeat(2_000_000) } },
  ]);
  await assert.rejects(
    oversized.client.search('games', since, until),
    /exceeds 2 MB/,
  );
  const mismatch = fixture([
    { data: session },
    {
      data: {
        posts: [{ ...post, author: { ...post.author, did: 'did:plc:other' } }],
      },
    },
  ]);
  assert.deepEqual(await mismatch.client.search('games', since, until), []);
});

void test('Bluesky logs bounded attempt metadata without credentials, queries or response content', async () => {
  const { createLogger, logJob } =
    await import('../src/libs/observability/logging');
  const lines: string[] = [];
  const log = createLogger(
    'test',
    {
      write: (line: string) => {
        lines.push(line);
      },
    },
    [],
  );
  const responses: (Response | Error)[] = [
    new Response(JSON.stringify(session)),
    new Response('{}', { status: 401 }),
    new Response(JSON.stringify(session)),
    new Response(JSON.stringify({ posts: [post] })),
    new Response('private-provider-text', { status: 429 }),
    new Response('private-invalid-json'),
    new Error('private-transport-error'),
    new Response(
      new ReadableStream({
        start(controller) {
          controller.error(new Error('private-stream-error'));
        },
      }),
    ),
  ];
  const client = new BlueskySearch(
    { handle: 'private-owner', password: 'private-password' },
    async () => {
      const response = responses.shift();
      assert.ok(response);
      if (response instanceof Error) throw response;
      return response;
    },
    () => until.getTime(),
    async () => {},
    log,
  );
  await logJob(
    'social-collection',
    async () => {
      assert.equal(
        (await client.search('private-query', since, until)).length,
        1,
      );
      for (let i = 0; i < 4; i++)
        await assert.rejects(client.search('private-query', since, until));
      await assert.rejects(client.search('', since, until));
    },
    log,
  )({
    id: 'fixture-job',
    name: 'fixture',
    attemptsMade: 0,
  } as import('bullmq').Job);
  const attempts = lines
    .map((line) => JSON.parse(line))
    .filter((line) => line.event === 'external.call');
  assert.deepEqual(
    attempts.map(({ operation, status, outcome }) => ({
      operation,
      status,
      outcome,
    })),
    [
      { operation: 'login', status: 200, outcome: 'success' },
      { operation: 'search', status: 401, outcome: 'failure' },
      { operation: 'refresh', status: 200, outcome: 'success' },
      { operation: 'search', status: 200, outcome: 'success' },
      { operation: 'search', status: 429, outcome: 'failure' },
      { operation: 'search', status: 200, outcome: 'failure' },
      { operation: 'search', status: undefined, outcome: 'failure' },
      { operation: 'search', status: 200, outcome: 'failure' },
    ],
  );
  for (const entry of attempts) {
    assert.equal(entry.target, 'bluesky');
    assert.equal(entry.queue, 'social-collection');
    assert.equal(entry.jobId, 'fixture-job');
    assert.ok(entry.durationMs >= 0);
  }
  assert.doesNotMatch(
    lines.join(''),
    /private-|accessJwt|refreshJwt|writer.bsky|game demo|https:|Bearer/,
  );
});

void test('Bluesky refreshes HTTP 400 ExpiredToken between pages without losing the cursor', async () => {
  const { client, calls } = fixture([
    { data: session },
    { data: { posts: [post], cursor: 'page-two' } },
    {
      status: 400,
      data: { error: 'ExpiredToken', message: 'private-token-detail' },
    },
    { data: { ...session, accessJwt: 'renewed' } },
    { data: { posts: [post] } },
  ]);
  assert.equal((await client.search('games', since, until)).length, 1);
  assert.equal(calls.length, 5);
  assert.equal(new URL(calls[4].url).searchParams.get('cursor'), 'page-two');
  assert.equal(
    (calls[4].init?.headers as Record<string, string>).Authorization,
    'Bearer renewed',
  );
});

void test('Bluesky bounds HTTP 400 recovery to one explicit expiry and ignores arbitrary error bodies', async () => {
  for (const data of [
    { error: 'InvalidRequest' },
    { message: 'ExpiredToken' },
    { error: 'ExpiredToken', padding: 'x'.repeat(4096) },
  ]) {
    const { client, calls } = fixture([
      { data: session },
      { status: 400, data },
    ]);
    await assert.rejects(
      client.search('games', since, until),
      /^Error: Bluesky search HTTP 400$/,
    );
    assert.equal(calls.length, 2);
  }
  const { client, calls } = fixture([
    { data: session },
    { status: 400, data: { error: 'ExpiredToken' } },
    { data: session },
    { status: 400, data: { error: 'ExpiredToken' } },
  ]);
  await assert.rejects(
    client.search('games', since, until),
    /^Error: Bluesky search HTTP 400$/,
  );
  assert.equal(calls.length, 4);
});
