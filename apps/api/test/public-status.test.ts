import assert from 'node:assert/strict';
import test from 'node:test';

import { publicOperationsStatusSchema } from '@digest/contracts';
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
    assert.equal(
      classifyPublicRoute(method, '/api/admin/status'),
      'public-read',
    );
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

void test('public budgets retain only bounded production totals, never private ledger details', async () => {
  const llm = {
    todayMicros: 120,
    monthMicros: 900,
    todayReservedMicros: 10,
    monthReservedMicros: 10,
    dailyCapMicros: 500,
    monthlyCapMicros: 15000,
    availableMicros: 370,
  };
  const xDiscovery = {
    todayMicros: 100,
    monthMicros: 800,
    reservedMicros: 5,
    dailyMicros: 400,
    monthlyMicros: 12000,
    availableMicros: 295,
    blocked: false,
  };
  const privateFields = {
    recentCalls: [{ id: secret, model: secret, purpose: secret }],
    models: [{ model: secret }],
    purposes: [{ purpose: secret }],
    lastError: { code: secret },
    blockedUntil: secret,
    scheduledReserve: { lastOutcome: { outcome: { reason: secret } } },
    modelAllocation: { model: secret },
    future: secret,
  };
  const result = await readPublicStatus(async () => ({
    ...fixture,
    llm: { ...llm, ...privateFields },
    xDiscovery: { ...xDiscovery, ...privateFields },
    developmentSpend: [{ provider: secret, chargedMicros: 123 }],
  }));
  assert.deepEqual(result.llm, llm);
  assert.deepEqual(result.xDiscovery, xDiscovery);
  assert.equal(JSON.stringify(result).includes(secret), false);
  for (const [key, budget] of Object.entries({ llm, xDiscovery })) {
    for (const field of Object.keys(budget)) {
      const invalid =
        field === 'blocked'
          ? [secret, null]
          : [-1, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1, secret, null];
      for (const value of invalid) {
        await assert.rejects(
          readPublicStatus(async () => ({
            ...fixture,
            [key]: { ...budget, [field]: value },
          })),
          { message: 'Status unavailable' },
        );
      }
    }
    await assert.rejects(
      readPublicStatus(async () => ({ ...fixture, [key]: {} })),
      { message: 'Status unavailable' },
    );
  }
});

void test('public wire contract round-trips projection and rejects private source shape', async () => {
  const projected = await readPublicStatus(async () => fixture);
  assert.deepEqual(publicOperationsStatusSchema.parse(projected), projected);
  assert.equal(publicOperationsStatusSchema.safeParse(fixture).success, false);
  const parsed = publicOperationsStatusSchema.parse({
    ...projected,
    developmentSpend: [{ token: secret }],
    sources: projected.sources.map((row) => ({
      ...row,
      error: secret,
      url: secret,
    })),
    queues: projected.queues.map((row) => ({ ...row, runs: [{ id: secret }] })),
  });
  assert.deepEqual(parsed, projected);
  assert.equal(JSON.stringify(parsed).includes(secret), false);
  for (const value of [
    { ...projected, sources: [{ ...projected.sources[0], hasError: secret }] },
    { ...projected, queues: [{ ...projected.queues[0], workers: -1 }] },
    { ...projected, llm: {} },
    { ...projected, xDiscovery: {} },
  ])
    assert.equal(publicOperationsStatusSchema.safeParse(value).success, false);
});
