// Testcontainers owns fresh services; inherited credentials never reach children.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';

import {
  cleanupIntegrationTemps,
  integrationTempPrefix,
  markIntegrationTemp,
} from './lib/integration-temp';
import { testEnvironment, testFiles } from './test-suites';

async function main() {
  cleanupIntegrationTemps(tmpdir());
  const containers: StartedTestContainer[] = [];
  // Node creates its own node-coverage-* directory even with NODE_V8_COVERAGE
  // set. Own its temporary root so late child coverage writes cannot leak it.
  const testTmp = mkdtempSync(join(tmpdir(), integrationTempPrefix));
  markIntegrationTemp(testTmp);
  try {
    // Match compose.yaml's images and major versions. No live volumes or ports.
    // Mount image-declared data volumes as tmpfs, including on interrupted runs.
    const postgres = await new GenericContainer('postgres:17-alpine')
      .withEnvironment({ POSTGRES_HOST_AUTH_METHOD: 'trust' })
      .withCommand([
        'postgres',
        '-c',
        'shared_preload_libraries=pg_stat_statements',
        '-c',
        'pg_stat_statements.track_utility=off',
      ])
      .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
      .withExposedPorts(5432)
      .withWaitStrategy(
        Wait.forLogMessage('database system is ready to accept connections', 2),
      )
      .start();
    containers.push(postgres);
    const redis = await new GenericContainer('redis:7-alpine')
      .withTmpFs({ '/data': 'rw' })
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .start();
    containers.push(redis);
    const env = {
      ...testEnvironment(),
      TMPDIR: testTmp,
      NODE_V8_COVERAGE: undefined,
      DATABASE_URL: `postgres://postgres@${postgres.getHost()}:${postgres.getMappedPort(5432)}/postgres`,
      REDIS_URL: `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`,
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
    const build = spawnSync('pnpm', ['--filter', '@digest/api', 'build'], {
      env,
      stdio: 'inherit',
    });
    if (build.error) throw build.error;
    if (build.status !== 0) throw new Error('API integration build failed');
    run(['apps/api/src/libs/db/migrate.ts']);
    run([
      '--test',
      '--test-concurrency=1',
      '--experimental-test-coverage',
      '--test-coverage-include=apps/api/**/database/**',
      '--test-coverage-include=apps/api/**/libs/db/**',
      '--test-coverage-include=apps/api/**/operations/adapters/operations.status.*',
      '--test-coverage-include=apps/api/**/curation/public/usage.*',
      '--test-coverage-include=apps/api/**/profiles/public/budget-day.*',
      '--test-coverage-include=apps/api/**/digests/public/incremental-triage-pool.*',
      '--test-coverage-include=apps/api/**/digests/public/reaction-stories.*',
      '--test-coverage-include=apps/api/**/social/public/selection.*',
      '--test-coverage-include=apps/api/**/social/public/citing-stories.*',
      ...testFiles('integration'),
    ]);
  } finally {
    const cleanup = await Promise.allSettled(
      containers.reverse().map((container) => container.stop()),
    );
    for (const result of cleanup) {
      if (result.status === 'rejected')
        console.error('Test container cleanup failed', result.reason);
    }
    rmSync(testTmp, { recursive: true, force: true });
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
