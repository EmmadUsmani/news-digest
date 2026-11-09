import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import {
  type AdminWriteAdmission,
  publicAccess,
  type PublicAccessPrincipal,
} from '../src/public-access';

void test(
  'admin writes await durable audit admission and fail closed without exposing request data',
  { timeout: 10_000 },
  async () => {
    const actor = { userId: '00000000-0000-0000-0000-000000000001' };
    let principal: PublicAccessPrincipal | null = {
      freshAdmin: true,
      auditActor: actor,
    };
    let enabled = true;
    let fail = false;
    let reached = 0;
    let release: (() => void) | undefined;
    const entries: AdminWriteAdmission[] = [];
    const at = new Date('2026-11-09T10:00:00Z');
    const server = createServer((req, res) => {
      void publicAccess(
        enabled,
        async () => principal,
        async (entry) => {
          if (fail) throw new Error('secret database error');
          entries.push(entry);
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        },
        () => at,
      )(req, res, () => {
        reached++;
        res.writeHead(204).end();
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const write = () =>
      fetch(`${base}/api/admin/topics?token=private`, {
        method: 'POST',
        body: JSON.stringify({ email: 'private@example.test' }),
        headers: {
          cookie: 'private-cookie',
          'x-exedev-email': 'forged@example.test',
        },
      });
    try {
      const pending = write();
      while (!release) await new Promise((resolve) => setTimeout(resolve, 5));
      assert.equal(reached, 0);
      assert.deepEqual(entries, [
        { actor, action: 'POST', target: '/api/admin/topics', at },
      ]);
      release();
      assert.equal((await pending).status, 204);
      fail = true;
      const failed = await write();
      assert.equal(failed.status, 503);
      assert.equal(await failed.text(), '');
      assert.equal(failed.headers.get('cache-control'), 'no-store');
      assert.equal(reached, 1);
      for (const value of [
        null,
        { freshAdmin: false, auditActor: actor },
        { freshAdmin: true },
        { freshAdmin: true, auditActor: { userId: 'email@example.test' } },
      ]) {
        principal = value;
        assert.equal(
          (await write()).status,
          value && value.freshAdmin ? 503 : 404,
        );
      }
      assert.equal(entries.length, 1);
      assert.equal(reached, 1);
      principal = { freshAdmin: true, auditActor: { localScript: true } };
      fail = false;
      release = undefined;
      const local = write();
      while (!release) await new Promise((resolve) => setTimeout(resolve, 5));
      release();
      assert.equal((await local).status, 204);
      assert.deepEqual(entries[1].actor, { localScript: true });
      assert.equal((await fetch(`${base}/api/admin/topics`)).status, 204);
      assert.equal(entries.length, 2);
      enabled = false;
      assert.equal((await write()).status, 204);
      assert.equal(entries.length, 2);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  },
);
