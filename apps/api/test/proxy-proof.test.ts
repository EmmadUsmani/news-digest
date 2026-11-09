import assert from 'node:assert/strict';
import { request } from 'node:http';
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

void test('proxy diagnostic records five steps without retaining values', async () => {
  await run(async ({ base, send, receipts }) => {
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('cache-control'), 'no-store');
    assert.match(
      page.headers.get('content-security-policy') ?? '',
      /frame-ancestors 'none'/,
    );
    assert.equal((await send(1)).status, 404);
    for (const [index, forwarded] of [
      '192.0.2.55',
      '192.0.2.123, 192.0.2.55',
      '198.51.100.9, 203.0.113.7, 192.0.2.55',
      'forged, 192.0.2.55',
    ].entries())
      assert.equal((await send(index, forwarded)).status, 200);
    const response = await fetch(`${base}/4`, {
      headers: {
        'X-Forwarded-For': '192.0.2.55',
        'X-ExeDev-Email': 'owner@example.invalid',
        'X-ExeDev-UserID': 'secret-id',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-Host': 'private-host',
      },
    });
    const receipt = await response.json();
    assert.equal(receipt.status, 'observed');
    assert.equal(receipt.steps.length, 5);
    assert.deepEqual(receipt.steps[4], {
      step: 4,
      forwardedFields: 1,
      forwardedEntries: 1,
      finalEntryIsIp: true,
      appendedEntries: [{ category: 'public', matchesBaseline: null }],
      immediatePeer: 'loopback',
      forwardingValid: true,
      email: 'replaced',
      presentHeaders: [
        'x-exedev-email',
        'x-exedev-userid',
        'x-forwarded-host',
        'x-forwarded-proto',
      ],
    });
    assert.equal(receipts.length, 5);
    assert.doesNotMatch(
      JSON.stringify(receipts),
      /192\.0|127\.0|owner@|secret-id|private-host/,
    );
    assert.equal((await send(5)).status, 404);
  });
});

void test('failed baseline shapes remain distinguishable and allow all later steps', async () => {
  for (const [forwarded, fields, entries, finalIp] of [
    [undefined, 0, 0, false],
    ['192.0.2.1, 192.0.2.55', 1, 2, true],
    ['not-an-ip', 1, 1, false],
    [['192.0.2.1', '192.0.2.55'], 2, 2, true],
  ] as const) {
    await run(async ({ base, send }) => {
      const first = await new Promise<string>((resolve, reject) => {
        const req = request(
          `${base}/0`,
          {
            headers:
              forwarded === undefined
                ? {}
                : {
                    'X-Forwarded-For':
                      typeof forwarded === 'string'
                        ? forwarded
                        : [...forwarded],
                  },
          },
          (res) => {
            let body = '';
            res.on('data', (data) => {
              body += data;
            });
            res.on('end', () => resolve(body));
          },
        );
        req.on('error', reject);
        req.end();
      });
      const shape = JSON.parse(first).steps[0];
      assert.equal(shape.forwardedFields, fields);
      assert.equal(shape.forwardedEntries, entries);
      assert.equal(shape.finalEntryIsIp, finalIp);
      assert.equal(shape.forwardingValid, false);
      for (let index = 1; index < 4; index++)
        assert.equal((await send(index, '192.0.2.55')).status, 200);
      const last = await send(4, '192.0.2.55');
      const receipt = await last.json();
      assert.equal(receipt.status, 'failed');
      assert.equal(receipt.steps.length, 5);
      assert.equal(receipt.steps[4].email, 'absent');
    });
  }
});

void test('forged email is refused even when forwarding matches', async () => {
  for (const email of [
    'forged@example.invalid',
    'other@example.invalid, forged@example.invalid',
  ]) {
    await run(async ({ base, send }) => {
      await send(0, '192.0.2.55');
      await send(1, '192.0.2.123, 192.0.2.55');
      await send(2, '198.51.100.9, 203.0.113.7, 192.0.2.55');
      await send(3, 'forged, 192.0.2.55');
      const response = await fetch(`${base}/4`, {
        headers: {
          'X-Forwarded-For': '192.0.2.55',
          'X-ExeDev-Email': email,
        },
      });
      const receipt = await response.json();
      assert.equal(receipt.status, 'failed');
      assert.equal(receipt.steps[4].email, 'forged');
      assert.doesNotMatch(JSON.stringify(receipt), /example\.invalid/);
    });
  }
});

void test('overwritten or changed forwarding fails while email step still runs', async () => {
  for (const forwarded of [
    undefined,
    '192.0.2.55',
    '192.0.2.123, 192.0.2.56',
  ]) {
    await run(async ({ send }) => {
      await send(0, '192.0.2.55');
      const response = await send(1, forwarded);
      assert.equal((await response.json()).steps[1].forwardingValid, false);
      await send(2, '198.51.100.9, 203.0.113.7, 192.0.2.55');
      await send(3, 'forged, 192.0.2.55');
      assert.equal(
        (await (await send(4, '192.0.2.55')).json()).status,
        'failed',
      );
    });
  }
});

void test('two appended positions compare independently despite legacy baseline failure', async () => {
  for (const hop of [
    '127.0.0.2',
    '10.0.0.2',
    '::ffff:192.168.0.2',
    'fd00::2',
    'fe80::2',
  ]) {
    await run(async ({ send, receipts }) => {
      const tail = `8.8.8.8, ${hop}`;
      for (const [step, prefix] of [
        '',
        '192.0.2.123, ',
        '198.51.100.9, 203.0.113.7, ',
        'forged, ',
        '',
      ].entries()) {
        const receipt = await (await send(step, `${prefix}${tail}`)).json();
        assert.deepEqual(receipt.steps[step].appendedEntries, [
          { category: 'public', matchesBaseline: true },
          {
            category: hop.startsWith('127.') ? 'loopback' : 'private',
            matchesBaseline: true,
          },
        ]);
      }
      assert.doesNotMatch(
        JSON.stringify(receipts),
        /8\.8\.8\.8|127\.0|10\.0|192\.168|fd00|fe80/,
      );
    });
  }
});

void test('changed, reordered, invalid or missing appended entries cannot imply stability', async () => {
  await run(async ({ send }) => {
    await send(0, '8.8.8.8, 10.0.0.2');
    for (const [index, tail, expected] of [
      [1, '8.8.4.4, 10.0.0.2', [false, true]],
      [2, '10.0.0.2, 8.8.8.8', [false, false]],
      [3, 'invalid, 10.0.0.2', [false, true]],
      [4, '10.0.0.2', [null]],
    ] as const) {
      const prefix =
        index === 4
          ? ''
          : index === 2
            ? '198.51.100.9, 203.0.113.7, '
            : 'forged, ';
      const receipt = await (await send(index, `${prefix}${tail}`)).json();
      assert.deepEqual(
        receipt.steps[index].appendedEntries.map(
          (entry: { matchesBaseline: boolean | null }) => entry.matchesBaseline,
        ),
        expected,
      );
      if (index === 3)
        assert.equal(
          receipt.steps[index].appendedEntries[0].category,
          'unknown',
        );
    }
  });
});
