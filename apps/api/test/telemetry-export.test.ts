import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import {
  boundedTelemetryExport,
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
  for (const bad of [
    target + '&match%5B%5D=up',
    target + '&start=100',
    target + '&limit=1',
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

void test('export transport buffers exact cap and aborts overflow, deadline and caller cancellation', async () => {
  const closed = new Set<string>();
  const server = createServer((req, res) => {
    res.on('close', () => closed.add(req.url!));
    if (req.url === '/redirect') {
      res.writeHead(302, { location: '/ok' }).end();
      return;
    }
    if (req.url === '/headers') return;
    res.writeHead(200, {
      'content-type':
        req.url === '/html' ? 'text/html' : 'application/stream+json',
    });
    if (req.url === '/stall' || req.url === '/cancel') {
      res.write('partial');
      return;
    }
    res.end(Buffer.alloc(req.url === '/overflow' ? 65537 : 65536, 32));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const read = (
    path: string,
    signal = new AbortController().signal,
    timeout = 2000,
  ) => readBoundedTelemetryExport(new URL(path, base), signal, timeout);
  try {
    assert.equal((await read('/ok')).length, 65536);
    for (const path of ['/overflow', '/html', '/redirect'])
      await assert.rejects(read(path));
    for (const path of ['/headers', '/stall'])
      await assert.rejects(read(path, undefined, 80));
    const caller = new AbortController();
    const pending = read('/cancel', caller.signal);
    setTimeout(() => caller.abort(), 80);
    await assert.rejects(pending);
    const alreadyAborted = AbortSignal.abort();
    await assert.rejects(read('/never', alreadyAborted));
    await new Promise((resolve) => setTimeout(resolve, 50));
    for (const path of ['/overflow', '/headers', '/stall', '/cancel'])
      assert.ok(closed.has(path), path);
    assert.equal(closed.has('/never'), false);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
