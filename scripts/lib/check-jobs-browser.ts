import assert from 'node:assert/strict';

export async function checkJobsBrowser() {
  const base = 'http://127.0.0.1:8000/queues';
  const response = await fetch(`${base}/api/queues`);
  assert.equal(response.status, 200);
  const { queues } = await response.json();
  const names = [
    'operations',
    'ingestion',
    'digest-generation',
    'social-collection',
  ];
  assert.deepEqual(
    queues.map((q: { name: string }) => q.name).sort(),
    [...names].sort(),
  );
  for (const queue of queues) assert.equal(queue.readOnlyMode, true);
  const schedulesResponse = await fetch(`${base}/api/job-schedulers`);
  assert.equal(schedulesResponse.status, 200);
  const { schedulers } = await schedulesResponse.json();
  for (const name of names)
    assert.ok(
      schedulers.some(
        (s: { queueName: string; next: number }) =>
          s.queueName === name && Number.isFinite(s.next),
      ),
      `${name} must show its next scheduled run`,
    );
  // No mutation payload: verify the HTTP barrier, never enqueue or retry work.
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    const result = await fetch(`${base}/api/queues/pause`, { method });
    assert.equal(result.status, 405);
  }
  return { queues: names.length, schedules: schedulers.length, readOnly: true };
}
