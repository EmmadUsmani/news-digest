import assert from 'node:assert/strict';
import test from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';

import { readPublicSourceHealth } from '../src/public-read/source-health';
import { classifyPublicRoute } from '../src/public-route-policy';

const secret = 'private-historical-provider-token';
const row = {
  id: 'hn',
  name: 'Hacker News',
  lastAttempt: new Date('2026-11-09T07:00:00Z'),
  lastSuccess: '2026-11-09T06:00:00-01:00',
  lastItemCount: 3,
  storedItems: 42,
  error: null,
};

void test('public source health exposes counts and failure presence without stored errors or URLs', async () => {
  for (const error of [
    null,
    '',
    secret,
    `HTTP 500 https://user:${secret}@example.com/feed`,
  ]) {
    const result = await readPublicSourceHealth(async () => [
      {
        ...row,
        error,
        url: `https://example.com/${secret}?token=${secret}`,
        topicId: secret,
        futureColumn: { token: secret },
      },
    ]);
    assert.deepEqual(result, [
      {
        id: 'hn',
        name: 'Hacker News',
        lastAttempt: '2026-11-09T07:00:00.000Z',
        lastSuccess: '2026-11-09T07:00:00.000Z',
        lastItemCount: 3,
        storedItems: 42,
        hasError: error !== null,
      },
    ]);
    assert.equal(JSON.stringify(result).includes(secret), false);
  }
  assert.deepEqual(
    await readPublicSourceHealth(async () => [
      {
        ...row,
        lastAttempt: null,
        lastSuccess: null,
      },
    ]),
    [
      {
        id: 'hn',
        name: 'Hacker News',
        lastAttempt: null,
        lastSuccess: null,
        lastItemCount: 3,
        storedItems: 42,
        hasError: false,
      },
    ],
  );
  assert.deepEqual(await readPublicSourceHealth(async () => []), []);
  for (const method of ['GET', 'HEAD'])
    assert.equal(
      classifyPublicRoute(method, '/api/admin/content/sources'),
      'admin',
    );
});

void test('invalid source health fails the whole response with a generic 503', async () => {
  for (const invalid of [
    null,
    {},
    [{ ...row, error: { token: secret } }],
    ...[
      { lastAttempt: 'yesterday' },
      { lastSuccess: new Date(NaN) },
      { lastItemCount: -1 },
      { storedItems: 1.5 },
      { storedItems: Number.MAX_SAFE_INTEGER + 1 },
      { id: '' },
      { error: undefined },
    ].map((change) => [row, { ...row, ...change }]),
  ]) {
    await assert.rejects(
      readPublicSourceHealth(async () => invalid),
      checkError,
    );
  }
  await assert.rejects(
    readPublicSourceHealth(async () => {
      throw new Error(secret);
    }),
    checkError,
  );
});

function checkError(error: unknown) {
  assert.ok(error instanceof ServiceUnavailableException);
  assert.deepEqual(error.getResponse(), {
    message: 'Source health unavailable',
    error: 'Service Unavailable',
    statusCode: 503,
  });
  return true;
}
