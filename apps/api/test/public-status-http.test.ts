import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { NestFactory } from '@nestjs/core';

import { PublicStatusModule } from '../src/public-read/status.module';
import { classifyPublicRoute } from '../src/public-route-policy';

const env = {
  PUBLIC_MODE: '1',
  SYSTEM_OWNERSHIP: '1',
  READER_PUBLISHED_ONLY: '1',
};

void test('prepared status HTTP transport projects GET/HEAD and conceals failures', async () => {
  const secret = 'private-historical-secret';
  let value: unknown = {
    checkedAt: '2026-11-10T13:00:00.000Z',
    sources: [],
    queues: [],
    developmentSpend: secret,
  };
  let failure = false;
  const app = await NestFactory.create(
    PublicStatusModule.prepare(env, () => ({
      async read() {
        if (failure) throw new Error(secret);
        return value;
      },
    })),
    { logger: false },
  );
  try {
    await app.listen(0, '127.0.0.1');
    const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/api/admin/status`;
    const response = await fetch(base);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), {
      checkedAt: '2026-11-10T13:00:00.000Z',
      sources: [],
      queues: [],
    });
    const llm = {
      todayMicros: 1,
      monthMicros: 2,
      todayReservedMicros: 0,
      monthReservedMicros: 0,
      dailyCapMicros: 500,
      monthlyCapMicros: 15000,
      availableMicros: 499,
    };
    value = {
      ...(value as object),
      llm: { ...llm, recentCalls: [{ purpose: secret }], lastError: secret },
    };
    const budgetResponse = await fetch(base);
    assert.equal(budgetResponse.status, 200);
    const budgetBody = await budgetResponse.json();
    assert.deepEqual(budgetBody.llm, llm);
    assert.equal(JSON.stringify(budgetBody).includes(secret), false);
    const head = await fetch(base, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get('cache-control'), 'no-store');
    assert.equal(await head.text(), '');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'])
      assert.equal((await fetch(base, { method })).status, 404);
    for (const suffix of ['/alerts', '/extra'])
      assert.equal((await fetch(base + suffix)).status, 404);
    value = { private: secret };
    for (const dependencyFailure of [false, true]) {
      failure = dependencyFailure;
      const failed = await fetch(base);
      assert.equal(failed.status, 503);
      assert.equal(failed.headers.get('cache-control'), 'no-store');
      const body = await failed.text();
      assert.match(body, /Status unavailable/);
      assert.equal(body.includes(secret), false);
    }
    for (const method of ['GET', 'HEAD'])
      assert.equal(
        classifyPublicRoute(method, '/api/admin/status'),
        'public-read',
      );
  } finally {
    await app.close();
  }
});

void test('prepared status stays absent when disabled and validates before constructing a reader', async () => {
  let created = 0;
  const create = () => {
    created++;
    throw new Error('Reader must remain unopened');
  };
  for (const flags of [{}, { PUBLIC_MODE: '0' }]) {
    const app = await NestFactory.create(
      PublicStatusModule.prepare(flags, create),
      {
        logger: false,
      },
    );
    try {
      await app.listen(0, '127.0.0.1');
      const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/api/admin/status`;
      for (const method of ['GET', 'HEAD'])
        assert.equal((await fetch(base, { method })).status, 404);
    } finally {
      await app.close();
    }
  }
  for (const flags of [
    { PUBLIC_MODE: 'true' },
    { PUBLIC_MODE: '1' },
    { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1' },
    { ...env, READER_PUBLISHED_ONLY: '0' },
  ])
    assert.throws(() => PublicStatusModule.prepare(flags, create));
  assert.equal(created, 0);
});
