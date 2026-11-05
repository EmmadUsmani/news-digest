import assert from 'node:assert/strict';

import { topicSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';
async function smoke() {
  const base = 'http://localhost:8000';
  const browser = await chromium.launch();
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const topics = topicSchema
    .array()
    .parse(await localAdminJson('/api/admin/topics'));
  const ids = topics.map((topic) => topic.id);
  const latest = (await localAdminJson(
    '/api/admin/digest-previews/latest',
  )) as { id: string } | null;
  const savedEdition = latest
    ? await localAdminJson('/api/admin/digest-previews/' + latest.id)
    : null;
  const [content, status, profile] = await Promise.all([
    localAdminJson('/api/admin/content'),
    localAdminJson('/api/admin/status'),
    localAdminJson('/api/admin/profile'),
  ]);
  const snapshots: Record<string, unknown> = {
    '/api/admin/content': content,
    '/api/admin/status': status,
    '/api/admin/profile': profile,
  };
  const credentials: string[] = [];
  const unexpectedWrites: string[] = [];
  context.on('request', (request) => {
    const headers = request.headers();
    if ('admin_local_token' in headers || 'x-exedev-email' in headers)
      credentials.push(new URL(request.url()).pathname);
  });
  assert.ok(topics.length >= 2, 'Reorder replay requires two topics');
  let replayTopics = structuredClone(topics);
  let failOrder = true;
  let loseResponse = false;
  let releaseStalledResponse: (() => void) | undefined;
  let writes = 0;
  // Browser writes are replayed; protected Node requests are used only for live reads.
  await context.route('**/*', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const headers = request.headers();
    if ('admin_local_token' in headers || 'x-exedev-email' in headers)
      return route.abort();
    if (request.method() === 'GET' && Object.hasOwn(snapshots, path))
      return route.fulfill({ json: snapshots[path] });
    if (path === '/api/admin/topics' && request.method() === 'GET') {
      await route.fulfill({ json: replayTopics });
      return;
    }
    if (path === '/api/admin/topics/order' && request.method() === 'PUT') {
      const input = request.postDataJSON() as { ids: string[] };
      assert.deepEqual([...input.ids].sort(), [...ids].sort());
      writes++;
      if (failOrder) {
        await route.fulfill({ status: 503, body: 'Unavailable' });
      } else {
        replayTopics = input.ids.map((id, position) => ({
          ...topics.find((topic) => topic.id === id)!,
          position,
        }));
        if (loseResponse) {
          await new Promise<void>((resolve) => {
            releaseStalledResponse = resolve;
          });
          await route.abort().catch(() => undefined);
        } else await route.fulfill({ json: replayTopics });
      }
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method())) {
      unexpectedWrites.push(`${request.method()} ${path}`);
      return route.abort();
    }
    await route.continue();
  });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      replayTopics = structuredClone(topics);
      failOrder = true;
      const writesBefore = writes;
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height });
      await replayAdminPage(page);
      await page.goto(`${base}/admin`);
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
      assert.equal(
        await page
          .getByRole('button', {
            name: `Move ${topics[0].name} up`,
            exact: true,
          })
          .isDisabled(),
        true,
      );
      await page
        .getByRole('button', {
          name: `Move ${topics[0].name} down`,
          exact: true,
        })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not confirm topic order.' })
        .waitFor();
      assert.equal(
        await page
          .getByRole('button', {
            name: `Move ${topics[0].name} down`,
            exact: true,
          })
          .evaluate((node) => node === document.activeElement),
        true,
        'Failed move restores the initiating button',
      );
      assert.deepEqual(replayTopics, topics);
      assert.equal(writes, writesBefore + 1);
      assert.equal(
        await page
          .locator('.topic-settings li')
          .first()
          .locator('span')
          .innerText(),
        `${topics[0].name} · Enabled`,
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/topic-order-failure-${name}.png`,
      });
      failOrder = false;
      await page
        .getByRole('button', {
          name: `Move ${topics[0].name} down`,
          exact: true,
        })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Topic order saved.' })
        .waitFor();
      const expected = [ids[1], ids[0], ...ids.slice(2)];
      const persisted = topicSchema.array().parse(replayTopics);
      assert.equal(writes, writesBefore + 2);
      assert.deepEqual(
        persisted.map((t) => t.id),
        expected,
      );
      assert.deepEqual(
        persisted.map((t) => t.position),
        expected.map((_, index) => index),
      );
      const moveBack = page.getByRole('button', {
        name: `Move ${topics[0].name} up`,
        exact: true,
      });
      await moveBack.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(
        (label) => document.activeElement?.getAttribute('aria-label') === label,
        `Move ${topics[0].name} down`,
      );
      assert.deepEqual(
        replayTopics.map((topic) => topic.id),
        ids,
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/ui/topic-order-focus-${name}.png`,
      });
      await page.keyboard.press('Enter');
      await page.waitForFunction(
        (label) => document.activeElement?.getAttribute('aria-label') === label,
        `Move ${topics[0].name} down`,
      );
      assert.deepEqual(
        replayTopics.map((topic) => topic.id),
        expected,
      );
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      assert.equal(
        await page
          .locator('.topic-settings li')
          .first()
          .locator('span')
          .innerText(),
        `${topics[1].name} · Enabled`,
      );
      assert.equal(
        await page.locator('.topic-grid h3').first().innerText(),
        topics[1].name,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page
        .locator('.topic-settings')
        .screenshot({ path: `docs/screenshots/topic-order-${name}.png` });
      // Replay a completed save whose response stalls until the real deadline.
      loseResponse = true;
      await page
        .getByRole('button', {
          name: `Move ${topics[1].name} down`,
          exact: true,
        })
        .click();
      await page
        .getByRole('status')
        .filter({
          hasText: 'The topic order may have been saved.',
        })
        .waitFor({ timeout: 20_000 });
      assert.equal(
        await page
          .getByRole('button', {
            name: `Move ${topics[1].name} down`,
            exact: true,
          })
          .isEnabled(),
        true,
        'Timeout releases reorder controls',
      );
      releaseStalledResponse?.();
      releaseStalledResponse = undefined;
      assert.equal(writes, writesBefore + 5);
      assert.deepEqual(
        replayTopics.map((topic) => topic.id),
        ids,
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/ui/topic-order-timeout-${name}.png`,
      });
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      assert.equal(
        await page.locator('.topic-grid h3').first().innerText(),
        topics[0].name,
      );
      assert.equal(
        writes,
        writesBefore + 5,
        'Reload must not repeat the reorder',
      );
      loseResponse = false;
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(credentials, []);
    assert.deepEqual(unexpectedWrites, []);
    console.log(
      'Topic reorder desktop/mobile browser replay: failure, retry, real timeout after saved order, unlocked controls, reload without retry, positions and overflow passed; no production writes or generation',
    );
  } finally {
    assert.deepEqual(
      await localAdminJson('/api/admin/topics'),
      topics,
      'Browser replay must not change live topics',
    );
    assert.deepEqual(await localAdminJson('/api/admin/profile'), profile);
    if (latest)
      assert.deepEqual(
        await localAdminJson('/api/admin/digest-previews/' + latest.id),
        savedEdition,
      );
    await browser.close();
  }
}
void smoke();
