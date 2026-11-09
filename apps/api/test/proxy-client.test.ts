import assert from 'node:assert/strict';
import {
  createServer,
  type IncomingMessage,
  request as httpRequest,
} from 'node:http';
import { test } from 'node:test';

import { proxyClient } from '../src/modules/accounts/adapters/proxy-client';

function request(peer: string, forwarded?: string, duplicate = false) {
  return {
    socket: { remoteAddress: peer },
    headers: { 'x-forwarded-for': forwarded },
    rawHeaders:
      forwarded === undefined
        ? []
        : duplicate
          ? ['X-Forwarded-For', forwarded, 'x-forwarded-for', forwarded]
          : ['X-Forwarded-For', forwarded],
  } as IncomingMessage;
}

void test('proxy admission trusts only configured peers and the appended client', () => {
  const client = proxyClient(['127.0.0.1', '2001:db8::1']);
  assert.equal(client(request('127.0.0.1', 'forged, 192.0.2.4')), '192.0.2.4');
  assert.equal(
    client(request('127.0.0.1', '192.0.2.5, 192.0.2.4')),
    '192.0.2.4',
  );
  assert.equal(client(request('192.0.2.1', '192.0.2.4')), null);
  assert.equal(proxyClient([])(request('127.0.0.1', '192.0.2.4')), null);
  assert.throws(() => proxyClient(['localhost']));
  assert.equal(client(request('::ffff:127.0.0.1', '192.0.2.4')), '192.0.2.4');
  assert.equal(
    client(request('2001:0db8:0:0:0:0:0:1', '2001:0db8::2')),
    '2001:db8::2',
  );
  assert.equal(client(request('127.0.0.1', '::ffff:c000:204')), '192.0.2.4');
  assert.equal(client(request('127.0.0.1', '::ffff:192.0.2.4')), '192.0.2.4');
});

void test('proxy admission refuses missing, ambiguous and malformed final addresses', () => {
  const client = proxyClient(['127.0.0.1']);
  for (const value of [
    undefined,
    '',
    '192.0.2.4,',
    'unknown',
    '192.0.2.4:123',
    '[::1]',
    'fe80::1%eth0',
    'a'.repeat(2049),
  ])
    assert.equal(client(request('127.0.0.1', value)), null, value);
  assert.equal(client(request('127.0.0.1', '192.0.2.4', true)), null);
});

void test('proxy admission rejects duplicate wire headers and ignores forged prefixes over real HTTP', async () => {
  const trusted = proxyClient(['127.0.0.1']);
  const untrusted = proxyClient(['192.0.2.99']);
  const server = createServer((incoming, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify({
        trusted: trusted(incoming),
        untrusted: untrusted(incoming),
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const bound = server.address();
  assert.ok(bound && typeof bound !== 'string');
  const send = (headers: string[]) =>
    new Promise<unknown>((resolve, reject) => {
      const outgoing = httpRequest(
        {
          host: '127.0.0.1',
          port: bound.port,
          path: '/',
          headers: ['Host', 'localhost', ...headers],
        },
        (response) => {
          let body = '';
          response.setEncoding('utf8');
          response.on('data', (chunk: string) => {
            body += chunk;
          });
          response.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (error) {
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          });
          response.on('error', reject);
        },
      );
      outgoing.on('error', reject);
      outgoing.end();
    });
  try {
    for (const prefix of ['forged', '192.0.2.90', '::ffff:192.0.2.90']) {
      assert.deepEqual(
        await send(['X-Forwarded-For', `${prefix}, 192.0.2.4`]),
        {
          trusted: '192.0.2.4',
          untrusted: null,
        },
      );
    }
    for (const headers of [
      [],
      ['X-Forwarded-For', '192.0.2.4', 'x-forwarded-for', '192.0.2.5'],
      ['X-Forwarded-For', '192.0.2.4, unknown'],
      ['X-Forwarded-For', '192.0.2.4,'],
    ]) {
      assert.deepEqual(await send(headers), { trusted: null, untrusted: null });
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
