import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

for (const credential of [undefined, '', '   ']) {
  test(`startup refuses ${credential === undefined ? 'missing' : JSON.stringify(credential)} database credentials`, () => {
    const env = { ...process.env };
    delete env.SCHEMA_EXPLORER_DATABASE_URL;
    if (credential !== undefined) env.SCHEMA_EXPLORER_DATABASE_URL = credential;
    const result = spawnSync(process.execPath, ['src/server.ts'], {
      cwd: new URL('..', import.meta.url),
      env,
      encoding: 'utf8',
      timeout: 5000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /SCHEMA_EXPLORER_DATABASE_URL is required/);
    assert.equal(result.stdout, '');
  });
}
