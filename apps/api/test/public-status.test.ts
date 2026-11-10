import assert from 'node:assert/strict';
import test from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';

import { readPublicStatus } from '../src/public-read/status';
import { classifyPublicRoute } from '../src/public-route-policy';

const secret = 'private-stored-token';
const source = {
  id: 'hn',
  name: 'Hacker News',
  lastAttempt: null,
  lastSuccess: null,
  error: secret,
  lastItemCount: 1,
  storedItems: 3,
  items24h: 1,
  items7d: 2,
  active: true,
  enabled: true,
};
const queue = {
  name: 'digest-generation',
  available: true,
  workers: 1,
  paused: false,
  counts: { completed: 2, failed: 1, [secret]: 42 },
  nextRun: null,
  runs: [
    { id: secret, editionId: secret, skipped: secret, returnvalue: secret },
  ],
};
const fixture = {
  checkedAt: '2026-11-10T13:00:00.000Z',
  sources: [source],
  queues: [queue],
};

void test('prepared status excludes stored failures, job payloads and private accounting', async () => {
  for (const error of [
    null,
    '',
    secret,
    `https://user:${secret}@example.com`,
  ]) {
    const result = await readPublicStatus(async () => ({
      ...fixture,
      sources: [{ ...source, error, url: secret, future: secret }],
      llm: { token: secret },
      xDiscovery: { token: secret },
      developmentSpend: [{ token: secret }],
      future: secret,
    }));
    const { error: _error, ...safeSource } = source;
    assert.deepEqual(result, {
      checkedAt: fixture.checkedAt,
      sources: [{ ...safeSource, hasError: error !== null }],
      queues: [
        {
          name: queue.name,
          available: true,
          workers: 1,
          paused: false,
          counts: { completed: 2, failed: 1 },
          nextRun: null,
        },
      ],
    });
    assert.equal(JSON.stringify(result).includes(secret), false);
  }
  for (const method of ['GET', 'HEAD'])
    assert.equal(classifyPublicRoute(method, '/api/admin/status'), 'admin');
});

void test('prepared status fails closed without reflecting malformed data or dependency errors', async () => {
  const bad = [
    null,
    { ...fixture, checkedAt: secret },
    { ...fixture, sources: [{ ...source, storedItems: -1 }] },
    { ...fixture, sources: [{ ...source, error: { token: secret } }] },
    { ...fixture, queues: [{ ...queue, name: secret }] },
    { ...fixture, queues: [{ ...queue, counts: { failed: -1 } }] },
    { ...fixture, queues: [{ ...queue, workers: Infinity }] },
    { ...fixture, coverage: { token: secret } },
  ];
  for (const value of bad) {
    await assert.rejects(
      readPublicStatus(async () => value),
      (error: unknown) => {
        assert.ok(error instanceof ServiceUnavailableException);
        assert.equal(error.message, 'Status unavailable');
        assert.equal(
          JSON.stringify(error.getResponse()).includes(secret),
          false,
        );
        return true;
      },
    );
  }
  await assert.rejects(
    readPublicStatus(() => Promise.reject(new Error(secret))),
    { message: 'Status unavailable' },
  );
});
