import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

// Protected snapshots; availability changes are replayed only in the browser.
async function smoke() {
  const [savedTopics, content, status, profile, latest] = await Promise.all([
    localAdminJson('/api/admin/topics'),
    localAdminJson('/api/admin/content'),
    localAdminJson('/api/admin/status'),
    localAdminJson('/api/admin/profile'),
    localAdminJson('/api/admin/digest-previews/latest'),
  ]);
  const edition = latest as { id: string } | null;
  const savedEdition = edition
    ? await localAdminJson('/api/admin/digest-previews/' + edition.id)
    : null;
  const snapshots: Record<string, unknown> = {
    '/api/admin/content': content,
    '/api/admin/status': status,
    '/api/admin/profile': profile,
  };
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({
        viewport: { width, height },
        serviceWorkers: 'block',
      });
      const credentials: string[] = [];
      const errors: string[] = [];
      const unexpectedWrites: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => {
        const headers = request.headers();
        if ('admin_local_token' in headers || 'x-exedev-email' in headers)
          credentials.push(new URL(request.url()).pathname);
      });
      const topics = topicSchema.array().parse(savedTopics);
      const original = topics.find((topic) => topic.enabled);
      assert.ok(original, 'Need an enabled topic for browser verification');
      let fail = true;
      let writes = 0;
      let stallAfterSave = false;
      let releaseStalledResponse: (() => void) | undefined;
      await page.route('**/*', async (route) => {
        const request = route.request();
        const path = new URL(request.url()).pathname;
        const headers = request.headers();
        if ('admin_local_token' in headers || 'x-exedev-email' in headers)
          return route.abort();
        if (request.method() === 'GET' && Object.hasOwn(snapshots, path))
          return route.fulfill({ json: snapshots[path] });
        if (
          path === `/api/admin/topics/${original.id}` &&
          request.method() === 'PUT'
        ) {
          const body = topicUpdateSchema.parse(request.postDataJSON());
          const enabled = writes === 2;
          assert.deepEqual(body, {
            ...topicUpdateSchema.strip().parse(original),
            enabled,
          });
          writes++;
          if (fail) return route.fulfill({ status: 503, body: 'Unavailable' });
          const updated = { ...original, enabled };
          topics[topics.findIndex((topic) => topic.id === original.id)] =
            updated;
          if (stallAfterSave) {
            await new Promise<void>((resolve) => {
              releaseStalledResponse = resolve;
            });
            return route.fulfill({ json: updated }).catch(() => {});
          }
          return route.fulfill({ json: updated });
        }
        if (!['GET', 'HEAD'].includes(request.method())) {
          unexpectedWrites.push(`${request.method()} ${path}`);
          return route.abort();
        }
        if (path === '/api/admin/topics')
          return route.fulfill({ json: topics });
        return route.continue();
      });
      await replayAdminPage(page);
      await page.goto('http://127.0.0.1:8000/admin');
      assert.equal(
        await page.evaluate(async () => {
          try {
            await fetch('/api/admin/topics/unexpected-write-probe', {
              method: 'POST',
            });
            return false;
          } catch {
            return true;
          }
        }),
        true,
      );
      assert.equal(
        unexpectedWrites.pop(),
        'POST /api/admin/topics/unexpected-write-probe',
      );
      await page.getByText('Manage topics', { exact: true }).click();
      const disable = page.getByRole('button', {
        name: `Disable ${original.name}`,
        exact: true,
      });
      await disable.click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not confirm topic availability.' })
        .waitFor();
      assert.ok(await disable.isEnabled());
      assert.ok(
        await disable.evaluate((button) => button === document.activeElement),
        'Failed availability save restores keyboard focus',
      );
      assert.ok(
        await page
          .locator('.topic-grid')
          .getByRole('heading', { name: original.name, exact: true })
          .isVisible(),
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/topic-availability-failure-${device}.png`,
      });
      fail = false;
      await page.keyboard.press('Enter');
      await page
        .getByRole('button', { name: `Enable ${original.name}`, exact: true })
        .waitFor();
      const enable = page.getByRole('button', {
        name: `Enable ${original.name}`,
        exact: true,
      });
      assert.ok(
        await enable.evaluate((button) => button === document.activeElement),
        'Successful disable focuses Enable for keyboard continuation',
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/ui/topic-availability-focus-${device}.png`,
      });
      assert.equal(
        await page
          .locator('.topic-grid')
          .getByRole('heading', { name: original.name, exact: true })
          .count(),
        0,
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/topic-availability-${device}.png`,
      });
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      assert.equal(
        await page
          .locator('.topic-grid')
          .getByRole('heading', {
            name: original.name,
            exact: true,
          })
          .count(),
        0,
      );
      await page
        .getByRole('button', { name: `Enable ${original.name}`, exact: true })
        .click();
      await disable.waitFor();
      await page
        .locator('.topic-grid')
        .getByRole('heading', { name: original.name, exact: true })
        .waitFor();
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await disable.waitFor();
      await page
        .locator('.topic-grid')
        .getByRole('heading', {
          name: original.name,
          exact: true,
        })
        .waitFor();
      assert.equal(writes, 3);
      stallAfterSave = true;
      await disable.click();
      await page.waitForTimeout(250);
      assert.ok(await disable.isDisabled(), 'Controls lock while saving');
      await page
        .getByRole('status')
        .filter({
          hasText: 'Topic availability may have changed.',
        })
        .waitFor({ timeout: 20_000 });
      assert.ok(await disable.isEnabled(), 'Deadline releases controls');
      assert.ok(
        await disable.evaluate((button) => button === document.activeElement),
        'Timed-out availability save restores keyboard focus',
      );
      releaseStalledResponse?.();
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/ui/topic-availability-timeout-${device}.png`,
      });
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', {
          name: `Enable ${original.name}`,
          exact: true,
        })
        .waitFor();
      assert.equal(
        await page
          .locator('.topic-grid')
          .getByRole('heading', {
            name: original.name,
            exact: true,
          })
          .count(),
        0,
      );
      assert.equal(
        writes,
        4,
        'Reload recovers saved availability without retry',
      );
      // Restore replay state to check editor protection without another write.
      topics[topics.findIndex((topic) => topic.id === original.id)] = original;
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await disable.waitFor();
      await page
        .getByRole('button', { name: `Edit ${original.name}`, exact: true })
        .click();
      assert.ok(await disable.isDisabled(), 'Do not overwrite an open editor');
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      assert.deepEqual(errors, []);
      assert.deepEqual(credentials, []);
      assert.deepEqual(unexpectedWrites, []);
      await page.close();
    }
    assert.deepEqual(await localAdminJson('/api/admin/topics'), savedTopics);
    assert.deepEqual(await localAdminJson('/api/admin/profile'), profile);
    if (edition)
      assert.deepEqual(
        await localAdminJson('/api/admin/digest-previews/' + edition.id),
        savedEdition,
      );
    console.log(
      'Topic availability: desktop/mobile keyboard focus, failure, Enter retry, disable, reload, enable, real timeout recovery, editor protection passed; live topics/profile/edition unchanged, browser writes guarded and credentials absent.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
