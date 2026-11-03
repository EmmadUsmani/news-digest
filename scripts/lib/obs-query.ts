import {
  type OperationsStatus,
  operationsStatusSchema,
} from '@digest/contracts';

const queueNames = [
  'operations',
  'ingestion',
  'digest-generation',
  'social-collection',
];

// Only local, read-only query endpoints. Never schedule work or read credentials.
export function obsRequest(
  args: string[],
  now = Date.now(),
): {
  url: string;
  init?: RequestInit;
} {
  const [command, ...rest] = args;
  if (command === 'health') {
    if (rest.length) throw new Error('health accepts no options');
    return { url: 'http://127.0.0.1:8000/healthz' };
  }
  if (command === 'services') {
    if (rest.length) throw new Error('services accepts no options');
    return metricRequest(
      [
        'news_digest_unit_active or news_digest_unit_snapshot_timestamp_seconds',
      ],
      now,
    );
  }
  if (command === 'sources') {
    if (rest.length) throw new Error('sources accepts no options');
    return { url: 'http://127.0.0.1:8000/api/status' };
  }
  if (command === 'targets') {
    if (rest.length) throw new Error('targets accepts no options');
    return { url: 'http://127.0.0.1:8428/metrics/api/v1/targets' };
  }
  if (command === 'jobs') {
    jobOptions(rest);
    return { url: 'http://127.0.0.1:8000/api/status' };
  }
  if (command === 'metric') return metricRequest(rest, now);
  if (command !== 'logs' && command !== 'errors')
    throw new Error(
      'Use: pnpm obs health|services|sources|targets [--check]; pnpm obs logs|errors [--since 1h] [--service worker] [--edition UUID] [--queue name] [--job ID] [--grep text] [--limit 40]; pnpm obs jobs [--check] [--queue name] [--state failed] [--limit 5]; pnpm obs metric <PromQL> [--since 1h] [--step 60s]',
    );
  const options = new Map<string, string>();
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i];
    const value = rest[i + 1];
    if (
      ![
        '--since',
        '--service',
        '--edition',
        '--queue',
        '--job',
        '--grep',
        '--limit',
      ].includes(key) ||
      value === undefined ||
      options.has(key)
    )
      throw new Error('Invalid or duplicate log option');
    options.set(key, value);
  }
  const since = options.get('--since') ?? '1h';
  if (!/^[1-9]\d{0,2}[mhd]$/.test(since))
    throw new Error('Invalid --since duration');
  const limit = options.get('--limit') ?? '40';
  if (!/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 200)
    throw new Error('--limit must be 1–200');
  const filters = [`_time:${since}`];
  if (command === 'errors')
    filters.push('level:in("error", "fatal", "50", "60")');
  const service = options.get('--service');
  if (service !== undefined) {
    if (
      ![
        'api',
        'worker',
        'docs',
        'schema',
        'postgres',
        'redis',
        'supervisor',
      ].includes(service)
    )
      throw new Error('Unknown service');
    filters.push(`service:${JSON.stringify(service)}`);
  }
  const edition = options.get('--edition');
  if (edition !== undefined) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        edition,
      )
    )
      throw new Error('Invalid edition UUID');
    filters.push(`editionId:${JSON.stringify(edition)}`);
  }
  const queue = options.get('--queue');
  if (queue !== undefined) {
    if (!queueNames.includes(queue)) throw new Error('Unknown queue');
    filters.push(`queue:=${JSON.stringify(queue)}`);
  }
  const job = options.get('--job');
  if (job !== undefined) {
    if (!job.trim() || job.length > 200 || /[\u0000-\u001f\u007f]/.test(job))
      throw new Error('--job must contain 1–200 characters without controls');
    filters.push(`jobId:=${JSON.stringify(job)}`);
  }
  const grep = options.get('--grep');
  if (grep !== undefined) {
    if (!grep.trim() || grep.length > 200)
      throw new Error('--grep must contain 1–200 characters');
    filters.push(`_msg:${JSON.stringify(grep)}`);
  }
  return {
    url: 'http://127.0.0.1:9428/logs/select/logsql/query',
    init: {
      method: 'POST',
      body: new URLSearchParams({
        query: `${filters.join(' ')} | sort by (_time) desc | limit ${Number(limit)}`,
      }),
    },
  };
}

