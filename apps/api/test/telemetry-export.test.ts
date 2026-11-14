import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import {
  boundedTelemetryExport,
  proxyBoundedTelemetryExport,
  readBoundedTelemetryExport,
  telemetryExportPath,
} from '../src/telemetry-export';
import { isAdminTelemetryRead } from '../src/telemetry-query-policy';

void test('export request bounds reject broad, ambiguous and long-running requests', () => {
  const target = `${telemetryExportPath}?match%5B%5D=up&start=100&end=160`;
  const bounded = boundedTelemetryExport(target);
  assert.ok(bounded);
  assert.equal(
    new URL(bounded, 'http://localhost').searchParams.get('max_rows_per_line'),
    '1',
  );
  assert.equal(
    new URL(bounded, 'http://localhost').searchParams.get('timeout'),
    '2s',
  );
  for (const bad of [
    target + '&match%5B%5D=up',
    target + '&start=100',
    target + '&limit=1',
    target + '&timeout=30s',
    target + '&max_rows_per_line=1000',
    target + '&reduce_mem_usage=0',
    target.replace('=up', '=%7B__name__%3D~%22.*%22%7D'),
    target.replace('end=160', 'end=161'),
    target.replace('end=160', 'end=99'),
    target.replace('end=160', 'end=NaN'),
    target.replace('end=160', 'end=1e3'),
    target.replace('end=160', 'end='),
    target + '#fragment',
    'https://foreign.invalid' + target,
    target.replace('/export?', '/export/?'),
  ])
    assert.equal(boundedTelemetryExport(bad), null, bad);
  for (const method of ['GET', 'POST', 'HEAD'])
    assert.equal(isAdminTelemetryRead(method, target), false);
});

