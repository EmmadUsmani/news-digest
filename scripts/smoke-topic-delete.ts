import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { topicSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const original = topicSchema
    .array()
    .parse(await localAdminJson('/api/admin/topics'));
  const [content, status, profile, latest] = await Promise.all([
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
  const replayTopics = structuredClone(original);
  let failDelete = true;
  let deletes = 0;
  let loseResponse = false;
  let stallResponse = false;
  // Browser writes stay in memory; protected Node requests only read live state.
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
    if (
      request.method() === 'DELETE' &&
      replayTopics.some((topic) => path === '/api/topics/' + topic.id)
    ) {
      const index = replayTopics.findIndex(
        (topic) => path === '/api/topics/' + topic.id,
      );
      assert.ok(
        index >= original.length,
        'Only a synthetic topic may be deleted',
      );
      deletes++;
      if (failDelete) {
        await route.fulfill({ status: 503, body: 'Unavailable' });
      } else {
        replayTopics.splice(index, 1);
        if (stallResponse) {
          await new Promise((resolve) => setTimeout(resolve, 17_000));
          await route.fulfill({ json: replayTopics }).catch(() => undefined);
        } else if (loseResponse) await route.abort();
        else await route.fulfill({ json: replayTopics });
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
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const topic = topicSchema.parse({
        ...original[0],
        id: randomUUID(),
        name: 'Delete verification ' + device,
        position: original.length,
      });
      replayTopics.push(topic);
      failDelete = true;
      const deletesBefore = deletes;
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
      await page
        .getByRole('button', { name: 'Delete ' + topic.name, exact: true })
        .click();
      const confirmation = page.getByRole('region', {
        name: 'Delete ' + topic.name,
        exact: true,
      });
      await confirmation
        .getByRole('button', { name: 'Keep topic', exact: true })
        .click();
      assert.ok(replayTopics.some((saved) => saved.id === topic.id));
      assert.equal(deletes, deletesBefore, 'Cancel must not send a delete');
      await page
        .getByRole('button', { name: 'Delete ' + topic.name, exact: true })
        .click();
      await confirmation.scrollIntoViewIfNeeded();
      await confirmation.screenshot({
        path: 'docs/screenshots/topic-delete-' + device + '.png',
      });
      await confirmation
        .getByRole('button', { name: 'Delete topic permanently', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not confirm topic deletion.' })
        .waitFor();
      assert.ok(replayTopics.some((saved) => saved.id === topic.id));
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not confirm topic deletion.' })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: 'docs/screenshots/topic-delete-failure-' + device + '.png',
      });
      assert.equal(deletes, deletesBefore + 1);
      failDelete = false;
      await confirmation
        .getByRole('button', { name: 'Delete topic permanently', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Deleted ' + topic.name + '.' })
        .waitFor();
      await page.reload();
      await page
        .locator('.topic-grid')
        .getByRole('heading', {
          name: original[0].name,
          exact: true,
        })
        .waitFor();
      assert.equal(
        await page
          .locator('.topic-grid')
          .getByRole('heading', { name: topic.name, exact: true })
          .count(),
        0,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(replayTopics, original);
      assert.equal(deletes, deletesBefore + 2);
      // A completed deletion with a stalled response must release the controls.
      replayTopics.push(topic);
      stallResponse = true;
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Delete ' + topic.name, exact: true })
        .click();
      await confirmation
        .getByRole('button', { name: 'Delete topic permanently', exact: true })
        .click();
      assert.ok(
        await confirmation
          .getByRole('button', { name: 'Deleting…', exact: true })
          .isDisabled(),
      );
      assert.ok(
        await confirmation
          .getByRole('button', { name: 'Keep topic', exact: true })
          .isDisabled(),
      );
      const timedOut = page.getByRole('status').filter({
        hasText:
          /The topic may have been deleted|Could not confirm topic deletion/,
      });
      await timedOut.waitFor({ timeout: 20_000 });
      assert.equal(
        await confirmation
          .getByRole('button', { name: 'Keep topic', exact: true })
          .isEnabled(),
        true,
      );
      assert.equal(
        await confirmation
          .getByRole('button', {
            name: 'Delete topic permanently',
            exact: true,
          })
          .isEnabled(),
        true,
      );
      await timedOut.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/ui/topic-delete-timeout-${device}.png`,
      });
      assert.ok(!replayTopics.some((saved) => saved.id === topic.id));
      stallResponse = false;
      await page.reload();
      await page
        .locator('.topic-grid')
        .getByRole('heading', { name: original[0].name, exact: true })
        .waitFor();
      assert.equal(
        await page
          .getByRole('button', { name: 'Delete ' + topic.name, exact: true })
          .count(),
        0,
      );
      assert.equal(
        deletes,
        deletesBefore + 3,
        'Reload must not repeat a timed-out delete',
      );
      // The server can complete deletion before the browser loses its response.
      replayTopics.push(topic);
      loseResponse = true;
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Delete ' + topic.name, exact: true })
        .click();
      await confirmation
        .getByRole('button', { name: 'Delete topic permanently', exact: true })
        .click();
      const interrupted = page.getByRole('status').filter({
        hasText: 'The topic may have been deleted.',
      });
      await interrupted.waitFor();
      await interrupted.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: 'docs/screenshots/topic-delete-interrupted-' + device + '.png',
      });
      assert.ok(!replayTopics.some((saved) => saved.id === topic.id));
      await page.reload();
      await page
        .locator('.topic-grid')
        .getByRole('heading', {
          name: original[0].name,
          exact: true,
        })
        .waitFor();
      assert.equal(
        await page
          .getByRole('button', {
            name: 'Delete ' + topic.name,
            exact: true,
          })
          .count(),
        0,
      );
      assert.equal(
        deletes,
        deletesBefore + 4,
        'Reload must not retry deletion',
      );
      loseResponse = false;
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(credentials, []);
    assert.deepEqual(unexpectedWrites, []);
    console.log(
      'Topic deletion desktop/mobile: browser replay cancel, error/retry, removal, real timeout and lost-response recovery without retry, reload and order passed; no production writes or generation',
    );
  } finally {
    assert.deepEqual(
      await localAdminJson('/api/admin/topics'),
      original,
      'Browser replay must never change live topics',
    );
    assert.deepEqual(await localAdminJson('/api/admin/profile'), profile);
    if (edition)
      assert.deepEqual(
        await localAdminJson('/api/admin/digest-previews/' + edition.id),
        savedEdition,
      );
    await browser.close();
  }
}
void smoke();
