import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

void test('private database backup retention, failure and checksum safeguards', () => {
  const result = spawnSync('python3', ['ops/backups/test_database.py'], {
    encoding: 'utf8',
    timeout: 10_000,
  });
  assert.equal(result.status, 0, result.stderr);
});

void test('encrypted offsite backup retention, budget, archive and checksum safeguards', () => {
  const result = spawnSync('python3', ['ops/backups/test_offsite.py'], {
    encoding: 'utf8',
    timeout: 10_000,
  });
  assert.equal(result.status, 0, result.stderr);
});
