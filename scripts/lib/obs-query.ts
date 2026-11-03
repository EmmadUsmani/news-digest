// Only local, read-only query endpoints. Never schedule work or read credentials.
export function obsRequest(args: string[]): {
  url: string;
  init?: RequestInit;
} {
  const [command, ...rest] = args;
  if (command === 'jobs' && rest.length === 0)
    return { url: 'http://127.0.0.1:8000/api/status' };
  if (command === 'metric' && rest.length === 1 && rest[0].trim())
    return {
      url: `http://127.0.0.1:8428/metrics/api/v1/query?${new URLSearchParams({ query: rest[0] })}`,
    };
  if (command !== 'logs' && command !== 'errors')
    throw new Error(
      'Use: pnpm obs logs|errors [--since 1h] [--service worker] [--edition UUID] [--grep text] [--limit 40]; pnpm obs jobs; pnpm obs metric <PromQL>',
    );
  const options = new Map<string, string>();
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i];
    const value = rest[i + 1];
    if (
      !['--since', '--service', '--edition', '--grep', '--limit'].includes(
        key,
      ) ||
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

export async function runObs(
  args: string[],
  read: typeof fetch = fetch,
): Promise<string> {
  const request = obsRequest(args);
  const response = await read(request.url, {
    ...request.init,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok)
    throw new Error(`Local query failed: HTTP ${response.status}`);
  if (args[0] === 'jobs') {
    const status = (await response.json()) as {
      checkedAt: string;
      queues: unknown[];
    };
    return JSON.stringify({
      checkedAt: status.checkedAt,
      queues: status.queues,
    });
  }
  return response.text();
}
