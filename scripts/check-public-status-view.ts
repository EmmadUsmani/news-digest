// Offline fixture browser rehearsal of the uninstalled public status view.
import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';

import { chromium } from 'playwright';

import { createServer } from '../apps/web/node_modules/vite/dist/node/index.js';

async function main() {
  const root = `${process.cwd()}/apps/web/`;
  const harness = `${root}public-status-review.html`;
  const fixture = {
    checkedAt: '2026-11-10T13:00:00.000Z',
    sources: [
      {
        id: 'healthy',
        name: 'Fixture healthy source',
        lastAttempt: '2026-11-10T12:55:00.000Z',
        lastSuccess: '2026-11-10T12:55:00.000Z',
        hasError: false,
        active: true,
        enabled: true,
        lastItemCount: 10,
        storedItems: 100,
        items24h: 20,
        items7d: 80,
      },
      {
        id: 'failed',
        name: 'Fixture failed source',
        lastAttempt: null,
        lastSuccess: null,
        hasError: true,
        active: true,
        enabled: true,
        lastItemCount: 0,
        storedItems: 0,
        items24h: 0,
        items7d: 0,
      },
    ],
    queues: [
      {
        name: 'ingestion',
        available: true,
        workers: 1,
        paused: false,
        counts: { waiting: 2 },
        nextRun: null,
      },
    ],
    llm: {
      todayMicros: 10000,
      monthMicros: 20000,
      todayReservedMicros: 3000,
      monthReservedMicros: 3000,
      dailyCapMicros: 470000,
      monthlyCapMicros: 15000000,
      availableMicros: 457000,
    },
    xDiscovery: {
      todayMicros: 10000,
      monthMicros: 20000,
      reservedMicros: 0,
      dailyMicros: 10000,
      monthlyMicros: 2000000,
      availableMicros: 0,
      blocked: true,
    },
    coverage: {
      start: '2026-11-09T13:00:00.000Z',
      end: '2026-11-10T13:00:00.000Z',
      topics: [
        {
          topicId: '10000000-0000-4000-8000-000000000001',
          name: 'Fixture Tech',
          enabled: true,
          connectedSources: 2,
          healthySources: 1,
          articles: 12,
          xPosts: 3,
          redditPosts: 0,
        },
      ],
    },
  };
  let server: Awaited<ReturnType<typeof createServer>> | undefined;
  const browser = await chromium.launch({ headless: true });
  try {
    await writeFile(
      harness,
      `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main style="max-width:1100px;margin:auto;padding:24px"><p>Offline fixture review</p><div id="root"></div></main><script type="module">
import React from 'react';
import {createRoot} from 'react-dom/client';
import {PublicStatus} from '/src/PublicStatus.tsx';
import '/src/style.css';
const fixture = ${JSON.stringify(fixture)};
const root = createRoot(document.getElementById('root'));
window.showStatus = (empty) => root.render(React.createElement(PublicStatus, {data: empty ? {checkedAt: fixture.checkedAt, sources: [], queues: []} : fixture}));
window.showStatus(false);
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
    page.setDefaultTimeout(15000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(
      `http://127.0.0.1:${address.port}/public-status-review.html`,
    );
    await page.getByRole('heading', { name: 'System status' }).waitFor();
    assert.equal(
      await page.getByText('Recent collection failed', { exact: true }).count(),
      1,
    );
    assert.equal(
      await page.getByText('Collecting', { exact: true }).count(),
      1,
    );
    assert.equal(
      await page.getByText('Discovery paused by budget controls').count(),
      1,
    );
    assert.equal(
      await page.getByText('12 articles', { exact: false }).count(),
      1,
    );
    assert.equal(await page.locator('button, input, a').count(), 0);
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
          path: `docs/screenshots/ui/public-status-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    await page.evaluate(() =>
      (
        window as unknown as { showStatus: (empty: boolean) => void }
      ).showStatus(true),
    );
    await page.getByText('Coverage unavailable').waitFor();
    assert.equal(await page.getByText('Budget unavailable').count(), 2);
    assert.equal(await page.getByText('No sources available').count(), 1);
    assert.equal(await page.getByText('No queues available').count(), 1);
    assert.deepEqual(errors, []);
    console.log(
      'PASS: offline public status rendering; desktop/mobile light/dark, budgets, source failures, coverage, empty sections, no controls or overflow.',
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
