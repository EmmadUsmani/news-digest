import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const topics = topicSchema
    .array()
    .parse(await localAdminJson('/api/admin/topics'));
  const original = topics[0];
  assert.ok(
    original?.enabled,
    'Need an enabled first topic for browser verification',
  );
  const replayTopics = structuredClone(topics);
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
  let failSave = false;
  let saves = 0;
  let releaseSave: (() => void) | undefined;
  let pendingSave: Promise<void> | undefined;
  await context.route('**/*', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const headers = request.headers();
    if ('admin_local_token' in headers || 'x-exedev-email' in headers)
      return route.abort();
    if (request.method() === 'GET' && Object.hasOwn(snapshots, path))
      return route.fulfill({ json: snapshots[path] });
    if (path === '/api/topics' && request.method() === 'GET')
      return route.fulfill({ json: replayTopics });
    if (path === `/api/topics/${original.id}` && request.method() === 'PUT') {
      const update = topicUpdateSchema.parse(request.postDataJSON());
      saves++;
      if (pendingSave) await pendingSave;
      if (failSave) return route.fulfill({ status: 503, body: 'Unavailable' });
      replayTopics[0] = topicSchema.parse({ ...replayTopics[0], ...update });
      return route.fulfill({ json: replayTopics[0] });
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
      replayTopics[0] = structuredClone(original);
      const previousSaves = saves;
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
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
        .getByRole('button', { name: `Edit ${original.name}`, exact: true })
        .click();
      const form = page.getByRole('form', {
        name: `Edit ${original.name}`,
        exact: true,
      });
      await form
        .getByLabel('Name', { exact: true })
        .fill('Tech settings verification');
      await form.getByLabel('Story budget', { exact: true }).fill('1');
      await form.locator('textarea[name=includeAny]').fill('');
      await page
        .locator('.topic-settings')
        .screenshot({ path: `docs/screenshots/topics-${name}.png` });
      failSave = true;
      pendingSave = new Promise<void>((resolve) => {
        releaseSave = resolve;
      });
      await form
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      const saving = form.getByRole('button', { name: 'Saving…', exact: true });
      await saving.waitFor();
      assert.ok(await saving.isDisabled());
      assert.ok(await form.getByLabel('Name', { exact: true }).isDisabled());
      assert.ok(
        await form
          .getByRole('button', { name: 'Cancel', exact: true })
          .isDisabled(),
      );
      assert.ok(
        await page
          .getByRole('button', { name: 'Create topic', exact: true })
          .isDisabled(),
      );
      assert.deepEqual(replayTopics[0], original);
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/topics-saving-${name}.png`,
      });
      releaseSave!();
      pendingSave = undefined;
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not save topic settings.' })
        .waitFor();
      assert.deepEqual(replayTopics[0], original);
      assert.equal(
        await form.getByLabel('Name', { exact: true }).inputValue(),
        'Tech settings verification',
      );
      assert.equal(
        await form.getByLabel('Story budget', { exact: true }).inputValue(),
        '1',
      );
      assert.equal(
        await form.locator('textarea[name=includeAny]').inputValue(),
        '',
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/topic-save-failure-${name}.png`,
      });
      failSave = false;
      await form
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Saved Tech settings verification.' })
        .waitFor();
      await page.reload();
      await page
        .locator('.topic-grid')
        .getByRole('heading', {
          name: 'Tech settings verification',
          exact: true,
        })
        .waitFor();
      assert.equal(replayTopics[0].storyBudget, 1);
      assert.equal(replayTopics[0].name, 'Tech settings verification');
      assert.deepEqual(replayTopics[0].relevancePolicy.includeAny, []);
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', {
          name: 'Edit Tech settings verification',
          exact: true,
        })
        .click();
      const reopened = page.getByRole('form', {
        name: 'Edit Tech settings verification',
        exact: true,
      });
      assert.equal(
        await reopened.getByLabel('Name', { exact: true }).inputValue(),
        'Tech settings verification',
      );
      assert.equal(
        await reopened.getByLabel('Story budget', { exact: true }).inputValue(),
        '1',
      );
      assert.equal(
        await reopened.locator('textarea[name=includeAny]').inputValue(),
        '',
      );
      await page.getByLabel('Include this topic', { exact: true }).uncheck();
      await page
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Saved Tech settings verification.' })
        .waitFor();
      assert.equal(
        await page.locator('.topic-grid article').count(),
        topics.filter((topic) => topic.enabled && topic.id !== original.id)
          .length,
      );
      assert.equal(replayTopics[0].enabled, false);
      assert.equal(saves, previousSaves + 3);
      assert.deepEqual(errors, []);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page.close();
    }
    assert.deepEqual(credentials, []);
    assert.deepEqual(unexpectedWrites, []);
    console.log(
      'Topic desktop/mobile browser-only pending-save locks, failure/retry, visible reload values, disable and budget checks passed; protected reads prove live topics/edition unchanged; server validation stays in isolated tests',
    );
  } finally {
    releaseSave?.();
    assert.deepEqual(await localAdminJson('/api/admin/topics'), topics);
    assert.deepEqual(await localAdminJson('/api/admin/profile'), profile);
    if (edition)
      assert.deepEqual(
        await localAdminJson('/api/admin/digest-previews/' + edition.id),
        savedEdition,
      );
    await context.close();
    await browser.close();
  }
}
void smoke();
