// Explicit live service rollout: private -> structural -> private -> structural.
// Failure restores the initial drop-in; no credentials or public-mode flags change.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { setTimeout } from 'node:timers/promises';

import { chromium } from 'playwright';

import type { SchemaModel } from '../apps/schema-explorer/src/model';
import { buildPublicModel } from '../apps/schema-explorer/src/public-model';
import { localAdminFetch } from './lib/local-admin-fetch';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--live']);
  assert.ok(new Date().getUTCHours() < 13 || new Date().getUTCHours() >= 16);
  const directory = `${homedir()}/.config/systemd/user/news-digest-schema.service.d`;
  const path = `${directory}/structural-only.conf`;
  const original = await readFile(path).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
      return undefined;
    },
  );
  const config = await readFile('ops/schema-explorer/structural-only.conf');
  async function install(content: Buffer | undefined) {
    assert.ok(new Date().getUTCHours() < 13 || new Date().getUTCHours() >= 16);
    await mkdir(directory, { recursive: true });
    if (content) await writeFile(path, content, { mode: 0o600 });
    else await rm(path, { force: true });
    execFileSync('systemctl', ['--user', 'daemon-reload']);
    execFileSync('systemctl', [
      '--user',
      'restart',
      'news-digest-schema.service',
    ]);
    for (let attempt = 0; attempt < 40; attempt++) {
      try {
        const response = await fetch('http://127.0.0.1:8200/healthz', {
          signal: AbortSignal.timeout(2000),
        });
        if (response.ok) return;
      } catch {
        /* Wait for service startup. */
      }
      await setTimeout(250);
    }
    throw new Error('Explorer did not become healthy');
  }
  async function read(structural: boolean) {
    const response = await fetch('http://127.0.0.1:8200/api/schema');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(
      response.headers.get('x-digest-reader-explorer'),
      structural ? '1' : null,
    );
    const model = (await response.json()) as SchemaModel;
    assert.ok(model.tables.some((table) => table.name === 'users'));
    if (!structural) {
      assert.deepEqual(model.warnings, []);
      assert.ok(model.generatedAt);
      assert.ok(model.tables.every((table) => 'indexes' in table));
    }
    assert.equal((await fetch('http://127.0.0.1:8000/healthz')).status, 200);
    assert.equal((await fetch('http://127.0.0.1:8000/db/')).status, 404);
    const proxied = await localAdminFetch(
      'http://127.0.0.1:8000/db/api/schema',
    );
    assert.equal(proxied.status, 200);
    const proxiedModel = (await proxied.json()) as SchemaModel;
    if (structural) assert.deepEqual(proxiedModel, model);
    else
      assert.deepEqual(buildPublicModel(proxiedModel), buildPublicModel(model));
    return model;
  }
  let complete = false;
  try {
    assert.equal((await fetch('http://127.0.0.1:8000/db/')).status, 404);
    await install(undefined);
    const baseline = await read(false);
    const expected = buildPublicModel(baseline);
    await install(config);
    assert.deepEqual(await read(true), expected);
    await install(undefined);
    const rollback = await read(false);
    const stablePrivate = (model: SchemaModel) => ({
      ...model,
      generatedAt: undefined,
      tables: model.tables.map((table) => ({
        ...table,
        rowEstimate: undefined,
        sizeBytes: undefined,
      })),
    });
    assert.deepEqual(stablePrivate(rollback), stablePrivate(baseline));
    await install(config);
    assert.deepEqual(await read(true), expected);
    const browser = await chromium.launch();
    try {
      await mkdir('docs/screenshots/schema', { recursive: true });
      for (const width of [1440, 390]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto('http://127.0.0.1:8200/#table=users');
        await page.waitForSelector('#panel:not([hidden]) h2');
        assert.equal(await page.locator('#panel h2').textContent(), 'users');
        assert.doesNotMatch(
          await page.locator('body').innerText(),
          /undefined|NaN|estimated rows|on disk|live as of|Indexes|Triggers|Checks/,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        assert.deepEqual(errors, []);
        await page.screenshot({
          path: `docs/screenshots/schema/live-structural-${width}.png`,
        });
        await page.close();
      }
    } finally {
      await browser.close();
    }
    complete = true;
    console.log(
      `Live explorer structural activation and rollback pass: ${expected.tables.length} tables; desktop/mobile; private admission preserved.`,
    );
  } finally {
    if (!complete) await install(original);
  }
}
void main();
