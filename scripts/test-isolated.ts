// Testcontainers owns fresh services; inherited credentials never reach children.
import { spawnSync } from 'node:child_process';

import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';

import { testEnvironment, testFiles } from './test-suites';

async function main() {
  const containers: StartedTestContainer[] = [];
  try {
    // Match compose.yaml's images and major versions. No live volumes or ports.
    const postgres = await new GenericContainer('postgres:17-alpine')
      .withEnvironment({ POSTGRES_HOST_AUTH_METHOD: 'trust' })
      .withExposedPorts(5432)
      .withWaitStrategy(
        Wait.forLogMessage('database system is ready to accept connections', 2),
      )
      .start();
    containers.push(postgres);
    const redis = await new GenericContainer('redis:7-alpine')
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .start();
    containers.push(redis);
    const env = {
      ...testEnvironment(),
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
    run(['--test', '--test-concurrency=1', ...testFiles('integration')]);
  } finally {
    const cleanup = await Promise.allSettled(
      containers.reverse().map((container) => container.stop()),
    );
    for (const result of cleanup) {
      if (result.status === 'rejected')
        console.error('Test container cleanup failed', result.reason);
    }
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
