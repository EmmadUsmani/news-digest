import 'reflect-metadata';

import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { readerEditionSchema } from '@digest/contracts';
import { NestFactory } from '@nestjs/core';

import { database } from '../src/libs/db/connections';

void test('configured full public application serves published fixtures and refuses anonymous writes before controllers', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const directory = await mkdtemp(join(tmpdir(), 'public-application-'));
  const configuration = {
    PUBLIC_MODE: '1',
    SYSTEM_OWNERSHIP: '1',
    READER_PUBLISHED_ONLY: '1',
    ACCOUNTS_ENABLED: '1',
    ACCOUNT_ORIGIN: 'https://reader.example',
    ACCOUNT_SECRET_KEY: randomBytes(32).toString('hex'),
    ACCOUNT_MAILBOX_PATH: directory,
    ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1',
    SIGNUP_MODE: 'invite',
    ADMIN_EMAILS: 'isolated-owner@example.test',
  };
  const previous = Object.fromEntries(
    Object.keys(configuration).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, configuration);
  // Emitted metadata and the exact production provider token must come from
  // the same compiled module graph. Load only after configuring this process.
  const require = createRequire(import.meta.url);
  const { AppModule } =
    require('../dist/app.js') as typeof import('../src/app');
  const { ACCESS_HTTP } =
    require('../dist/public-write/access-provider.js') as typeof import('../src/public-write/access-provider');
  const { PublicErrorFilter } =
    require('../dist/public-write/public-error-filter.js') as typeof import('../src/public-write/public-error-filter');
  const db = database();
  const ids = [randomUUID(), randomUUID()];
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    app.useGlobalFilters(new PublicErrorFilter());
    app.use(
      app.get<import('../src/public-write/access-provider').AccessHttpRuntime>(
        ACCESS_HTTP,
      ).middleware,
    );
    for (const [index, id] of ids.entries()) {
      const snapshot = {
        id,
        createdAt: '9998-01-02T00:00:00.000Z',
        windowStart: '9998-01-01T00:00:00.000Z',
        windowEnd: '9998-01-02T00:00:00.000Z',
        method: 'signals-v6',
        topics: [],
      };
      await db.query(
        'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot,kind,published_at) VALUES($1,NULL,$2,$3,$4,$5,$6,$7)',
        [
          id,
          index ? '9999-01-02T00:00:00Z' : snapshot.createdAt,
          snapshot.windowStart,
          snapshot.windowEnd,
          snapshot,
          index ? 'test' : 'scheduled',
          index ? null : snapshot.createdAt,
        ],
      );
    }
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const headers = {
      'X-Forwarded-For': '192.0.2.1, 203.0.113.91, 203.0.113.91',
    };
    const get = (path: string, init: RequestInit = {}) =>
      fetch(base + path, { ...init, headers: { ...headers, ...init.headers } });
    const health = await fetch(base + '/healthz');
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), {
      status: 'ok',
      database: true,
      redis: true,
    });
    const latest = await get('/api/editions/latest');
    assert.equal(latest.status, 200);
    assert.equal(readerEditionSchema.parse(await latest.json()).id, ids[0]);
    assert.equal(latest.headers.get('cache-control'), 'no-store');
    const direct = await get('/api/editions/' + ids[0]);
    assert.equal(direct.status, 200);
    assert.equal(readerEditionSchema.parse(await direct.json()).id, ids[0]);
    const topics = await get('/api/admin/topics');
    assert.equal(topics.status, 404);
    assert.equal(await topics.text(), '');
    const session = await get('/api/account/session');
    assert.equal(session.status, 200);
    assert.deepEqual(await session.json(), { signedIn: false, isAdmin: false });
    for (const [path, method, status] of [
      ['/api/editions/' + ids[1], 'GET', 404],
      ['/api/editions?offset=invalid', 'GET', 400],
      ['/api/admin/topics', 'POST', 403],
      ['/api/admin/digest-previews/jobs', 'POST', 403],
      ['/api/admin/status', 'GET', 404],
      ['/api/unknown', 'GET', 404],
    ] as const) {
      const response = await get(path, {
        method,
        headers: { 'X-ExeDev-Email': configuration.ADMIN_EMAILS },
      });
      assert.equal(response.status, status, `${method} ${path}`);
      assert.equal(await response.text(), '');
      assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    const missingClient = await fetch(base + '/api/editions/latest');
    assert.equal(missingClient.status, 429);
    assert.equal(await missingClient.text(), '');
    // Ten admitted calls above: exhaust the remaining allowance through real
    // reader controllers, then prove account dispatch shares the same limit.
    for (let index = 0; index < 110; index++) {
      const response = await get('/api/editions/latest', { method: 'HEAD' });
      assert.equal(response.status, 200);
      assert.equal(await response.text(), '');
    }
    const limited = await get('/api/account/session');
    assert.equal(limited.status, 429);
    assert.equal(await limited.text(), '');
    assert.equal((await fetch(base + '/healthz')).status, 200);
    const rows = await db.query(
      'SELECT id FROM digest_previews WHERE id = ANY($1::uuid[])',
      [ids],
    );
    assert.equal(rows.rowCount, 2);
  } finally {
    await app.close();
    try {
      await db.query('BEGIN');
      await db.query(
        'ALTER TABLE digest_previews DISABLE TRIGGER immutable_digest_preview',
      );
      await db.query('DELETE FROM digest_previews WHERE id = ANY($1::uuid[])', [
        ids,
      ]);
      await db.query(
        'ALTER TABLE digest_previews ENABLE TRIGGER immutable_digest_preview',
      );
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      await db.end();
    }
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(directory, { recursive: true, force: true });
  }
});
