// Explicit browser replay; protected live reads, no writes or inference/search.
import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

const base = 'http://localhost:8000';
async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const original = topicSchema
    .array()
    .parse(await localAdminJson('/api/admin/topics'));
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
  const id = '00000000-0000-4000-8000-999999999998';
  const input = {
    name: 'X account settings check',
    description: '',
    includeGuidance: '',
    excludeGuidance: '',
    enabled: false,
    storyBudget: 0,
    postBudget: 0,
    relevancePolicy: { includeAny: [], excludeAny: [] },
    accounts: ['NBA'],
  };
  const replayTopics = structuredClone(original);
  const initial = topicSchema.parse({
    ...input,
    id,
    profileId: original[0].profileId,
    position: original.length,
    sources: [],
    queries: [],
  });
  replayTopics.push(structuredClone(initial));
  let saves = 0;
  let attempts = 0;
  let failSave = true;
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
    if (path === `/api/topics/${id}` && request.method() === 'PUT') {
      const parsed = topicUpdateSchema.safeParse(request.postDataJSON());
      assert.equal(
        parsed.success,
        true,
        'Browser must reject duplicate handles before sending',
      );
      if (!parsed.success) throw new Error('Invalid browser update');
      attempts++;
      if (failSave) {
        await route.fulfill({ status: 503, body: 'Unavailable' });
        return;
      }
      const saved = topicSchema.parse({ ...initial, ...parsed.data });
      replayTopics[original.length] = saved;
      saves++;
      await route.fulfill({ json: saved });
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
      replayTopics[original.length] = structuredClone(initial);
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      failSave = true;
      const previousSaves = saves;
      const previousAttempts = attempts;
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
        .getByRole('button', { name: `Edit ${input.name}`, exact: true })
        .click();
      const form = page.getByRole('form', {
        name: `Edit ${input.name}`,
        exact: true,
      });
      await form
        .getByRole('textbox', {
          name: 'X accounts · one handle per line',
          exact: true,
        })
        .fill('@NBA\nNBAPR');
      await form
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not save topic settings.' })
        .waitFor();
      assert.equal(attempts, previousAttempts + 1);
      assert.equal(saves, previousSaves);
      assert.deepEqual(replayTopics[original.length].accounts, ['NBA']);
      assert.equal(
        await form
          .getByRole('textbox', {
            name: 'X accounts · one handle per line',
            exact: true,
          })
          .inputValue(),
        '@NBA\nNBAPR',
      );
      await page.screenshot({
        path: `docs/screenshots/topic-accounts-failure-${name}.png`,
      });
      failSave = false;
      await form
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: `Saved ${input.name}.` })
        .waitFor();
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: `Edit ${input.name}`, exact: true })
        .click();
      const handles = form.getByRole('textbox', {
        name: 'X accounts · one handle per line',
        exact: true,
      });
      assert.equal(await handles.inputValue(), 'NBA\nNBAPR');
      await handles.fill('NBA\nnba');
      await form
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'up to 20 unique handles' })
        .waitFor();
      assert.equal(
        saves,
        previousSaves + 1,
        'Duplicate handles must not send another save',
      );
      assert.equal(attempts, previousAttempts + 2);
      assert.deepEqual(replayTopics[original.length].accounts, [
        'NBA',
        'NBAPR',
      ]);
      await handles.fill('NBA\nNBAPR');
      await handles.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/topic-accounts-${name}.png`,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(credentials, []);
    assert.deepEqual(unexpectedWrites, []);
    console.log(
      'X account settings: desktop/mobile browser-only failure/retry/save/reload, @ normalization and duplicate prevention pass; protected reads prove live topics/profile/full edition unchanged; no inference/search',
    );
  } finally {
    assert.deepEqual(await localAdminJson('/api/admin/topics'), original);
    assert.deepEqual(await localAdminJson('/api/admin/profile'), profile);
    if (latest)
      assert.deepEqual(
        await localAdminJson('/api/admin/digest-previews/' + latest.id),
        savedEdition,
      );
    await context.close();
    await browser.close();
  }
}
void main();
