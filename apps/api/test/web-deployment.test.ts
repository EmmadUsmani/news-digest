import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { test } from 'node:test';

void test('web deployment preserves availability, retained assets and failed-build rollback', () => {
  const result = spawnSync('python3', [resolve('scripts/test-deploy-web.py')], {
    encoding: 'utf8',
    timeout: 10_000,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