// Opt-in exit semantics belong to the CLI; query consumers retain JSON output.
export async function runObsCli(
  args: string[],
  read: typeof fetch = fetch,
): Promise<{ output: string; exitCode: number }> {
  const checking = args.includes('--check');
  let queryArgs = args;
  if (checking) {
    if (
      !['health', 'services', 'sources', 'targets', 'jobs'].includes(args[0]) ||
      args.length !== 2 ||
      args[1] !== '--check'
    )
      throw new Error(
        '--check is supported only by health, services, sources, targets and jobs',
      );
    queryArgs = args.slice(0, 1);
  }
  const output = await runObs(queryArgs, read);
  let healthy = true;
  if (checking) {
    const body = JSON.parse(output);
    healthy =
      args[0] === 'jobs'
        ? queueNames.every((name) => {
            const matches = (body.queues as OperationsStatus['queues']).filter(
              (queue) => queue.name === name,
            );
            return (
              matches.length === 1 &&
              matches[0].available &&
              !matches[0].paused &&
              matches[0].workers > 0
            );
          })
        : body.healthy === true;
  }
  return { output, exitCode: healthy ? 0 : 1 };
}

export async function runObs(
  args: string[],
  read: typeof fetch = fetch,
): Promise<string> {
  const request = obsRequest(args);
  const response = await read(request.url, {
    ...request.init,
    signal: AbortSignal.timeout(10_000),
  });
  if (args[0] === 'health') {
    if (response.status !== 200 && response.status !== 503)
      throw new Error(`Local query failed: HTTP ${response.status}`);
    const body = (await response.json()) as Record<string, unknown> | null;
    if (
      !body ||
      typeof body.database !== 'boolean' ||
      typeof body.redis !== 'boolean' ||
      body.status !== (body.database && body.redis ? 'ok' : 'degraded') ||
      response.status !== (body.status === 'ok' ? 200 : 503)
    )
      throw new Error('Invalid local health response');
    return JSON.stringify({
      checkedAt: new Date().toISOString(),
      healthy: body.status === 'ok',
      status: body.status,
      database: body.database,
      redis: body.redis,
    });
  }
  if (!response.ok)
    throw new Error(`Local query failed: HTTP ${response.status}`);
  if (args[0] === 'services') {
    return JSON.stringify(serviceSummary(await response.json(), Date.now()));
  }
  if (args[0] === 'sources') {
    const snapshot = operationsStatusSchema
      .pick({ checkedAt: true, sources: true })
      .parse(await response.json());
    return JSON.stringify(sourceSummary(snapshot));
  }
  if (args[0] === 'targets') {
    return JSON.stringify(targetSummary(await response.json(), Date.now()));
  }
  if (args[0] === 'jobs') {
    const status = operationsStatusSchema
      .pick({ checkedAt: true, queues: true })
      .parse(await response.json());
    const options = jobOptions(args.slice(1));
    return JSON.stringify({
      checkedAt: status.checkedAt,
      queues: status.queues
        .filter((queue) => !options.queue || queue.name === options.queue)
        .map((queue) => {
          const matching = queue.runs.filter(
            (run) => !options.state || run.state === options.state,
          );
          return {
            ...queue,
            runs: matching.slice(0, options.limit),
            retainedRuns: queue.runs.length,
            matchingRuns: matching.length,
            omittedRuns: Math.max(0, matching.length - options.limit),
          };
        }),
    });
  }
  return response.text();
}

