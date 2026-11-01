import { test } from 'node:test';
import assert from 'node:assert/strict';
import { operationsStatusSchema } from '@digest/contracts';
import { OperationsStatus } from '../src/modules/operations/adapters/operations.status';

test('operations reports persisted sources and bounded queue telemetry without job payloads', async () => {
  const status = new OperationsStatus();
  try {
    const result = operationsStatusSchema.parse(
      JSON.parse(JSON.stringify(await status.read())),
    );
    assert.ok(result.sources.length >= 7);
    assert.equal(result.queues.length, 3);
    for (const queue of result.queues) {
      assert.equal(queue.available, true);
      assert.ok(queue.runs.length <= 20);
      assert.ok(queue.counts.failed >= 0);
    }
    for (const source of result.sources) assert.ok(source.storedItems >= 0);
    const raw = JSON.stringify(await status.read());
    assert.equal(raw.includes('stacktrace'), false);
    assert.equal(raw.includes('failedReason'), false);
    assert.equal(raw.includes('DATABASE_URL'), false);
  } finally {
    await status.onModuleDestroy();
  }
});
