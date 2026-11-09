import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { eq } from 'drizzle-orm';

import { withAdminWriteAdmission } from '../src/libs/db/admin-write-admission';
import { database } from '../src/libs/db/connections';
import { contentSources } from '../src/libs/db/schema';
import { prepareStoredPublicAccess } from '../src/modules/accounts/adapters/public-access-storage';
import { PostgresAdminWriteAdmissionRepository } from '../src/modules/accounts/database/admin-write-admission.repository';
import { PublicSourceWriter } from '../src/modules/topics/database/public-source-writer';
import { PublicTopicWriter } from '../src/modules/topics/database/public-topic-writer';
import { prepareAccessRuntime } from '../src/public-write/access-runtime';
import { prepareAccountPublicWriteRouter } from '../src/public-write/account-router';

void test('admin write admissions persist minimal actors, reject unsafe entries and fail closed', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const recorder = new PostgresAdminWriteAdmissionRepository();
  const now = new Date('2026-11-09T11:00:00Z');
  const userId = (
    await pool.query(
      "INSERT INTO users(email) VALUES ('admission@example.test') RETURNING id",
    )
  ).rows[0].id as string;
  const entry = {
    actor: { userId },
    action: 'POST',
    target: '/api/admin/topics',
    at: now,
  };
  try {
    await recorder.record(entry);
    await recorder.record({ ...entry, actor: { localScript: true } });
    const rows = (
      await pool.query(
        'SELECT user_id, local_script, method, target, created_at, outcome FROM admin_write_admissions ORDER BY local_script',
      )
    ).rows;
    assert.deepEqual(rows, [
      {
        user_id: userId,
        local_script: false,
        method: 'POST',
        target: entry.target,
        created_at: now,
        outcome: null,
      },
      {
        user_id: null,
        local_script: true,
        method: 'POST',
        target: entry.target,
        created_at: now,
        outcome: null,
      },
    ]);
    for (const target of [
      '/api/admin/topics?token=private',
      '/api/account/session',
      '/api/admin/%74opics',
      '/api/admin/../topics',
    ])
      await assert.rejects(recorder.record({ ...entry, target }));
    await assert.rejects(recorder.record({ ...entry, action: 'GET' }));
    await assert.rejects(
      recorder.record({ ...entry, at: new Date('invalid') }),
    );
    await assert.rejects(
      recorder.record({
        ...entry,
        actor: { userId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' },
      }),
    );
    await pool.query(
      `CREATE FUNCTION reject_admission() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'admission refused'; END $$`,
    );
    await pool.query(
      'CREATE TRIGGER reject_admission BEFORE INSERT ON admin_write_admissions FOR EACH ROW EXECUTE FUNCTION reject_admission()',
    );
    await assert.rejects(recorder.record(entry), (error: unknown) => {
      assert.ok(error instanceof Error && error.cause instanceof Error);
      assert.match(error.cause.message, /admission refused/);
      return true;
    });
    assert.equal(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM admin_write_admissions',
        )
      ).rows[0].n,
      2,
    );
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    assert.equal(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM admin_write_admissions WHERE user_id=$1',
          [userId],
        )
      ).rows[0].n,
      0,
    );
  } finally {
    await pool.query(
      'DROP TRIGGER IF EXISTS reject_admission ON admin_write_admissions',
    );
    await pool.query('DROP FUNCTION IF EXISTS reject_admission()');
    await pool.query('DELETE FROM admin_write_admissions');
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    await recorder.onModuleDestroy();
    await pool.end();
  }
});

