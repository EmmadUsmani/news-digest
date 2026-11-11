// Explicit loopback rehearsal using the live restricted-role catalog; no flag changes.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { resolve } from 'node:path';

import { chromium } from 'playwright';

import { adminAccess } from '../apps/api/src/admin-access';
import { proxyInternalTools } from '../apps/api/src/internal-tools';
import { publicAccess } from '../apps/api/src/public-access';
import { createExplorerServer } from '../apps/schema-explorer/src/http-server';
import type { SchemaModel } from '../apps/schema-explorer/src/model';
import { buildPublicModel } from '../apps/schema-explorer/src/public-model';

async function listen(server: Server) {
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  return (server.address() as AddressInfo).port;
}
async function close(server: Server) {
  server.closeAllConnections();
  await new Promise<void>((done, reject) =>
    server.close((error) => (error ? reject(error) : done())),
  );
}

async function main() {
  const source = await fetch('http://127.0.0.1:8200/api/schema', {
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(source.status, 200);
  const catalog = (await source.json()) as SchemaModel;
  assert.ok(catalog.tables.some((table) => table.name === 'users'));
  const structural = buildPublicModel(catalog);
  const browser = await chromium.launch();
  const token = 'isolated-rehearsal-only';
  let reads = 0;
  await mkdir('docs/screenshots/schema', { recursive: true });
  try {
    for (const mode of ['private', 'structural', 'private'] as const) {
      const tool = createExplorerServer({
        loadModel: () => {
          reads++;
          return Promise.resolve(catalog);
        },
        health: () => Promise.resolve(undefined),
        publicDir: resolve('apps/schema-explorer/public'),
        structuralOnly: mode === 'structural',
      });
      const port = await listen(tool);
      const proxy = proxyInternalTools([{ prefix: '/db', port }]);
      const guard = adminAccess({ localToken: token });
      const admission = publicAccess(true, () =>
        Promise.resolve({ freshAdmin: true }),
      );
      const servers: Server[] = [];
      try {
        for (const publicMode of [false, true]) {
          const app = createServer((req, res) => {
            const next = () =>
              proxy(req, res, () => {
                res.writeHead(404).end();
              });
            if (publicMode) void admission(req, res, next);
            else guard(req, res, next);
          });
          servers.push(app);
          const base = `http://127.0.0.1:${await listen(app)}`;
          const before = reads;
          for (const path of [
            '/db',
            '/db/',
            '/db/api/schema',
            '/db/api/schema?rows=1',
            '/db/api/rows',
            '/DB/api/schema',
            '/db%2fapi/schema',
          ]) {
            const denied = await fetch(base + path, { redirect: 'manual' });
            assert.equal(denied.status, 404, `${mode}/${publicMode}: ${path}`);
          }
          assert.equal(reads, before, 'denied routes must not introspect');
          assert.equal(
            (
              await fetch(base + '/db/api/schema', {
                headers: { 'X-ExeDev-Email': 'forged@example.test' },
              })
            ).status,
            404,
          );
          assert.equal(reads, before);
          const headers = { ADMIN_LOCAL_TOKEN: token };
          if (publicMode) {
            assert.equal(
              (await fetch(base + '/db/api/schema', { headers })).status,
              404,
            );
            assert.equal(
              reads,
              before,
              'public route policy stays closed even to fresh admins',
            );
            continue;
          }
          const redirect = await fetch(base + '/db', {
            headers,
            redirect: 'manual',
          });
          assert.equal(redirect.status, 308);
          assert.equal(redirect.headers.get('location'), '/db/');
          const response = await fetch(base + '/db/api/schema', { headers });
          assert.equal(response.headers.get('cache-control'), 'no-store');
          assert.deepEqual(
            await response.json(),
            mode === 'structural' ? structural : catalog,
          );
          assert.deepEqual(
            await (
              await fetch(base + '/db/api/schema?structuralOnly=0&rows=1', {
                headers,
              })
            ).json(),
            mode === 'structural' ? structural : catalog,
          );
          const readCount = reads;
          assert.equal(
            (await fetch(base + '/db/api/schema', { method: 'POST', headers }))
              .status,
            405,
          );
          assert.equal(
            (await fetch(base + '/db/api/rows', { headers })).status,
            404,
          );
          assert.equal(reads, readCount);
          for (const width of [1440, 390]) {
            const page = await browser.newPage({
              viewport: { width, height: 900 },
              extraHTTPHeaders: headers,
            });
            const errors: string[] = [];
            page.on('pageerror', (error) => errors.push(error.message));
            await page.goto(base + '/db/#table=users');
            await page.waitForSelector('#panel:not([hidden]) h2');
            assert.equal(
              await page.locator('#panel h2').textContent(),
              'users',
            );
            await page.locator('#search').fill('users');
            await page.locator('#search').press('Enter');
            const body = await page.locator('body').innerText();
            if (mode === 'structural') {
              assert.doesNotMatch(
                body,
                /on disk|estimated rows|Indexes|Triggers|Checks/,
              );
              assert.equal(await page.locator('#warn').isVisible(), false);
              await page.screenshot({
                path: `docs/screenshots/schema/proxy-structural-${width}.png`,
              });
            } else assert.match(body, /on disk/);
            assert.equal(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
              ),
              true,
            );
            assert.deepEqual(errors, []);
            await page.close();
          }
        }
      } finally {
        for (const server of servers.reverse()) await close(server);
        await close(tool);
      }
    }
    console.log(
      `Explorer proxy: private/structural/private HTTP and desktop/mobile pass; ${catalog.tables.length} live catalog tables, ${catalog.relations.length} relations. Public admission remains closed; no live configuration changed.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
