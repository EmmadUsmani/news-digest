import assert from 'node:assert/strict';
import { test } from 'node:test';

import { proxyProof } from '../../../scripts/lib/proxy-proof';

async function run(
  check: (input: {
    base: string;
    receipts: unknown[];
    send: (step: number, forwarded?: string) => Promise<Response>;
  }) => Promise<void>,
) {
  const receipts: unknown[] = [];
  const { server, path } = proxyProof((receipt) => receipts.push(receipt));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const bound = server.address();
  assert.ok(bound && typeof bound !== 'string');
  const base = `http://127.0.0.1:${bound.port}${path}`;
  try {
    await check({
      base,
      receipts,
      send: (step, forwarded) =>
        fetch(`${base}/${step}`, {
          headers:
            forwarded === undefined ? {} : { 'X-Forwarded-For': forwarded },
        }),
    });
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

void test('proxy diagnostic proves preserved prefixes without recording client addresses', async () => {
  await run(async ({ base, send, receipts }) => {
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('cache-control'), 'no-store');
    assert.match(
      page.headers.get('content-security-policy') ?? '',
      /frame-ancestors 'none'/,
    );
    assert.equal((await send(1, '192.0.2.123, 192.0.2.55')).status, 404);
    for (const [index, forwarded] of [
      '192.0.2.55',
      '192.0.2.123, 192.0.2.55',
      '198.51.100.9, 203.0.113.7, 192.0.2.55',
      'forged, 192.0.2.55',
    ].entries())
      assert.equal((await send(index, forwarded)).status, 204);
    assert.deepEqual(receipts, [
      {
        status: 'observed',
        immediatePeer: '127.0.0.1',
        forgedPrefixes: 3,
        finalClientUnchanged: true,
        trustConfigurationChanged: false,
      },
    ]);
    assert.ok(!JSON.stringify(receipts).includes('192.0.2.55'));
    assert.equal((await send(4, '192.0.2.55')).status, 404);
  });
});

void test('proxy diagnostic fails closed for absent, overwritten or changed forwarding', async () => {
  for (const forwarded of [
    undefined,
    '192.0.2.55',
    '192.0.2.123, 192.0.2.56',
  ]) {
    await run(async ({ send, receipts }) => {
      assert.equal((await send(0, '192.0.2.55')).status, 204);
      assert.equal((await send(1, forwarded)).status, 409);
      assert.deepEqual(receipts, [{ status: 'failed', step: 1 }]);
      assert.equal((await send(1, '192.0.2.123, 192.0.2.55')).status, 404);
    });
  }
  await run(async ({ send, receipts }) => {
    assert.equal((await send(0)).status, 409);
    assert.deepEqual(receipts, [{ status: 'failed', step: 0 }]);
  });
});
