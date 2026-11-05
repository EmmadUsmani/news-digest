import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
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
  let creates = 0;
  let attempts = 0;
  let failCreate = false;
  // Browser writes stay in memory; protected Node requests below only read live state.
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
    if (path === '/api/topics' && request.method() === 'POST') {
      const input = topicUpdateSchema.parse(request.postDataJSON());
      attempts++;
      if (failCreate)
        return route.fulfill({ status: 503, body: 'Unavailable' });
      const saved = topicSchema.parse({
        ...input,
        id: randomUUID(),
        profileId: original[0].profileId,
        position: replayTopics.length,
        sources: [],
        queries: [],
      });
      replayTopics.push(saved);
      creates++;
      await route.fulfill({ status: 201, json: saved });
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
        .getByRole('button', { name: 'Create topic', exact: true })
        .click();
      const form = page.getByRole('form', {
        name: 'Create topic',
        exact: true,
      });
      await form
        .getByText('New topics start without source connections.', {
          exact: false,
        })
        .waitFor();
      // Native required validation must prevent an empty-name request.
      await form
        .getByRole('button', { name: 'Create topic', exact: true })
        .click();
      assert.equal(
        creates,
        device === 'desktop' ? 0 : 1,
        'Required validation must prevent a replayed creation request',
      );
      await form
        .getByLabel('Name', { exact: true })
        .fill(`Science ${device} verification`);
      await form
        .getByLabel('Description', { exact: true })
        .fill('Science research and discoveries.');
      await form.getByLabel('Story budget', { exact: true }).fill('2');
      await form.locator('textarea[name=includeAny]').fill('science\nresearch');
      await page
        .locator('.topic-settings')
        .screenshot({ path: `docs/screenshots/topic-create-${device}.png` });
      failCreate = true;
      const previousAttempts = attempts;
      await form
        .getByRole('button', { name: 'Create topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not save topic settings.' })
        .waitFor();
      assert.equal(attempts, previousAttempts + 1);
      assert.equal(replayTopics.length, original.length);
      assert.equal(
        await form.getByLabel('Name', { exact: true }).inputValue(),
        `Science ${device} verification`,
      );
      assert.equal(
        await form.getByLabel('Description', { exact: true }).inputValue(),
        'Science research and discoveries.',
      );
      assert.equal(
        await form.getByLabel('Story budget', { exact: true }).inputValue(),
        '2',
      );
      assert.equal(
        await form.locator('textarea[name=includeAny]').inputValue(),
        'science\nresearch',
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/topic-create-failure-${device}.png`,
      });
      failCreate = false;
      const responsePromise = page.waitForResponse(
        (r) =>
          r.url() === `${base}/api/topics` && r.request().method() === 'POST',
      );
      await form
        .getByRole('button', { name: 'Create topic', exact: true })
        .click();
      const response = await responsePromise;
      assert.equal(response.status(), 201);
      const saved = topicSchema.parse(await response.json());
      assert.equal(creates, device === 'desktop' ? 1 : 2);
      assert.equal(saved.position, original.length);
      assert.deepEqual(saved.sources, []);
      assert.deepEqual(saved.relevancePolicy.includeAny, [
        'science',
        'research',
      ]);
      await page
        .getByRole('status')
        .filter({ hasText: `Saved ${saved.name}.` })
        .waitFor();
      await page
        .locator('.topic-grid')
        .getByRole('heading', { name: saved.name, exact: true })
        .waitFor();
      await page.reload();
      await page
        .locator('.topic-grid')
        .getByRole('heading', { name: saved.name, exact: true })
        .waitFor();
      await page
        .locator('.topic-grid article')
        .filter({
          has: page.getByRole('heading', { name: saved.name, exact: true }),
        })
        .getByText('No sources connected yet.', { exact: false })
        .waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      // Replay checks browser behavior; server behavior belongs to isolated API tests.
      replayTopics.splice(original.length);
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(credentials, []);
    assert.deepEqual(unexpectedWrites, []);
    console.log(
      'Topic creation desktop/mobile: browser-only failed-create/retry/reload, required validation, source-less state and order passed; live topics/editions unchanged',
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
