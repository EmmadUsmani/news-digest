import assert from 'node:assert/strict';

import { topicSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
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
    '/api/content': content,
    '/api/status': status,
    '/api/profile': profile,
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
    if (path === '/api/topics' && request.method() === 'GET') {
      await route.fulfill({ json: replayTopics });
      return;
    }
    if (path === '/api/topics/order' && request.method() === 'PUT') {
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
        await route.fulfill({ json: replayTopics });
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
      await page.goto(base);
      assert.equal(
        await page.evaluate(async () => {
          try {
            await fetch('/api/topics/unexpected-write-probe', {
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
        'POST /api/topics/unexpected-write-probe',
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
        .filter({ hasText: 'Could not save topic order.' })
        .waitFor();
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
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(credentials, []);
    assert.deepEqual(unexpectedWrites, []);
    console.log(
      'Topic reorder desktop/mobile browser replay: failure, retry, reload, positions and overflow passed; no production writes or generation',
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
