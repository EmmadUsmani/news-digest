import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export type AlertEvent = {
  id?: string;
  time: string;
  state: 'firing' | 'resolved';
  name: string;
  severity: string;
  summary: string;
};

export abstract class AlertDestination {
  abstract readonly id: string;
  abstract send(event: AlertEvent): Promise<void>;
}

type Snapshot = Record<string, Omit<AlertEvent, 'time' | 'state'>>;
type State = {
  active: Snapshot;
  pending: { event: AlertEvent; destinations: string[] }[];
};

// Identity includes every label, so two instances of the same rule resolve independently.
export function firingSnapshot(value: unknown): Snapshot {
  const body = value as {
    status?: string;
    data?: {
      alerts?: {
        state: string;
        labels: Record<string, string>;
        annotations?: Record<string, string>;
      }[];
    };
  };
  if (body?.status !== 'success' || !Array.isArray(body.data?.alerts))
    throw new Error('Invalid evaluator response');
  const result: Snapshot = {};
  for (const alert of body.data.alerts) {
    if (
      !['pending', 'firing', 'inactive'].includes(alert.state) ||
      typeof alert.labels?.alertname !== 'string' ||
      Object.values(alert.labels).some((value) => typeof value !== 'string')
    )
      throw new Error('Invalid evaluator alert');
    if (alert.state !== 'firing') continue;
    const key = JSON.stringify(
      Object.entries(alert.labels).sort(([a], [b]) => a.localeCompare(b)),
    );
    result[key] = {
      name: alert.labels.alertname,
      severity: alert.labels.severity ?? 'warning',
      summary: alert.annotations?.summary ?? alert.labels.alertname,
    };
  }
  return result;
}

export async function dispatchAlerts(options: {
  statePath: string;
  destinations: AlertDestination[];
  readAlerts: () => Promise<unknown>;
  now?: () => string;
}) {
  const { statePath, destinations } = options;
  await mkdir(dirname(statePath), { recursive: true, mode: 0o700 });
  let state: State;
  try {
    state = JSON.parse(await readFile(statePath, 'utf8')) as State;
    if (!state.active || !Array.isArray(state.pending))
      throw new Error('Invalid dispatcher state');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    state = { active: {}, pending: [] };
  }
  const save = async () => {
    await writeFile(`${statePath}.tmp`, JSON.stringify(state), { mode: 0o600 });
    await rename(`${statePath}.tmp`, statePath);
  };
  let active: Snapshot;
  try {
    active = firingSnapshot(await options.readAlerts());
  } catch {
    // An unavailable evaluator cannot establish that any real alert has resolved.
    active = {
      ...state.active,
      evaluator: {
        name: 'AlertEvaluatorUnavailable',
        severity: 'critical',
        summary: 'Local alert evaluator is unavailable',
      },
    };
  }
  const time = options.now?.() ?? new Date().toISOString();
  for (const key of new Set([
    ...Object.keys(state.active),
    ...Object.keys(active),
  ])) {
    if (Boolean(state.active[key]) === Boolean(active[key])) continue;
    state.pending.push({
      event: {
        id: randomUUID(),
        time,
        state: active[key] ? 'firing' : 'resolved',
        ...(active[key] ?? state.active[key]),
      },
      destinations: destinations.map((destination) => destination.id),
    });
  }
  state.active = active;
  await save();
  // Preserve order independently for each destination. A failed adapter cannot block another.
  let failures = 0;
  for (const destination of destinations) {
    for (const pending of state.pending) {
      if (!pending.destinations.includes(destination.id)) continue;
      try {
        await destination.send(pending.event);
      } catch {
        failures++;
        break;
      }
      pending.destinations = pending.destinations.filter(
        (id) => id !== destination.id,
      );
      await save();
    }
  }
  state.pending = state.pending.filter(
    (pending) => pending.destinations.length,
  );
  await save();
  return { failures, queued: state.pending.length };
}
