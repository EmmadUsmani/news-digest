import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { statfsSync, statSync } from 'node:fs';
import { uptime } from 'node:os';

import { checkLogRedaction } from './check-log-redaction';

const store = 'http://127.0.0.1:9428/logs';
async function query(expression: string) {
  const response = await fetch(`${store}/select/logsql/query`, {
    method: 'POST',
    body: new URLSearchParams({ query: expression }),
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, 200);
  return (await response.text())
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, string>);
}

export async function checkLogStore() {
  await checkLogRedaction();
  const flags = await (await fetch(`${store}/flags`)).text();
  for (const flag of [
    '-httpListenAddr="127.0.0.1:9428"',
    '-retentionPeriod="14d"',
    '-retention.maxDiskSpaceUsageBytes="1800MB"',
  ])
    assert.ok(flags.includes(flag), `Required log store flag: ${flag}`);
  assert.equal(
    statSync('/var/lib/news-digest-observability/logs.ext4').size,
    2_000_000_000,
  );
  const filesystem = statfsSync('/var/lib/news-digest-logs');
  assert.ok(
    filesystem.blocks * filesystem.bsize <= 2_000_000_000,
    'Mounted log filesystem must enforce the hard cap',
  );
  const services = await query('* | stats by (service) count()');
  for (const service of [
    'api',
    'worker',
    'docs',
    'schema',
    'postgres',
    'redis',
    'supervisor',
  ])
    assert.ok(
      services.some(
        (row) => row.service === service && Number(row['count(*)']) > 0,
      ),
      `No collected records for ${service}`,
    );

  // This fresh real API request must travel through journald and Fluent Bit.
  const started = Date.now();
  const response = await fetch('http://127.0.0.1:8000/healthz');
  await response.text();
  const requestId = response.headers.get('x-request-id');
  assert.ok(requestId);
  let found = false;
  while (Date.now() - started < 60_000) {
    if ((await query(`service:api requestId:${requestId} | limit 1`)).length) {
      found = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  assert.ok(found, 'Fresh journal request must be queryable within 60 seconds');
  const resources = ['obs-logs', 'obs-shipper'].map((unit) => {
    const fields = Object.fromEntries(
      execFileSync(
        'systemctl',
        [
          'show',
          unit,
          '-p',
          'ActiveState',
          '-p',
          'MemoryCurrent',
          '-p',
          'MemoryMax',
          '-p',
          'CPUQuotaPerSecUSec',
          '-p',
          'Nice',
          '-p',
          'CPUWeight',
          '-p',
          'IOWeight',
          '-p',
          'CPUUsageNSec',
          '-p',
          'ActiveEnterTimestampMonotonic',
        ],
        { encoding: 'utf8' },
      )
        .trim()
        .split('\n')
        .map((line) => line.split('=')),
    );
    assert.equal(fields.ActiveState, 'active');
    assert.equal(fields.Nice, '10');
    assert.equal(fields.CPUWeight, '10');
    assert.equal(fields.IOWeight, '10');
    assert.equal(
      fields.CPUQuotaPerSecUSec,
      unit === 'obs-logs' ? '30ms' : '10ms',
    );
    const limit = unit === 'obs-logs' ? 160 : 80;
    assert.equal(Number(fields.MemoryMax), limit * 1048576);
    return {
      service: unit,
      memoryMiB: Math.round(Number(fields.MemoryCurrent) / 1048576),
      averageCpuPercentSinceStart:
        Math.round(
          (Number(fields.CPUUsageNSec) /
            1e9 /
            (uptime() - Number(fields.ActiveEnterTimestampMonotonic) / 1e6)) *
            1000,
        ) / 10,
    };
  });
  const freshRequestQueryMs = Date.now() - started;
  const ui = await fetch('http://127.0.0.1:8000/logs/select/vmui/');
  assert.equal(ui.status, 200);
  assert.match(await ui.text(), /VictoriaLogs/);
  return {
    redaction: 'passed (isolated dummy input)',
    collectedServices: services.map((row) => row.service),
    freshRequestQueryMs,
    retentionDays: 14,
    hardFilesystemBytes: 2_000_000_000,
    resources,
  };
}
