import type { ClientBase } from 'pg';

import { logger } from '../observability/logging';

// Process-wide cap, shared by every pool. SQL, parameters and errors never enter
// the record. Timings include network/decoding, but exclude pool acquisition.
export function slowQueryRecorder(
  emit = (record: Record<string, string | number>) =>
    logger.warn(record, 'Slow database call'),
  now = () => performance.now(),
) {
  let windowStart = now();
  let emitted = 0;
  let suppressed = 0;
  return (durationMs: number, outcome: 'success' | 'failure') => {
    if (!Number.isFinite(durationMs) || durationMs < 250) return;
    const time = now();
    if (time - windowStart >= 60_000) {
      windowStart = time;
      emitted = 0;
    }
    if (emitted >= 10) {
      suppressed++;
      return;
    }
    emitted++;
    emit({
      event: 'database.slow_query',
      durationMs: Math.round(durationMs),
      outcome,
      suppressed,
    });
    suppressed = 0;
  };
}
const recordSlowQuery = slowQueryRecorder();
const observed = new WeakSet<ClientBase>();

export function observeClientQueries(
  client: ClientBase,
  record = recordSlowQuery,
  now = () => performance.now(),
) {
  if (observed.has(client)) return;
  observed.add(client);
  const query = client.query.bind(client) as (...args: unknown[]) => unknown;
  client.query = function (this: ClientBase, ...args: unknown[]) {
    // Custom Query/stream objects retain their native event semantics and are
    // outside this observer. Application repositories use promises/callbacks.
    if (typeof (args[0] as { submit?: unknown })?.submit === 'function')
      return Reflect.apply(query, this, args);
    const started = now();
    let settled = false;
    const finish = (failed: boolean) => {
      if (settled) return;
      settled = true;
      record(now() - started, failed ? 'failure' : 'success');
    };
    const callback = args[args.length - 1];
    if (typeof callback === 'function') {
      args[args.length - 1] = function (this: unknown, ...values: unknown[]) {
        finish(Boolean(values[0]));
        return Reflect.apply(
          callback as (...values: unknown[]) => unknown,
          this,
          values,
        );
      };
    }
    try {
      const result = Reflect.apply(query, this, args);
      if (typeof callback !== 'function' && isPromise(result)) {
        return result.then(
          (value: unknown) => {
            finish(false);
            return value;
          },
          (error: unknown) => {
            finish(true);
            throw error;
          },
        );
      }
      return result;
    } catch (error) {
      finish(true);
      throw error;
    }
  } as typeof client.query;
}

function isPromise(value: unknown): value is PromiseLike<unknown> {
  return (
    value != null &&
    typeof value === 'object' &&
    'then' in value &&
    typeof value.then === 'function'
  );
}
