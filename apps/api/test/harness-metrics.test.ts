import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

void test('harness status metrics bound inputs, omit private data and fail closed', () => {
  execFileSync('python3', ['ops/observability/test-harness-metrics.py'], {
    stdio: 'pipe',
    timeout: 10_000,
  });
});