// Filter the existing status snapshot, never query/enqueue individual Redis jobs.
function jobOptions(args: string[]) {
  const options = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (
      !['--queue', '--state', '--limit'].includes(key) ||
      value === undefined ||
      options.has(key)
    )
      throw new Error('Invalid or duplicate job option');
    options.set(key, value);
  }
  const queue = options.get('--queue');
  if (queue !== undefined && !queueNames.includes(queue))
    throw new Error('Unknown queue');
  const state = options.get('--state');
  if (
    state !== undefined &&
    ![
      'waiting',
      'active',
      'delayed',
      'failed',
      'completed',
      'paused',
      'unknown',
    ].includes(state)
  )
    throw new Error('Unknown job state');
  const limit = options.get('--limit') ?? '5';
  if (!/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 20)
    throw new Error('--limit must be 1–20 for jobs');
  return { queue, state, limit: Number(limit) };
}

// Range queries have at most 1,000 evaluation timestamps per returned series.
function metricRequest(args: string[], now: number) {
  const [query, ...rest] = args;
  if (!query?.trim()) throw new Error('Metric query is required');
  const options = new Map<string, string>();
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i];
    const value = rest[i + 1];
    if (
      !['--since', '--step'].includes(key) ||
      value === undefined ||
      options.has(key)
    )
      throw new Error('Invalid or duplicate metric option');
    options.set(key, value);
  }
  const params = new URLSearchParams({ query });
  if (!options.size)
    return { url: `http://127.0.0.1:8428/metrics/api/v1/query?${params}` };
  const since = options.get('--since');
  if (!since) throw new Error('--step requires --since');
  const seconds = (value: string) => {
    const match = /^([1-9]\d{0,5})([smhd])$/.exec(value);
    if (!match)
      throw new Error(
        'Metric durations require positive integers and s/m/h/d units',
      );
    return Number(match[1]) * { s: 1, m: 60, h: 3600, d: 86400 }[match[2]]!;
  };
  const window = seconds(since);
  if (window > 7 * 86400)
    throw new Error('Metric history is limited to 7 days');
  const step = seconds(options.get('--step') ?? '60s');
  if (step < 30 || step > window || Math.floor(window / step) + 1 > 1000)
    throw new Error(
      'Metric step must be at least 30s, no longer than the window, and return at most 1000 timestamps',
    );
  const end = Math.floor(now / 1000);
  params.set('start', String(end - window));
  params.set('end', String(end));
  params.set('step', String(step));
  return { url: `http://127.0.0.1:8428/metrics/api/v1/query_range?${params}` };
}

// The configured collectors scrape every 30 seconds. Allow four intervals.
export function targetSummary(body: unknown, now: number) {
  const result = body as {
    status?: string;
    data?: {
      activeTargets?: Array<{
        health?: string;
        lastScrape?: string;
        labels?: { job?: string; instance?: string };
      }>;
    };
  } | null;
  if (
    result?.status !== 'success' ||
    !Array.isArray(result.data?.activeTargets)
  )
    throw new Error('Invalid local target response');
  const targets = result.data.activeTargets.map((target) => {
    const scrapedAt = Date.parse(target.lastScrape ?? '');
    const age =
      Number.isFinite(scrapedAt) && scrapedAt <= now
        ? (now - scrapedAt) / 1000
        : null;
    const state =
      target.health === 'down'
        ? 'down'
        : age === null
          ? 'unknown'
          : age > 120
            ? 'stale'
            : target.health === 'up'
              ? 'up'
              : 'unknown';
    return {
      job: target.labels?.job ?? null,
      instance: target.labels?.instance ?? null,
      state,
      lastScrape: age === null ? null : target.lastScrape,
      ageSeconds: age,
    };
  });
  targets.sort(
    (a, b) =>
      Number(a.state === 'up') - Number(b.state === 'up') ||
      (a.job ?? '').localeCompare(b.job ?? ''),
  );
  return {
    checkedAt: new Date(now).toISOString(),
    healthy:
      targets.length > 0 && targets.every((target) => target.state === 'up'),
    total: targets.length,
    unhealthy: targets.filter((target) => target.state !== 'up').length,
    omitted: Math.max(0, targets.length - 50),
    targets: targets.slice(0, 50),
  };
}