void test('stored public policy admits HTTP writes only after persistence and owns recorder shutdown', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const disabled = prepareStoredPublicAccess(false, () => {
    throw new Error('disabled must not open accounts');
  });
  await disabled.close();
  await disabled.close();
  assert.throws(() => prepareStoredPublicAccess(true, () => null));
  const pool = database();
  const userId = (
    await pool.query(
      "INSERT INTO users(email) VALUES ('policy-admission@example.test') RETURNING id",
    )
  ).rows[0].id as string;
  const at = new Date('2026-11-09T11:20:00Z');
  let authorized = true;
  let pause: Promise<void> | undefined;
  let entered: (() => void) | undefined;
  let reached = 0;
  const policy = prepareStoredPublicAccess(
    true,
    () => ({
      authorization: async () => {
        entered?.();
        await pause;
        return authorized ? { freshAdmin: true, auditActor: { userId } } : null;
      },
    }),
    () => at,
  );
  const server = createServer((req, res) => {
    void policy.middleware(req, res, () => {
      reached++;
      res.writeHead(204).end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const write = () =>
    fetch(`${base}/api/admin/topics?private=excluded`, {
      method: 'POST',
      body: 'private request body',
    });
  try {
    assert.equal((await write()).status, 204);
    assert.equal(reached, 1);
    assert.deepEqual(
      (
        await pool.query(
          'SELECT method, target, created_at FROM admin_write_admissions WHERE user_id=$1',
          [userId],
        )
      ).rows,
      [{ method: 'POST', target: '/api/admin/topics', created_at: at }],
    );
    authorized = false;
    assert.equal((await write()).status, 404);
    authorized = true;
    // A removed identity makes the durable insert fail its foreign key.
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    const refused = await write();
    assert.equal(refused.status, 503);
    assert.equal(await refused.text(), '');
    assert.equal(refused.headers.get('cache-control'), 'no-store');
    assert.equal(reached, 1);
    let resume!: () => void;
    pause = new Promise<void>((resolve) => {
      resume = resolve;
    });
    const waiting = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const pending = write();
    await waiting;
    await policy.close();
    await policy.close();
    resume();
    assert.equal((await pending).status, 503);
    assert.equal((await write()).status, 503);
    assert.equal(reached, 1);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await policy.close();
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    await pool.end();
  }
});

void test('transaction-bound admin admission commits with database writes and rolls both back on failure', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const sourceId = 'transaction-audit-source';
  const entry = {
    actor: { localScript: true as const },
    action: 'PUT',
    target: `/api/admin/topics/sources/${sourceId}/enabled`,
    at: new Date('2026-11-09T11:30:00Z'),
  };
  const state = async () => ({
    enabled: (
      await pool.query('SELECT enabled FROM content_sources WHERE id=$1', [
        sourceId,
      ])
    ).rows[0].enabled,
    admissions: (
      await pool.query(
        'SELECT count(*)::int AS n FROM admin_write_admissions WHERE target=$1',
        [entry.target],
      )
    ).rows[0].n,
  });
  try {
    await pool.query(
      "INSERT INTO content_sources(id, name, kind, url, enabled) VALUES ($1, 'Audit test', 'feed', 'https://example.test/feed', false)",
      [sourceId],
    );
    const changed = await withAdminWriteAdmission(pool, entry, async (tx) => {
      return tx
        .update(contentSources)
        .set({ enabled: true })
        .where(eq(contentSources.id, sourceId))
        .returning({ id: contentSources.id });
    });
    assert.deepEqual(changed, [{ id: sourceId }]);
    assert.deepEqual(await state(), { enabled: true, admissions: 1 });
    await assert.rejects(
      withAdminWriteAdmission(pool, entry, async (tx) => {
        await tx
          .update(contentSources)
          .set({ enabled: false })
          .where(eq(contentSources.id, sourceId));
        throw new Error('mutation refused');
      }),
      /mutation refused/,
    );
    assert.deepEqual(await state(), { enabled: true, admissions: 1 });
    // A database failure after an actual write also restores both records.
    await assert.rejects(
      withAdminWriteAdmission(pool, entry, async (tx) => {
        await tx
          .update(contentSources)
          .set({ enabled: false })
          .where(eq(contentSources.id, sourceId));
        await tx.insert(contentSources).values({
          id: sourceId,
          name: 'Duplicate',
          kind: 'feed',
          url: 'https://example.test/feed',
        });
      }),
    );
    assert.deepEqual(await state(), { enabled: true, admissions: 1 });
    let reached = false;
    await assert.rejects(
      withAdminWriteAdmission(
        pool,
        { ...entry, actor: { userId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' } },
        async () => {
          reached = true;
        },
      ),
    );
    assert.equal(reached, false);
    await assert.rejects(
      withAdminWriteAdmission(
        pool,
        { ...entry, target: entry.target + '?private=excluded' },
        async () => {
          reached = true;
        },
      ),
    );
    assert.equal(reached, false);
    assert.deepEqual(await state(), { enabled: true, admissions: 1 });
    // Transaction cleanup leaves the owned pool usable after every refusal.
    await withAdminWriteAdmission(pool, entry, async (tx) => {
      await tx
        .update(contentSources)
        .set({ enabled: false })
        .where(eq(contentSources.id, sourceId));
    });
    assert.deepEqual(await state(), { enabled: false, admissions: 2 });
  } finally {
    await pool.query('DELETE FROM admin_write_admissions WHERE target=$1', [
      entry.target,
    ]);
    await pool.query('DELETE FROM content_sources WHERE id=$1', [sourceId]);
    await pool.end();
  }
});

void test('prepared source writer binds the target, reports serialized outcomes and rolls back refusals', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const writer = new PublicSourceWriter(pool);
  const id = 'prepared-source-writer';
  const entry = {
    actor: { localScript: true as const },
    action: 'PUT',
    target: `/api/admin/topics/sources/${id}/enabled`,
    at: new Date(),
  };
  const admissions = async () =>
    (
      await pool.query(
        'SELECT count(*)::int AS n FROM admin_write_admissions WHERE target=$1',
        [entry.target],
      )
    ).rows[0].n;
  try {
    assert.deepEqual(await writer.setEnabled(entry, id, true), {
      outcome: 'not-found',
    });
    assert.equal(await admissions(), 0);
    await pool.query(
      "INSERT INTO content_sources(id,name,kind,url,enabled) VALUES ($1,'Prepared writer','feed','https://example.test/feed',false)",
      [id],
    );
    const results = await Promise.all([
      writer.setEnabled(entry, id, true),
      writer.setEnabled(entry, id, true),
    ]);
    assert.deepEqual(results.map((r) => r.outcome).sort(), [
      'changed',
      'unchanged',
    ]);
    assert.equal(await admissions(), 2);
    assert.deepEqual(
      (
        await pool.query(
          'SELECT outcome FROM admin_write_admissions WHERE target=$1 ORDER BY outcome',
          [entry.target],
        )
      ).rows,
      [{ outcome: 'changed' }, { outcome: 'unchanged' }],
    );
    await assert.rejects(
      pool.query(
        "UPDATE admin_write_admissions SET outcome='failed' WHERE target=$1",
        [entry.target],
      ),
      /admin_write_admissions_outcome_check/,
    );
    // Failure while recording the outcome must roll back the source update too.
    await pool.query(
      `CREATE FUNCTION refuse_source_outcome() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'outcome unavailable'; END $$`,
    );
    await pool.query(
      `CREATE TRIGGER refuse_source_outcome BEFORE UPDATE ON admin_write_admissions FOR EACH ROW EXECUTE FUNCTION refuse_source_outcome()`,
    );
    try {
      await assert.rejects(
        writer.setEnabled(entry, id, false),
        (error: unknown) => {
          assert.ok(error instanceof Error && error.cause instanceof Error);
          assert.match(error.cause.message, /outcome unavailable/);
          return true;
        },
      );
      assert.equal(await admissions(), 2);
      assert.equal(
        (
          await pool.query('SELECT enabled FROM content_sources WHERE id=$1', [
            id,
          ])
        ).rows[0].enabled,
        true,
      );
    } finally {
      await pool.query(
        'DROP TRIGGER refuse_source_outcome ON admin_write_admissions',
      );
      await pool.query('DROP FUNCTION refuse_source_outcome()');
    }
    await assert.rejects(
      writer.setEnabled(
        { ...entry, target: '/api/admin/profile/schedule' },
        id,
        false,
      ),
      /Invalid source write/,
    );
    await assert.rejects(
      writer.setEnabled(
        { ...entry, actor: { userId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' } },
        id,
        false,
      ),
    );
    assert.equal(
      (
        await pool.query('SELECT enabled FROM content_sources WHERE id=$1', [
          id,
        ])
      ).rows[0].enabled,
      true,
    );
    assert.equal(await admissions(), 2);
    assert.deepEqual(await writer.setEnabled(entry, id, false), {
      outcome: 'changed',
      id,
      enabled: false,
    });
    assert.equal(await admissions(), 3);
  } finally {
    await pool.query('DELETE FROM admin_write_admissions WHERE target=$1', [
      entry.target,
    ]);
    await pool.query('DELETE FROM content_sources WHERE id=$1', [id]);
    await pool.end();
  }
});

void test('source HTTP commits exactly one admission with each mutation and refuses database failures', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const id = 'prepared-source-http';
  const target = `/api/admin/topics/sources/${id}/enabled`;
  const userId = (
    await pool.query(
      "INSERT INTO users(email) VALUES ('source-http@example.test') RETURNING id",
    )
  ).rows[0].id as string;
  let invalidActor = false;
  let standalone = 0;
  let legacy = 0;
  const runtime = await prepareAccountPublicWriteRouter({
    enabled: true,
    origin: 'https://reader.example',
    accounts: () => ({
      authorization: async () => ({
        freshAdmin: true,
        auditActor: invalidActor
          ? { userId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' }
          : { userId },
      }),
    }),
    pool: () => pool,
    recordAdminWrite: async () => {
      standalone++;
    },
  });
  const server = createServer((req, res) =>
    runtime.middleware(req, res, () => {
      legacy++;
      res.statusCode = 404;
      res.end();
    }),
  );
  const admissions = async () =>
    (
      await pool.query(
        'SELECT count(*)::int AS n FROM admin_write_admissions WHERE target=$1',
        [target],
      )
    ).rows[0].n;
  try {
    await pool.query(
      "INSERT INTO content_sources(id,name,kind,url,enabled) VALUES ($1,'HTTP writer','feed','https://example.test/feed',false)",
      [id],
    );
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const put = () =>
      fetch(`http://127.0.0.1:${address.port}${target}`, {
        method: 'PUT',
        headers: {
          origin: 'https://reader.example',
          'content-type': 'application/json',
        },
        body: '{"enabled":true}',
      });
    invalidActor = true;
    const refused = await put();
    assert.equal(refused.status, 503);
    assert.equal(await refused.text(), '');
    assert.equal(await admissions(), 0);
    assert.equal(
      (
        await pool.query('SELECT enabled FROM content_sources WHERE id=$1', [
          id,
        ])
      ).rows[0].enabled,
      false,
    );
    invalidActor = false;
    for (const outcome of ['changed', 'unchanged']) {
      const response = await put();
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { outcome, id, enabled: true });
    }
    assert.equal(await admissions(), 2);
    assert.deepEqual(
      (
        await pool.query(
          'SELECT outcome FROM admin_write_admissions WHERE target=$1 ORDER BY outcome',
          [target],
        )
      ).rows,
      [{ outcome: 'changed' }, { outcome: 'unchanged' }],
    );
    assert.equal(
      (
        await pool.query('SELECT enabled FROM content_sources WHERE id=$1', [
          id,
        ])
      ).rows[0].enabled,
      true,
    );
    await pool.query('DELETE FROM content_sources WHERE id=$1', [id]);
    const missing = await put();
    assert.equal(missing.status, 404);
    assert.equal(await missing.text(), '');
    assert.equal(await admissions(), 2);
    assert.deepEqual([standalone, legacy], [0, 0]);
    assert.equal(
      (await fetch(`http://127.0.0.1:${address.port}/api/admin/topics`)).status,
      404,
    );
    assert.deepEqual([standalone, legacy], [0, 1]);
  } finally {
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    await pool.query('DELETE FROM admin_write_admissions WHERE target=$1', [
      target,
    ]);
    await pool.query('DELETE FROM content_sources WHERE id=$1', [id]);
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    await runtime.close();
  }
});

void test('prepared topic toggle commits audit outcomes with serialized changes and rolls back failures', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const writer = new PublicTopicWriter(pool);
  const id = 'c4444444-4444-4444-8444-444444444444';
  const entry = {
    actor: { localScript: true as const },
    action: 'PUT',
    target: `/api/admin/topics/${id}`,
    at: new Date(),
  };
  const count = async () =>
    (
      await pool.query(
        'SELECT count(*)::int AS n FROM admin_write_admissions WHERE target=$1',
        [entry.target],
      )
    ).rows[0].n;
  try {
    assert.deepEqual(await writer.setEnabled(entry, id, true), {
      outcome: 'not-found',
    });
    assert.equal(await count(), 0);
    await pool.query(
      "INSERT INTO topics(id,name,description,include_guidance,position,enabled) VALUES ($1,'Prepared topic','Description','Guidance',999,false)",
      [id],
    );
    const results = await Promise.all([
      writer.setEnabled(entry, id, true),
      writer.setEnabled(entry, id, true),
    ]);
    assert.deepEqual(results.map((r) => r.outcome).sort(), [
      'changed',
      'unchanged',
    ]);
    assert.deepEqual(
      (
        await pool.query(
          'SELECT outcome FROM admin_write_admissions WHERE target=$1 ORDER BY outcome',
          [entry.target],
        )
      ).rows,
      [{ outcome: 'changed' }, { outcome: 'unchanged' }],
    );
    await assert.rejects(
      writer.setEnabled({ ...entry, target: '/api/admin/topics' }, id, false),
    );
    await assert.rejects(
      writer.setEnabled(
        { ...entry, actor: { userId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' } },
        id,
        false,
      ),
    );
    await pool.query(
      "CREATE FUNCTION refuse_topic_outcome() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'topic outcome unavailable'; END $$",
    );
    await pool.query(
      'CREATE TRIGGER refuse_topic_outcome BEFORE UPDATE ON admin_write_admissions FOR EACH ROW EXECUTE FUNCTION refuse_topic_outcome()',
    );
    try {
      await assert.rejects(writer.setEnabled(entry, id, false));
      assert.equal(
        (await pool.query('SELECT enabled FROM topics WHERE id=$1', [id]))
          .rows[0].enabled,
        true,
      );
      assert.equal(await count(), 2);
    } finally {
      await pool.query(
        'DROP TRIGGER refuse_topic_outcome ON admin_write_admissions',
      );
      await pool.query('DROP FUNCTION refuse_topic_outcome()');
    }
    assert.deepEqual(await writer.setEnabled(entry, id, false), {
      outcome: 'changed',
      id,
      enabled: false,
    });
    assert.equal(await count(), 3);
  } finally {
    await pool.query('DELETE FROM admin_write_admissions WHERE target=$1', [
      entry.target,
    ]);
    await pool.query('DELETE FROM topics WHERE id=$1', [id]);
    await pool.end();
  }
});

void test('combined topic HTTP runtime commits concurrent toggles once and rolls back audit failures', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const id = 'd4444444-4444-4444-8444-444444444444';
  const target = `/api/admin/topics/${id}`;
  const userId = (
    await pool.query(
      "INSERT INTO users(email) VALUES ('topic-http@example.test') RETURNING id",
    )
  ).rows[0].id as string;
  let invalidActor = false;
  let standalone = 0;
  let legacy = 0;
  const runtime = await prepareAccessRuntime({
    enabled: true,
    origin: 'https://reader.example',
    accountTransport: (_req, _res, next) => next(),
    legacyAccess: () => {
      throw new Error('Unexpected private access');
    },
    accounts: () => ({
      authorization: async () => ({
        freshAdmin: true,
        auditActor: invalidActor
          ? { userId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' }
          : { userId },
      }),
    }),
    pool: () => pool,
    recordAdminWrite: async () => {
      standalone++;
    },
  });
  const server = createServer((req, res) =>
    runtime.middleware(req, res, () => {
      legacy++;
      res.statusCode = 404;
      res.end();
    }),
  );
  const admissions = async () =>
    (
      await pool.query(
        'SELECT count(*)::int AS n FROM admin_write_admissions WHERE target=$1',
        [target],
      )
    ).rows[0].n;
  try {
    await pool.query(
      "INSERT INTO topics(id,name,description,include_guidance,position,enabled) VALUES ($1,'HTTP topic','Description','Guidance',999,false)",
      [id],
    );
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const put = () =>
      fetch(`http://127.0.0.1:${address.port}${target}`, {
        method: 'PUT',
        headers: {
          origin: 'https://reader.example',
          'content-type': 'application/json',
        },
        body: '{"enabled":true}',
      });
    invalidActor = true;
    const refused = await put();
    assert.equal(refused.status, 503);
    assert.equal(await refused.text(), '');
    assert.equal(await admissions(), 0);
    assert.equal(
      (await pool.query('SELECT enabled FROM topics WHERE id=$1', [id])).rows[0]
        .enabled,
      false,
    );
    invalidActor = false;
    const responses = await Promise.all([put(), put()]);
    const bodies = await Promise.all(
      responses.map(async (response) => {
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        return response.json() as Promise<{
          outcome: string;
          id: string;
          enabled: boolean;
        }>;
      }),
    );
    assert.deepEqual(
      bodies.sort((a, b) => a.outcome.localeCompare(b.outcome)),
      [
        { outcome: 'changed', id, enabled: true },
        { outcome: 'unchanged', id, enabled: true },
      ],
    );
    assert.equal(await admissions(), 2);
    assert.deepEqual(
      (
        await pool.query(
          'SELECT outcome FROM admin_write_admissions WHERE target=$1 ORDER BY outcome',
          [target],
        )
      ).rows,
      [{ outcome: 'changed' }, { outcome: 'unchanged' }],
    );
    assert.equal(
      (await pool.query('SELECT enabled FROM topics WHERE id=$1', [id])).rows[0]
        .enabled,
      true,
    );
    await pool.query(
      "CREATE FUNCTION refuse_http_topic_outcome() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'private storage failure'; END $$",
    );
    await pool.query(
      'CREATE TRIGGER refuse_http_topic_outcome BEFORE UPDATE ON admin_write_admissions FOR EACH ROW EXECUTE FUNCTION refuse_http_topic_outcome()',
    );
    try {
      const response = await fetch(
        `http://127.0.0.1:${address.port}${target}`,
        {
          method: 'PUT',
          headers: {
            origin: 'https://reader.example',
            'content-type': 'application/json',
          },
          body: '{"enabled":false}',
        },
      );
      assert.equal(response.status, 503);
      assert.equal(await response.text(), '');
      assert.equal(await admissions(), 2);
      assert.equal(
        (await pool.query('SELECT enabled FROM topics WHERE id=$1', [id]))
          .rows[0].enabled,
        true,
      );
    } finally {
      await pool.query(
        'DROP TRIGGER refuse_http_topic_outcome ON admin_write_admissions',
      );
      await pool.query('DROP FUNCTION refuse_http_topic_outcome()');
    }
    await pool.query('DELETE FROM topics WHERE id=$1', [id]);
    const missing = await put();
    assert.equal(missing.status, 404);
    assert.equal(await missing.text(), '');
    assert.equal(await admissions(), 2);
    assert.deepEqual([standalone, legacy], [0, 0]);
    assert.equal(
      (await fetch(`http://127.0.0.1:${address.port}/api/admin/topics`)).status,
      404,
    );
    assert.deepEqual([standalone, legacy], [0, 1]);
  } finally {
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    await pool.query('DELETE FROM admin_write_admissions WHERE target=$1', [
      target,
    ]);
    await pool.query('DELETE FROM topics WHERE id=$1', [id]);
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    await runtime.close();
  }
});

void test('prepared topic order serializes outcomes, refuses stale catalogs and rolls back audit failure', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const writer = new PublicTopicWriter(pool);
  const entry = {
    actor: { localScript: true },
    action: 'PUT',
    target: '/api/admin/topics/order',
    at: new Date('2026-11-09T14:00:00Z'),
  };
  const original = (
    await pool.query('SELECT id, position FROM topics ORDER BY position, id')
  ).rows as { id: string; position: number }[];
  const ids = original.map((row) => row.id).reverse();
  assert.ok(ids.length > 1);
  const count = async () =>
    (
      await pool.query(
        'SELECT count(*)::int AS n FROM admin_write_admissions WHERE target=$1',
        [entry.target],
      )
    ).rows[0].n;
  try {
    const results = await Promise.all([
      writer.reorder(entry, ids),
      writer.reorder(entry, ids),
    ]);
    assert.deepEqual(results.map((result) => result.outcome).sort(), [
      'changed',
      'unchanged',
    ]);
    assert.deepEqual(
      (
        await pool.query('SELECT id FROM topics ORDER BY position, id')
      ).rows.map((row) => row.id),
      ids,
    );
    assert.deepEqual(
      (
        await pool.query(
          'SELECT outcome FROM admin_write_admissions WHERE target=$1 ORDER BY outcome',
          [entry.target],
        )
      ).rows,
      [{ outcome: 'changed' }, { outcome: 'unchanged' }],
    );
    assert.deepEqual(await writer.reorder(entry, ids.slice(1)), {
      outcome: 'catalog-changed',
    });
    assert.deepEqual(
      await writer.reorder(entry, [
        ...ids.slice(1),
        'ffffffff-ffff-4fff-8fff-ffffffffffff',
      ]),
      { outcome: 'catalog-changed' },
    );
    for (const invalid of [
      [ids[0], ids[0]],
      ['invalid'],
      Array(1001).fill(ids[0]),
    ])
      await assert.rejects(writer.reorder(entry, invalid));
    await assert.rejects(writer.reorder({ ...entry, action: 'POST' }, ids));
    await assert.rejects(
      writer.reorder({ ...entry, target: '/api/admin/topics' }, ids),
    );
    await assert.rejects(
      writer.reorder(
        { ...entry, actor: { userId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' } },
        [...ids].reverse(),
      ),
    );
    assert.equal(await count(), 2);
    await pool.query(
      "CREATE FUNCTION refuse_order_outcome() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'order audit unavailable'; END $$",
    );
    await pool.query(
      'CREATE TRIGGER refuse_order_outcome BEFORE UPDATE ON admin_write_admissions FOR EACH ROW EXECUTE FUNCTION refuse_order_outcome()',
    );
    try {
      await assert.rejects(writer.reorder(entry, [...ids].reverse()));
      assert.deepEqual(
        (
          await pool.query('SELECT id FROM topics ORDER BY position, id')
        ).rows.map((row) => row.id),
        ids,
      );
      assert.equal(await count(), 2);
    } finally {
      await pool.query(
        'DROP TRIGGER refuse_order_outcome ON admin_write_admissions',
      );
      await pool.query('DROP FUNCTION refuse_order_outcome()');
    }
    assert.deepEqual(await writer.reorder(entry, [...ids].reverse()), {
      outcome: 'changed',
    });
    assert.equal(await count(), 3);
  } finally {
    for (const row of original)
      await pool.query('UPDATE topics SET position=$2 WHERE id=$1', [
        row.id,
        row.position,
      ]);
    await pool.query('DELETE FROM admin_write_admissions WHERE target=$1', [
      entry.target,
    ]);
    await pool.end();
  }
});
