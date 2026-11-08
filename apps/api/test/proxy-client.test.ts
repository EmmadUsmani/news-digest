import assert from 'node:assert/strict';
import type { IncomingMessage } from 'node:http';
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
