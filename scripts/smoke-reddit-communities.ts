// Browser replay only: intercept topic writes, never change the live configuration.
import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

const base = 'http://localhost:8000';
async function main() {
  const browser = await chromium.launch();
  try {
    const [before, profile, status, content, latest] = await Promise.all([
      localAdminJson('/api/admin/topics'),
      localAdminJson('/api/admin/profile'),
      localAdminJson('/api/admin/status'),
      localAdminJson('/api/admin/content'),
      localAdminJson('/api/admin/digest-previews/latest'),
    ]);
    const editionPath = latest
      ? '/api/admin/digest-previews/' + (latest as { id: string }).id
      : null;
    const savedEdition = editionPath ? await localAdminJson(editionPath) : null;
    const snapshots: Record<string, unknown> = {
      '/api/profile': profile,
      '/api/status': status,
      '/api/content': content,
    };
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({
        viewport: { width, height },
        serviceWorkers: 'block',
      });
      const topics = topicSchema.array().parse(before);
      const topic = topics[0];
      let writes = 0;
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      let fail = true;
      const credentials: string[] = [];
      const unexpectedWrites: string[] = [];
      page.on('request', (request) => {
        const headers = request.headers();
        if ('admin_local_token' in headers || 'x-exedev-email' in headers)
          credentials.push(new URL(request.url()).pathname);
      });
      await page.route('**/*', async (route) => {
        const request = route.request();
        const path = new URL(request.url()).pathname;
        const headers = request.headers();
        if ('admin_local_token' in headers || 'x-exedev-email' in headers)
          return route.abort();
        assert.ok(
          !/(^|\.)reddit\.com$/.test(new URL(request.url()).hostname),
          'No Reddit fetching',
        );
        if (path === `/api/topics/${topic.id}` && request.method() === 'PUT') {
          writes++;
          if (fail) return route.fulfill({ status: 503, json: {} });
          Object.assign(topic, topicUpdateSchema.parse(request.postDataJSON()));
          return route.fulfill({ json: topic });
        }
        if (!['GET', 'HEAD'].includes(request.method())) {
          unexpectedWrites.push(`${request.method()} ${path}`);
          return route.abort();
        }
        if (path === '/api/topics') return route.fulfill({ json: topics });
        if (Object.hasOwn(snapshots, path))
          return route.fulfill({ json: snapshots[path] });
        return route.continue();
      });
      const open = async () => {
        await page.getByText('Manage topics', { exact: true }).click();
        await page
          .getByRole('button', { name: `Edit ${topic.name}`, exact: true })
          .click();
      };
      await page.goto(base);
      assert.equal(
        await page.evaluate(() =>
          fetch('/api/browser-write-guard-probe', { method: 'POST' }).then(
            () => false,
            () => true,
          ),
        ),
        true,
      );
      assert.deepEqual(unexpectedWrites.splice(0), [
        'POST /api/browser-write-guard-probe',
      ]);
      await open();
      assert.match(
        await page.locator('#reddit-communities-help').innerText(),
        /parked by owner and unscheduled/,
      );
      const field = page.getByRole('textbox', {
        name: 'Reddit communities · one per line',
        exact: true,
      });
      await field.fill('r/nba\nLocalLLaMA');
      await page
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not save topic settings.' })
        .waitFor();
      assert.equal(await field.inputValue(), 'r/nba\nLocalLLaMA');
      assert.equal(writes, 1);
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not save topic settings.' })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/reddit-communities-failure-${name}.png`,
      });
      fail = false;
      await page
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('button', { name: `Edit ${topic.name}`, exact: true })
        .waitFor();
      assert.equal(writes, 2);
      assert.deepEqual(topic.redditCommunities, ['nba', 'LocalLLaMA']);
      await page.reload();
      await open();
      assert.equal(await field.inputValue(), 'nba\nLocalLLaMA');
      await field.fill('nba\nNBA');
      await page
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Check the name' })
        .waitFor();
      assert.equal(writes, 2);
      await field.fill('nba\nLocalLLaMA');
      await field.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/reddit-communities-${name}.png`,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      await field.fill('');
      await page
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('button', { name: `Edit ${topic.name}`, exact: true })
        .waitFor();
      assert.deepEqual(topic.redditCommunities, []);
      assert.equal(writes, 3);
      await page.reload();
      await open();
      assert.equal(await field.inputValue(), '');
      assert.deepEqual(credentials, []);
      assert.deepEqual(unexpectedWrites, []);
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(await localAdminJson('/api/admin/topics'), before);
    assert.deepEqual(await localAdminJson('/api/admin/profile'), profile);
    if (editionPath)
      assert.deepEqual(await localAdminJson(editionPath), savedEdition);
    console.log(
      'Reddit settings replay: desktop/mobile failure, retained fields, retry, normalize, reload, reject duplicates, clear; browser writes guarded, credentials absent; live topics/profile/full edition unchanged; no Reddit fetching/inference.',
    );
  } finally {
    await browser.close();
  }
}
void main();
