// Focused offline browser review; no operational services or provider calls.
import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';

import { chromium } from 'playwright';

import { createServer } from '../apps/web/node_modules/vite/dist/node/index.js';

async function main() {
  const root = `${process.cwd()}/apps/web/`;
  const harness = `${root}public-tools-review.html`;
  const browser = await chromium.launch({ headless: true });
  let server: Awaited<ReturnType<typeof createServer>> | undefined;
  try {
    await writeFile(
      harness,
      `<!doctype html><html><body><main id="root"></main><script type="module">
import React from 'react';
import {createRoot} from 'react-dom/client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AdminTools} from '/src/AdminLayout.tsx';
import {identityQuery} from '/src/queries.ts';
import '/src/style.css';
const root = createRoot(document.getElementById('root'));
window.showTools = (publicMode, isAdmin) => {
  const client = new QueryClient();
  client.setQueryData(identityQuery.queryKey, {isAdmin});
  root.render(React.createElement(QueryClientProvider, {client, key: String(publicMode) + String(isAdmin)}, React.createElement(AdminTools, {publicMode})));
};
window.showTools(true, false);
</script></body></html>`,
    );
    server = await createServer({
      root,
      server: { host: '127.0.0.1', port: 0 },
      logLevel: 'error',
    });
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address === 'object');
    const page = await browser.newPage();
    const errors: string[] = [];
    let actorAdmin = false;
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/api/**', (route) => {
      assert.equal(new URL(route.request().url()).pathname, '/api/me');
      assert.equal(route.request().method(), 'GET');
      return route.fulfill({ json: { isAdmin: actorAdmin } });
    });
    await page.goto(
      `http://127.0.0.1:${address.port}/public-tools-review.html`,
    );
    await page
      .getByRole('heading', { name: 'Handbook', exact: true })
      .waitFor();
    assert.equal(await page.getByText('Grafana', { exact: true }).count(), 0);
    assert.equal(
      await page
        .getByText('Public access is being prepared.', { exact: true })
        .count(),
      0,
    );
    for (const href of ['/docs/', '/db/', '/admin/queues'])
      assert.equal(await page.locator(`a[href="${href}"]`).count(), 1);
    for (const href of ['/grafana/', '/queues/', '/logs/', '/metrics/'])
      assert.equal(await page.locator(`a[href="${href}"]`).count(), 0);
    assert.equal(
      await page.getByText('Admin sign-in required.', { exact: true }).count(),
      2,
    );
    await mkdir('docs/screenshots/ui', { recursive: true });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-tools-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    actorAdmin = true;
    await page.evaluate(() =>
      (
        window as unknown as { showTools: (p: boolean, a: boolean) => void }
      ).showTools(true, true),
    );
    await page.locator('a[href="/logs/"]').waitFor();
    assert.equal(await page.getByText('Grafana', { exact: true }).count(), 0);
    await page.evaluate(() =>
      (
        window as unknown as { showTools: (p: boolean, a: boolean) => void }
      ).showTools(false, true),
    );
    await page.locator('a[href="/grafana/"]').waitFor();
    assert.equal(await page.locator('a[href="/queues/"]').count(), 1);
    assert.deepEqual(errors, []);
    console.log(
      'PASS: public Tools omits Grafana for readers/admins; reader links and telemetry restrictions retained; private Tools preserved; four fixture screenshots, no overflow/page errors.',
    );
  } finally {
    await browser.close();
    await server?.close();
    await rm(harness, { force: true });
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
