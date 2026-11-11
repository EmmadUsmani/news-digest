import assert from 'node:assert/strict';
import { once } from 'node:events';
import { resolve } from 'node:path';
import { test } from 'node:test';

import { createExplorerServer } from './http-server.ts';
import { buildModel } from './model.ts';

test('HTTP structural mode filters private fields and private rollback restores them', async () => {
  const model = buildModel(
    {
      tables: [
        {
          name: 'users',
          comment: 'PRIVATE_MARKER',
          rowEstimate: 123,
          sizeBytes: 456,
        },
      ],
      columns: [],
      constraints: [],
      indexes: [],
      triggers: [],
    },
    undefined,
  );
  for (const structuralOnly of [false, true, false]) {
    let loads = 0;
    const server = createExplorerServer({
      structuralOnly,
      publicDir: resolve(import.meta.dirname, '../public'),
      loadModel: async () => {
        loads++;
        return model;
      },
      health: async () => undefined,
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;
    try {
      const response = await fetch(`${base}/api/schema?structuralOnly=0`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const body = await response.text();
      assert.equal(body.includes('PRIVATE_MARKER'), !structuralOnly);
      assert.equal(body.includes('rowEstimate'), !structuralOnly);
      assert.equal(JSON.parse(body).tables[0].name, 'users');
      assert.equal(
        (await fetch(`${base}/api/schema`, { method: 'POST' })).status,
        405,
      );
      assert.equal(loads, 1);
      for (const path of ['/', '/app.js', '/style.css', '/healthz'])
        assert.equal((await fetch(`${base}${path}`)).status, 200);
      for (const path of ['/api/rows', '/server.ts', '/missing.js'])
        assert.equal((await fetch(`${base}${path}`)).status, 404);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((done) => server.close(() => done()));
    }
  }
});
