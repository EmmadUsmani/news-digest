import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ClientBase } from 'pg';

import {
  observeClientQueries,
  slowQueryRecorder,
} from '../src/libs/db/slow-queries';

void test('slow durations are thresholded, capped process-wide and contain only safe fields', () => {
  let time = 0;
  const records: Record<string, string | number>[] = [];
  const record = slowQueryRecorder(
    (row) => records.push(row),
    () => time,
  );
  for (const duration of [0, 249.99, NaN, Infinity])
    record(duration, 'success');
  assert.equal(records.length, 0);
  for (let i = 0; i < 13; i++) record(250.1, 'failure');
  assert.equal(records.length, 10);
  time = 60_000;
  record(400, 'success');
  assert.deepEqual(records.at(-1), {
    event: 'database.slow_query',
    durationMs: 400,
    outcome: 'success',
    suppressed: 3,
  });
  record(500, 'success');
  assert.equal(records.at(-1)?.suppressed, 0);
  assert.ok(
    records.every(
      (row) =>
        Object.keys(row).sort().join(',') ===
        'durationMs,event,outcome,suppressed',
    ),
  );
});

void test('observer preserves promises, errors, callbacks and receivers without SQL or results', async () => {
  let time = 0;
  const records: unknown[][] = [];
  const failure = new Error('private SQL and parameters');
  const result = { rows: [{ private: 'result' }] };
  const client = {
    query(this: unknown, text: unknown, ...args: unknown[]) {
      assert.equal(this, client);
      time += 300;
      if (text === 'throw') throw failure;
      const callback = args.at(-1);
      if (typeof callback === 'function') {
        callback.call(client, text === 'fail' ? failure : null, result);
        return undefined;
      }
      return text === 'fail'
        ? Promise.reject(failure)
        : Promise.resolve(result);
    },
  } as unknown as ClientBase;
  observeClientQueries(
    client,
    (...args) => records.push(args),
    () => time,
  );
  observeClientQueries(client, () => assert.fail('must not wrap twice'));
  assert.equal(
    await client.query('private SQL', ['private parameter']),
    result,
  );
  await assert.rejects(client.query('fail'), (error) => error === failure);
  assert.throws(
    () => client.query('throw'),
    (error) => error === failure,
  );
  client.query('callback', function (this: unknown, error, value) {
    assert.equal(this, client);
    assert.equal(error, null);
    assert.equal(value, result);
  });
  client.query('fail', (error) => assert.equal(error, failure));
  assert.deepEqual(records, [
    [300, 'success'],
    [300, 'failure'],
    [300, 'failure'],
    [300, 'success'],
    [300, 'failure'],
  ]);
});