void test(
  'export transport buffers exact cap and aborts overflow, deadline and caller cancellation',
  { timeout: 15000 },
  async (t) => {
    let phase = 'starting server';
    t.after(() => t.diagnostic(`transport last phase: ${phase}`));
    const closed = new Set<string>();
    let cancelStarted = () => {};
    const server = createServer((req, res) => {
      res.on('close', () => closed.add(req.url!));
      if (req.url === '/redirect') {
        res.writeHead(302, { location: '/ok' }).end();
        return;
      }
      if (req.url === '/headers') return;
      if (req.url === '/status') {
        res.writeHead(503).end();
        return;
      }
      res.writeHead(200, {
        'content-type':
          req.url === '/html' ? 'text/html' : 'application/stream+json',
        ...(req.url === '/cookie' ? { 'set-cookie': 'private=value' } : {}),
      });
      if (req.url === '/stall' || req.url === '/cancel') {
        res.write('partial');
        if (req.url === '/cancel') cancelStarted();
        return;
      }
      if (req.url === '/broken') {
        res.write('partial');
        setImmediate(() => res.destroy());
        return;
      }
      res.end(Buffer.alloc(req.url === '/overflow' ? 65537 : 65536, 32));
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const read = (
      path: string,
      signal = new AbortController().signal,
      timeout = 2000,
    ) => {
      phase = `reading ${path}`;
      return readBoundedTelemetryExport(new URL(path, base), signal, timeout);
    };
    try {
      assert.equal((await read('/ok')).length, 65536);
      for (const path of [
        '/overflow',
        '/html',
        '/redirect',
        '/cookie',
        '/status',
        '/broken',
      ])
        await assert.rejects(read(path));
      for (const path of ['/headers', '/stall'])
        await assert.rejects(read(path, undefined, 80));
      // Exercise cancellation as the server begins its body, repeatedly. The
      // former pooled fetch could remain pending here past its own deadline.
      for (let iteration = 0; iteration < 50; iteration++) {
        const caller = new AbortController();
        const receiving = new Promise<void>((resolve) => {
          cancelStarted = resolve;
        });
        const pending = assert.rejects(read('/cancel', caller.signal));
        await receiving;
        caller.abort();
        await pending;
      }
      await assert.rejects(
        readBoundedTelemetryExport(
          new URL('file:///unavailable'),
          new AbortController().signal,
        ),
      );
      const alreadyAborted = AbortSignal.abort();
      await assert.rejects(read('/never', alreadyAborted));
      await new Promise((resolve) => setTimeout(resolve, 50));
      for (const path of ['/overflow', '/headers', '/stall', '/cancel'])
        assert.ok(closed.has(path), path);
      assert.equal(closed.has('/never'), false);
    } finally {
      phase = 'closing transport server';
      // Stop accepting before closing sockets: a pooled client can reconnect.
      const stopped = new Promise<void>((resolve) =>
        server.close(() => resolve()),
      );
      server.closeAllConnections();
      await stopped;
    }
  },
);

void test(
  'prepared export HTTP handler bounds responses, strips credentials and cancels on downstream disconnect',
  { timeout: 15000 },
  async (t) => {
    let phase = 'starting servers';
    t.after(() => t.diagnostic(`proxy last phase: ${phase}`));
    let mode = 'ok';
    let calls = 0;
    let closed!: () => void;
    let started!: () => void;
    const upstream = createServer((req, res) => {
      calls++;
      assert.equal(req.headers.cookie, undefined);
      assert.equal(req.headers.authorization, undefined);
      assert.equal(req.headers['x-exedev-email'], undefined);
      const url = new URL(req.url!, 'http://localhost');
      assert.equal(url.pathname, telemetryExportPath);
      assert.equal(url.searchParams.get('max_rows_per_line'), '1');
      assert.equal(url.searchParams.get('reduce_mem_usage'), '1');
      assert.equal(url.searchParams.get('timeout'), '2s');
      if (mode === 'headers') return;
      res.writeHead(200, {
        'content-type': 'application/stream+json',
        'x-private': 'hidden',
      });
      if (mode === 'disconnect') {
        res.on('close', () => closed());
        res.write('partial');
        started();
        return;
      }
      res.end(Buffer.alloc(mode === 'overflow' ? 65537 : 65536, 32));
    });
    await new Promise<void>((resolve) =>
      upstream.listen(0, '127.0.0.1', resolve),
    );
    const origin = new URL(
      `http://127.0.0.1:${(upstream.address() as AddressInfo).port}`,
    );
    const proxy = createServer((req, res) => {
      void proxyBoundedTelemetryExport(
        req,
        res,
        origin,
        mode === 'disconnect' ? 5000 : 150,
      );
    });
    await new Promise<void>((resolve) => proxy.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${(proxy.address() as AddressInfo).port}`;
    const target = `${telemetryExportPath}?match%5B%5D=up&start=100&end=160`;
    try {
      for (const method of ['POST', 'HEAD']) {
        phase = `refusing ${method}`;
        const response = await fetch(base + target, { method });
        assert.equal(response.status, 404);
        await response.arrayBuffer();
      }
      phase = 'refusing broad export';
      const refused = await fetch(base + target + '&limit=1');
      assert.equal(refused.status, 404);
      await refused.arrayBuffer();
      assert.equal(calls, 0);
      phase = 'reading bounded export';
      const ok = await fetch(base + target, {
        headers: {
          cookie: 'session=private',
          authorization: 'Bearer private',
          'x-exedev-email': 'private',
        },
      });
      assert.equal(ok.status, 200);
      assert.equal(ok.headers.get('cache-control'), 'no-store');
      assert.equal(ok.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(ok.headers.get('x-private'), null);
      assert.equal((await ok.arrayBuffer()).byteLength, 65536);
      for (mode of ['overflow', 'headers']) {
        phase = `reading ${mode}`;
        const failed = await fetch(base + target);
        assert.equal(failed.status, 502);
        assert.equal(failed.headers.get('cache-control'), 'no-store');
        assert.equal(
          await failed.text(),
          'Telemetry export is unavailable right now.',
        );
      }
      mode = 'disconnect';
      const disconnected = new Promise<void>((resolve) => {
        closed = resolve;
      });
      const receiving = new Promise<void>((resolve) => {
        started = resolve;
      });
      const client = request(base + target);
      client.on('error', () => {});
      client.end();
      phase = 'awaiting upstream disconnect request';
      await receiving;
      phase = 'awaiting upstream cancellation';
      client.destroy();
      await Promise.race([
        disconnected,
        new Promise<never>((_, reject) => {
          const timer = setTimeout(
            () => reject(new Error('upstream stayed connected')),
            1000,
          );
          timer.unref();
        }),
      ]);
    } finally {
      phase = 'closing proxy servers';
      await Promise.all(
        [proxy, upstream].map((server) => {
          const stopped = new Promise<void>((resolve) =>
            server.close(() => resolve()),
          );
          server.closeAllConnections();
          return stopped;
        }),
      );
    }
  },
);
