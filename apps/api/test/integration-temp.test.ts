import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  cleanupIntegrationTemps,
  markIntegrationTemp,
} from '../../../scripts/lib/integration-temp';

void test('integration cleanup preserves recent, active, unrelated and symlink folders; reaps a killed run', async () => {
  const root = mkdtempSync(join(tmpdir(), 'integration-cleanup-test-'));
  const old = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const folder = (name: string, aged = true) => {
    const path = join(root, name);
    mkdirSync(path);
    writeFileSync(join(path, 'coverage.json'), '{}');
    if (aged) utimesSync(path, old, old);
    return path;
  };
  const stale = folder('news-digest-integration-stale');
  const recent = folder('news-digest-integration-recent', false);
  const active = folder('news-digest-integration-active');
  markIntegrationTemp(active);
  utimesSync(active, old, old);
  const orphan = folder('news-digest-integration-orphan');
  const unrelated = folder('other-temp');
  const link = join(root, 'news-digest-integration-link');
  symlinkSync(unrelated, link);
  const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    env: { ...process.env, TMPDIR: orphan },
    stdio: 'ignore',
  });
  try {
    await once(child, 'spawn');
    writeFileSync(join(orphan, '.runner-pid'), String(child.pid));
    utimesSync(orphan, old, old);
    assert.deepEqual(cleanupIntegrationTemps(root), [stale.split('/').at(-1)]);
    for (const path of [recent, active, orphan, unrelated, link])
      assert.ok(existsSync(path), path);
    const exited = once(child, 'exit');
    child.kill('SIGKILL');
    await exited;
    assert.deepEqual(cleanupIntegrationTemps(root), [orphan.split('/').at(-1)]);
    assert.equal(existsSync(orphan), false);
    assert.deepEqual(cleanupIntegrationTemps(root), []);
  } finally {
    child.kill('SIGKILL');
    rmSync(root, { recursive: true, force: true });
  }
});
