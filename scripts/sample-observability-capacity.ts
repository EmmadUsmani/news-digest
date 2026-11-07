// Read cgroups directly so a saturated metrics store cannot hide its own load.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';

async function main() {
  const intervals = Number(process.argv[2] ?? 6);
  const seconds = Number(process.argv[3] ?? 10);
  if (
    !Number.isInteger(intervals) ||
    intervals < 1 ||
    intervals > 360 ||
    !Number.isFinite(seconds) ||
    seconds < 1 ||
    seconds > 60
  )
    throw new Error(
      'Usage: tsx scripts/sample-observability-capacity.ts [intervals 1–360] [seconds 1–60]',
    );

  const roles = [
    'alerts',
    'grafana',
    'logs',
    'metrics',
    'node',
    'postgres',
    'redis',
    'shipper',
  ];
  const units = roles.map((role) => {
    const unit = `obs-${role}.service`;
    const properties = Object.fromEntries(
      execFileSync(
        'systemctl',
        [
          'show',
          unit,
          '-p',
          'ControlGroup',
          '-p',
          'ActiveState',
          '-p',
          'InvocationID',
        ],
        { encoding: 'utf8' },
      )
        .trim()
        .split('\n')
        .map((line) => {
          const separator = line.indexOf('=');
          return [line.slice(0, separator), line.slice(separator + 1)];
        }),
    );
    if (properties.ActiveState !== 'active' || !properties.ControlGroup)
      throw new Error(`${unit} is not active`);
    return {
      unit,
      properties,
      path: resolve('/sys/fs/cgroup', `.${properties.ControlGroup}`),
    };
  });
  function counters(path: string) {
    return Object.fromEntries(
      readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .map((line) => {
          const [key, value] = line.split(/\s+/);
          return [key, Number(value)];
        }),
    );
  }
  function snapshot() {
    return units.map(({ path }) => ({
      cpu: counters(`${path}/cpu.stat`),
      memory: Number(readFileSync(`${path}/memory.current`, 'utf8')),
      events: counters(`${path}/memory.events`),
    }));
  }
  const startedAt = new Date().toISOString();
  const startTime = performance.now();
  const first = snapshot();
  let last = first;
  const totalMemory = (sample: typeof first) =>
    sample.reduce((sum, item) => sum + item.memory, 0);
  let peakMemory = totalMemory(first);
  for (let index = 0; index < intervals; index++) {
    await setTimeout(seconds * 1000);
    last = snapshot();
    peakMemory = Math.max(peakMemory, totalMemory(last));
  }
  const elapsedSeconds = (performance.now() - startTime) / 1000;
  const results = units.map(({ unit, properties }, index) => {
    const invocation = execFileSync(
      'systemctl',
      ['show', unit, '-p', 'InvocationID', '--value'],
      { encoding: 'utf8' },
    ).trim();
    if (invocation !== properties.InvocationID)
      throw new Error(`${unit} restarted; discard sample`);
    const before = first[index];
    const after = last[index];
    const delta = (end: number, start: number) => {
      if (!Number.isFinite(end) || !Number.isFinite(start) || end < start)
        throw new Error(`${unit}: invalid/reset counter; discard sample`);
      return end - start;
    };
    return {
      unit,
      cpuPercent:
        delta(after.cpu.usage_usec, before.cpu.usage_usec) /
        (elapsedSeconds * 10000),
      endingMemoryBytes: after.memory,
      periods: delta(after.cpu.nr_periods, before.cpu.nr_periods),
      throttledPeriods: delta(after.cpu.nr_throttled, before.cpu.nr_throttled),
      memoryHighEvents: delta(after.events.high, before.events.high),
      oomEvents: delta(after.events.oom, before.events.oom),
      oomKills: delta(after.events.oom_kill, before.events.oom_kill),
    };
  });
  console.log(
    JSON.stringify({
      startedAt,
      elapsedSeconds,
      snapshots: intervals + 1,
      cpuPercent: results.reduce((sum, row) => sum + row.cpuPercent, 0),
      startingMemoryBytes: totalMemory(first),
      endingMemoryBytes: totalMemory(last),
      sampledPeakMemoryBytes: peakMemory,
      units: results,
    }),
  );
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
