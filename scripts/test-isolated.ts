// Always replace inherited service URLs and credentials before starting tests.
import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';

const containers: string[] = [];
const docker = (...args: string[]) =>
  execFileSync('docker', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
function start(image: string, port: number, extra: string[] = []) {
  const id = docker(
    'run',
    '--rm',
    '-d',
    '-p',
    `127.0.0.1::${port}`,
    ...extra,
    image,
  );
  containers.push(id);
  const binding = docker('port', id, `${port}/tcp`);
  return { id, port: Number(binding.split(':').at(-1)) };
}
async function ready(id: string, command: string[]) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      docker('exec', id, ...command);
      return;
    } catch {
      await setTimeout(100);
    }
  }
  throw new Error('Disposable test service did not become ready');
}
async function main() {
  try {
    const postgres = start('postgres:17-alpine', 5432, [
      '-e',
      'POSTGRES_HOST_AUTH_METHOD=trust',
    ]);
    const redis = start('redis:7-alpine', 6379);
    await Promise.all([
      ready(postgres.id, ['pg_isready', '-U', 'postgres']),
      ready(redis.id, ['redis-cli', 'ping']),
    ]);
    const env = {
      ...process.env,
      DATABASE_URL: `postgres://postgres@127.0.0.1:${postgres.port}/postgres`,
      REDIS_URL: `redis://127.0.0.1:${redis.port}`,
      ANTHROPIC_API_KEY: '',
      NEWS_DIGEST_ISOLATED_TEST: '1',
    };
    const run = (args: string[]) => {
      const result = spawnSync('pnpm', ['exec', 'tsx', ...args], {
        env,
        stdio: 'inherit',
      });
      if (result.error) throw result.error;
      if (result.status !== 0)
        throw new Error(`Test command failed (${result.status})`);
    };
    run(['apps/api/src/libs/db/migrate.ts']);
    run([
      '--test',
      '--test-concurrency=1',
      ...readdirSync('apps/api/test')
        .filter((name) => name.endsWith('.test.ts'))
        .map((name) => `apps/api/test/${name}`),
    ]);
  } finally {
    for (const id of containers.reverse()) docker('rm', '-f', id);
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
