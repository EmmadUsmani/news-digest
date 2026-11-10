import assert from 'node:assert/strict';
import { test } from 'node:test';

import { customFeedSchema } from '@digest/contracts';

import { publicAddress, publicFeedUrl } from '../src/libs/ports/public-url';
void test('feed URLs restrict credentials, protocols, ports and nonpublic literal addresses', () => {
  for (const address of [
    '127.0.0.1',
    '10.2.3.4',
    '169.254.169.254',
    '100.100.100.200',
    '192.168.1.1',
    '172.31.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '::1',
    '::ffff:127.0.0.1',
    'fc00::1',
    'fe80::1',
    '2001:db8::1',
    '2002:7f00:1::',
  ])
    assert.equal(publicAddress(address), false, address);
  for (const address of ['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111'])
    assert.equal(publicAddress(address), true, address);
  for (const url of [
    'http://example.org/feed',
    'https://user:pass@example.org/feed',
    'https://example.org:8000/feed',
    'https://localhost/feed',
    'https://news.local/feed',
    'https://127.1/feed',
    'https://2130706433/feed',
    'https://[::1]/feed',
    'https://169.254.169.254/feed',
  ])
    assert.throws(() => publicFeedUrl(url), undefined, url);
  assert.equal(
    publicFeedUrl('https://www.publisher.org/rss#fragment'),
    'https://www.publisher.org/rss',
  );
  assert.equal(
    customFeedSchema.safeParse({
      name: ' ',
      url: 'https://www.publisher.org/feed',
    }).success,
    false,
  );
  assert.equal(
    customFeedSchema.safeParse({
      name: 'Feed',
      url: 'https://www.publisher.org/feed',
      extra: true,
    }).success,
    false,
  );
});

void test('shared HTTP client validates redirect targets and pins DNS to public addresses without live calls', async () => {
  const https = await import('node:https');
  const dns = await import('node:dns');
  const { mock } = await import('node:test');
  const { EventEmitter } = await import('node:events');
  const { Readable } = await import('node:stream');
  const { SharedHttpClient } = await import('../src/libs/ports/http.client');
  let calls = 0;
  const requested: string[] = [];
  type Lookup = NonNullable<import('node:https').RequestOptions['lookup']>;
  let socketLookup: Lookup | undefined;
  const requestMock = mock.method(
    https.default,
    'request',
    (
      url: string,
      options: import('node:https').RequestOptions,
      callback: (response: unknown) => void,
    ) => {
      calls++;
      requested.push(url);
      socketLookup = options.lookup;
      const req = new EventEmitter();
      Object.assign(req, {
        end: () =>
          queueMicrotask(() =>
            callback(
              Object.assign(Readable.from([]), {
                statusCode: 302,
                headers: { location: 'https://127.0.0.1/private' },
              }),
            ),
          ),
      });
      return req;
    },
  );
  try {
    await assert.rejects(
      new SharedHttpClient().get('https://publisher.org/feed'),
      /public HTTPS/,
    );
    assert.equal(calls, 1);
    assert.deepEqual(requested, ['https://publisher.org/feed']);
    assert.ok(socketLookup);
    const dnsMock = mock.method(
      dns.default,
      'lookup',
      (
        _hostname: string,
        _options: unknown,
        callback: (
          error: Error | null,
          addresses: { address: string; family: number }[],
        ) => void,
      ) =>
        callback(null, [
          { address: '8.8.8.8', family: 4 },
          { address: '10.0.0.1', family: 4 },
        ]),
    );
    try {
      const resolve = () =>
        new Promise((accept, reject) =>
          socketLookup!('publisher.org', {}, (error, address, family) =>
            error ? reject(error) : accept({ address, family }),
          ),
        );
      await assert.rejects(resolve(), /not public/);
      dnsMock.mock.mockImplementation(
        (
          _hostname: string,
          _options: unknown,
          callback: (
            error: Error | null,
            addresses: { address: string; family: number }[],
          ) => void,
        ) => callback(null, [{ address: '8.8.8.8', family: 4 }]),
      );
      assert.deepEqual(await resolve(), { address: '8.8.8.8', family: 4 });
    } finally {
      dnsMock.mock.restore();
    }
  } finally {
    requestMock.mock.restore();
  }
});

void test('shared HTTP client decodes compressed feeds, caches text and bounds expanded size', async () => {
  const https = await import('node:https');
  const { mock } = await import('node:test');
  const { EventEmitter } = await import('node:events');
  const { Readable } = await import('node:stream');
  const { gzipSync, deflateSync, brotliCompressSync } =
    await import('node:zlib');
  const { SharedHttpClient } = await import('../src/libs/ports/http.client');
  const xml = '<rss><channel><title>AI news</title></channel></rss>';
  let encoding = 'gzip';
  let payload = gzipSync(xml);
  let calls = 0;
  const requestMock = mock.method(
    https.default,
    'request',
    (
      _url: string,
      _options: unknown,
      callback: (response: unknown) => void,
    ) => {
      calls++;
      const req = new EventEmitter();
      Object.assign(req, {
        end: () =>
          queueMicrotask(() =>
            callback(
              Object.assign(Readable.from([payload]), {
                statusCode: 200,
                headers: { 'content-encoding': encoding },
              }),
            ),
          ),
      });
      return req;
    },
  );
  try {
    for (const [name, compress] of [
      ['gzip', gzipSync],
      ['deflate', deflateSync],
      ['br', brotliCompressSync],
    ] as const) {
      encoding = name;
      payload = compress(xml);
      const client = new SharedHttpClient();
      const before = calls;
      assert.equal(await client.get('https://publisher.org/feed'), xml);
      assert.equal(await client.get('https://publisher.org/feed'), xml);
      assert.equal(calls, before + 1);
    }
    // PC Gamer's real RSS grew just beyond the old 2 MB boundary. Both
    // identity and compressed feeds may use the new bound, never exceed it.
    const largeFeed = `<rss><channel><description>${'x'.repeat(2_100_000)}</description></channel></rss>`;
    for (const [name, body] of [
      ['identity', Buffer.from(largeFeed)],
      ['gzip', gzipSync(largeFeed)],
    ] as const) {
      encoding = name;
      payload = body;
      assert.equal(
        await new SharedHttpClient().get('https://publisher.org/feed'),
        largeFeed,
      );
    }
    encoding = 'identity';
    payload = Buffer.from('x'.repeat(3_000_001));
    await assert.rejects(
      new SharedHttpClient().get('https://publisher.org/feed'),
      /Response exceeds 3 MB/,
    );
    encoding = 'gzip';
    payload = gzipSync('x'.repeat(3_000_001));
    await assert.rejects(
      new SharedHttpClient().get('https://publisher.org/feed'),
    );
    payload = Buffer.from('broken gzip');
    await assert.rejects(
      new SharedHttpClient().get('https://publisher.org/feed'),
    );
    encoding = 'unknown';
    await assert.rejects(
      new SharedHttpClient().get('https://publisher.org/feed'),
      /Unsupported response encoding/,
    );
  } finally {
    requestMock.mock.restore();
  }
});
