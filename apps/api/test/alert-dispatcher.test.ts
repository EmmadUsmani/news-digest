import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  AlertDestination,
  dispatchAlerts,
} from '../../../scripts/lib/alerting/dispatcher';
import {
  FileAlertDestination,
  recentAlertEvents,
} from '../../../scripts/lib/alerting/file-destination';

const snapshot = (state: string, instance = 'one') => ({
  status: 'success',
  data: {
    alerts: [
      {
        state,
        labels: { alertname: 'ServiceDown', severity: 'critical', instance },
        annotations: { summary: 'Monitored service is down' },
      },
    ],
  },
});
const empty = { status: 'success', data: { alerts: [] } };

async function fixture(run: (directory: string) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), 'alert-dispatch-'));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

void test('pending ignored; firing/resolution once across new dispatcher instances, labels distinguish alerts', async () => {
  await fixture(async (directory) => {
    const path = join(directory, 'alerts.jsonl');
    const dispatch = (value: unknown) =>
      dispatchAlerts({
        statePath: join(directory, 'state.json'),
        destinations: [new FileAlertDestination(path)],
        readAlerts: async () => value,
      });
    await dispatch(snapshot('pending'));
    await dispatch(snapshot('firing'));
    await dispatch(snapshot('firing'));
    await dispatch(snapshot('firing', 'two'));
    await dispatch(empty);
    await dispatch(empty);
    assert.deepEqual(
      (await recentAlertEvents(path)).map((event) => event.state),
      ['firing', 'resolved', 'firing', 'resolved'],
    );
    assert.equal((await stat(path)).mode & 0o777, 0o600);
  });
});

void test('evaluator outage recorded once without resolving real alerts, recovery once', async () => {
  await fixture(async (directory) => {
    const path = join(directory, 'alerts.jsonl');
    let unavailable = false;
    const dispatch = () =>
      dispatchAlerts({
        statePath: join(directory, 'state.json'),
        destinations: [new FileAlertDestination(path)],
        readAlerts: async () => {
          if (unavailable) throw new Error('offline');
          return snapshot('firing');
        },
      });
    await dispatch();
    unavailable = true;
    await dispatch();
    await dispatch();
    unavailable = false;
    await dispatch();
    await dispatch();
    assert.deepEqual(
      (await recentAlertEvents(path)).map(({ name, state }) => [name, state]),
      [
        ['ServiceDown', 'firing'],
        ['AlertEvaluatorUnavailable', 'firing'],
        ['AlertEvaluatorUnavailable', 'resolved'],
      ],
    );
  });
});

void test('destination failure cannot block file; persistent retries deliver in order without repeating file', async () => {
  await fixture(async (directory) => {
    const path = join(directory, 'alerts.jsonl');
    let fail = true;
    const delivered: string[] = [];
    class Failing extends AlertDestination {
      readonly id = 'test';
      async send(event: { state: string }) {
        if (fail) throw new Error('destination failed');
        delivered.push(event.state);
      }
    }
    const dispatch = (value: unknown) =>
      dispatchAlerts({
        statePath: join(directory, 'state.json'),
        destinations: [new Failing(), new FileAlertDestination(path)],
        readAlerts: async () => value,
      });
    assert.equal((await dispatch(snapshot('firing'))).failures, 1);
    await dispatch(empty);
    assert.equal((await recentAlertEvents(path)).length, 2);
    fail = false;
    assert.equal((await dispatch(empty)).queued, 0);
    assert.deepEqual(delivered, ['firing', 'resolved']);
    assert.equal((await recentAlertEvents(path)).length, 2);
  });
});

void test('file rotates at configured bound with only one old copy; recent events cross rotation', async () => {
  await fixture(async (directory) => {
    const path = join(directory, 'alerts.jsonl');
    const adapter = new FileAlertDestination(path, 300);
    for (let index = 0; index < 9; index++)
      await adapter.send({
        time: `${index}`,
        state: 'firing',
        name: 'Test',
        severity: 'warning',
        summary: 'Test summary',
      });
    assert.ok((await stat(path)).size <= 300);
    assert.ok((await stat(`${path}.1`)).size <= 300);
    assert.equal((await recentAlertEvents(path)).at(-1)?.time, '8');
    assert.ok((await readFile(path, 'utf8')).endsWith('\n'));
  });
});

void test('file retry after interrupted state acknowledgement does not append twice', async () => {
  await fixture(async (directory) => {
    const path = join(directory, 'alerts.jsonl');
    const event = {
      id: 'durable-event',
      time: 'now',
      state: 'firing' as const,
      name: 'Test',
      severity: 'warning',
      summary: 'Test',
    };
    await new FileAlertDestination(path).send(event);
    await new FileAlertDestination(path).send(event);
    assert.equal((await recentAlertEvents(path)).length, 1);
  });
});
