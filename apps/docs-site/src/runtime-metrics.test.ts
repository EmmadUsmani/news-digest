import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { startRuntimeMetrics } from '@digest/tool-metrics';

for (const service of ['docs', 'schema'] as const)
  void test(`${service} metrics bind only loopback and expose fixed labels`, async () => {
    const { server, registry } = startRuntimeMetrics(service, 0);
    try {
      await once(server, 'listening');
      const address = server.address() as AddressInfo;
      assert.equal(address.address, '127.0.0.1');
      const base = `http://127.0.0.1:${address.port}`;
      const response = await fetch(`${base}/metrics`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') ?? '', /text\/plain/);
      const body = await response.text();
      for (const metric of [
        'process_resident_memory_bytes',
        'nodejs_heap_size_used_bytes',
        'nodejs_eventloop_lag_seconds',
        'nodejs_gc_duration_seconds',
      ])
        assert.ok(body.includes(`news_digest_${metric}`), metric);
      assert.ok(body.includes(`service="${service}"`));
      assert.doesNotMatch(body, /requestId|ANTHROPIC|sourceId/);
      assert.equal((await fetch(`${base}/private?token=secret`)).status, 404);
      assert.equal(
        (await fetch(`${base}/metrics`, { method: 'POST' })).status,
        404,
      );
    } finally {
      registry.clear();
      await new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
    }
  });