// Collection freshness is judged at the server snapshot, not the CLI clock.
export function sourceSummary(
  snapshot: Pick<OperationsStatus, 'checkedAt' | 'sources'>,
) {
  const checkedAt = Date.parse(snapshot.checkedAt);
  const sources = snapshot.sources.map((source) => {
    const success = source.lastSuccess ? Date.parse(source.lastSuccess) : NaN;
    const ageSeconds =
      Number.isFinite(success) && success <= checkedAt
        ? Math.floor((checkedAt - success) / 1000)
        : null;
    const state = !source.active
      ? 'inactive'
      : source.error !== null
        ? 'error'
        : ageSeconds === null
          ? 'unknown'
          : ageSeconds > 7200
            ? 'stale'
            : 'ok';
    return {
      id: source.id,
      state,
      lastAttempt: source.lastAttempt,
      lastSuccess: source.lastSuccess,
      ageSeconds,
      lastItemCount: source.lastItemCount,
      storedItems: source.storedItems,
    };
  });
  const unhealthy = sources.filter(
    (source) => !['ok', 'inactive'].includes(source.state),
  ).length;
  const priority: Record<string, number> = {
    error: 0,
    unknown: 1,
    stale: 2,
    ok: 3,
    inactive: 4,
  };
  sources.sort(
    (a, b) => priority[a.state] - priority[b.state] || a.id.localeCompare(b.id),
  );
  return {
    checkedAt: snapshot.checkedAt,
    healthy: sources.length > 0 && unhealthy === 0,
    total: sources.length,
    unhealthy,
    omitted: Math.max(0, sources.length - 50),
    sources: sources.slice(0, 50),
  };
}

// Require the deployed units even when a series disappears from the collector.
export function serviceSummary(body: unknown, now: number) {
  const result = body as {
    status?: string;
    data?: {
      resultType?: string;
      result?: Array<{
        metric: Record<string, string>;
        value: [number, string];
      }>;
    };
  } | null;
  if (
    result?.status !== 'success' ||
    result.data?.resultType !== 'vector' ||
    !Array.isArray(result.data.result)
  )
    throw new Error('Invalid local service response');
  const rows = result.data.result;
  const snapshots = rows.filter(
    (row) =>
      row.metric?.__name__ === 'news_digest_unit_snapshot_timestamp_seconds',
  );
  const timestamp =
    snapshots.length === 1 ? Number(snapshots[0].value?.[1]) : NaN;
  const age =
    Number.isFinite(timestamp) && timestamp > 0 && timestamp <= now / 1000
      ? now / 1000 - timestamp
      : null;
  const expected = [
    ...['api', 'worker', 'docs', 'schema', 'agent'].map((role) => ({
      unit: `news-digest-${role}.service`,
      scope: 'user',
    })),
    ...[
      'grafana',
      'logs',
      'metrics',
      'node',
      'postgres',
      'redis',
      'shipper',
    ].map((role) => ({ unit: `obs-${role}.service`, scope: 'system' })),
  ];
  const services = expected.map((unit) => {
    const matches = rows.filter(
      (row) =>
        row.metric?.__name__ === 'news_digest_unit_active' &&
        row.metric.unit === unit.unit &&
        row.metric.scope === unit.scope,
    );
    const value = matches.length === 1 ? matches[0].value?.[1] : undefined;
    const state =
      age === null || !['0', '1'].includes(value ?? '')
        ? 'unknown'
        : age > 120
          ? 'stale'
          : value === '1'
            ? 'active'
            : 'inactive';
    return { ...unit, state };
  });
  services.sort(
    (a, b) =>
      Number(a.state === 'active') - Number(b.state === 'active') ||
      a.unit.localeCompare(b.unit),
  );
  const unhealthy = services.filter((unit) => unit.state !== 'active').length;
  return {
    checkedAt: new Date(now).toISOString(),
    snapshotAgeSeconds: age,
    healthy: unhealthy === 0,
    total: services.length,
    unhealthy,
    services,
  };
}
