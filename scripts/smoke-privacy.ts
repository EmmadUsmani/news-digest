// Isolated Vite UI checks; no account or external service requests.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

import { chromium, expect } from 'playwright/test';

async function main() {
  await mkdir('docs/screenshots/privacy', { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const enabled of ['0', '1']) {
      const origin = 'http://127.0.0.1:4197';
      const server = spawn(
        'pnpm',
        [
          '--filter',
          '@digest/web',
          'exec',
          'vite',
          '--host',
          '127.0.0.1',
          '--port',
          '4197',
          '--strictPort',
        ],
        {
          env: { ...process.env, VITE_READER_ACCOUNTS: enabled },
          detached: true,
          stdio: 'ignore',
        },
      );
      try {
        for (let attempt = 0; ; attempt++) {
          try {
            if ((await fetch(origin)).ok) break;
          } catch {
            /* starting */
          }
          if (attempt >= 100) throw new Error('Vite did not start');
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        for (const width of [1440, 390]) {
          for (const colorScheme of ['light', 'dark'] as const) {
            const page = await browser.newPage({
              viewport: { width, height: 900 },
              colorScheme,
            });
            const errors: string[] = [];
            const requests: string[] = [];
            page.on('pageerror', (error) => errors.push(error.message));
            await page.route('**/*', (route) => {
              const url = new URL(route.request().url());
              if (url.origin !== origin || url.pathname.startsWith('/api/')) {
                requests.push(url.pathname);
                return route.abort();
              }
              return route.continue();
            });
            await page.goto(`${origin}/privacy`);
            await expect(
              page.getByRole('heading', { name: 'Privacy', exact: true }),
            ).toBeVisible();
            await expect(
              page.getByText('Reader accounts are currently disabled.', {
                exact: false,
              }),
            ).toHaveCount(enabled === '0' ? 1 : 0);
            await expect(
              page.getByText('Private backups may retain earlier copies', {
                exact: false,
              }),
            ).toHaveCount(enabled === '1' ? 1 : 0);
            assert.equal(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
              ),
              true,
            );
            await page.reload();
            await expect(
              page.getByRole('heading', { name: 'Privacy', exact: true }),
            ).toBeVisible();
            if (enabled === '0')
              await page.screenshot({
                path: `docs/screenshots/privacy/${width}-${colorScheme}.png`,
                fullPage: true,
              });
            assert.deepEqual(requests, []);
            assert.deepEqual(errors, []);
            await page.close();
          }
        }
      } finally {
        if (server.pid) process.kill(-server.pid, 'SIGTERM');
        await new Promise<void>((resolve) =>
          server.once('exit', () => resolve()),
        );
      }
    }
    console.log(
      'Privacy page: desktop/mobile light/dark, accounts off/on, reload and zero API/external requests pass.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
