import assert from 'node:assert/strict';
import test from 'node:test';

import { browserErrorReceiver } from '../src/modules/operations/adapters/browser-errors';

void test('browser reports reject arbitrary private fields and unsafe locations', () => {
  const reports: unknown[] = [];
  const receive = browserErrorReceiver((report) => reports.push(report));
  const valid = {
    kind: 'error',
    errorType: 'TypeError',
    asset: 'index-abc123.js',
    line: 42,
    column: 2,
  };
  assert.equal(receive(valid), 204);
  for (const body of [
    null,
    { ...valid, message: 'secret' },
    { ...valid, stack: 'private' },
    { ...valid, asset: 'https://example.com/private?key=secret' },
    { ...valid, errorType: 'secret' },
    { ...valid, line: -1 },
  ])
    assert.equal(receive(body), 400);
  assert.deepEqual(reports, [valid]);
});

void test('browser log admission is globally bounded and resets without retaining clients', () => {
  let time = 0;
  let count = 0;
  const receive = browserErrorReceiver(
    () => count++,
    () => time,
  );
  const body = { kind: 'unhandledrejection', errorType: 'Unknown' };
  for (let i = 0; i < 20; i++) assert.equal(receive(body), 204);
  assert.equal(receive(body), 429);
  assert.equal(count, 20);
  time = 60_000;
  assert.equal(receive(body), 204);
  assert.equal(count, 21);
});
