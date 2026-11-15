// Capture published reader content, then replay it through storage recovery.
// Local preferences only; server writes, admin and external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.168' };
  const response = await fetch(`${origin}/api/editions/latest`, {
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, 'capture published reader edition');
  const edition = readerEditionSchema.parse(await response.json());
  const topic = edition.topics.find(
    (topic) => topic.stories.length && topic.posts.length,
  );
  assert.ok(topic);
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          assert.ok(!url.pathname.startsWith('/api/admin/'));
          if (
            url.pathname === '/api/editions/latest' ||
            url.pathname === `/api/editions/${edition.id}`
          )
            return route.fulfill({ json: edition });
          return route.continue();
        });
        const key = 'news-digest.reader-preferences.v1';
        const original = JSON.stringify({
          version: 1,
          hiddenTopics: {},
          bookmarks: {
            'story:offline-fixture': {
              updatedAt: 1,
              copy: {
                title: 'Offline storage preservation fixture',
                url: 'https://example.org/fixture',
                attribution: 'Offline fixture',
                excerpt: 'Not live content',
                platform: 'story',
                editionId: edition.id,
              },
            },
          },
        });
        await page.goto(origin);
        await page.evaluate(
          ({ key, original }) => localStorage.setItem(key, original),
          { key, original },
        );
        await page.addInitScript(`
          const nativeRead = Storage.prototype.getItem;
          window.restoreStorageRead = () => { Storage.prototype.getItem = nativeRead; };
          Storage.prototype.getItem = function(name) {
            if (name === 'news-digest.reader-preferences.v1') throw new DOMException('Read temporarily unavailable');
            return nativeRead.call(this, name);
          };
        `);
        await page.reload();
        assert.equal(
          await page.evaluate((key) => {
            try {
              localStorage.getItem(key);
              return false;
            } catch {
              return true;
            }
          }, key),
          true,
        );
        await page.getByRole('button', { name: 'Topics', exact: true }).click();
        await page
          .getByRole('dialog')
          .getByRole('checkbox', { name: topic.name, exact: true })
          .uncheck();
        await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
          'could not save',
        );
        await page.keyboard.press('Escape');
        const story = edition.topics.find(
          (candidate) => candidate.id !== topic.id && candidate.stories.length,
        )!.stories[0];
        await page
          .getByRole('button', {
            name: `Save story: ${story.title}`,
            exact: true,
          })
          .click();
        await page.screenshot({
          path: `docs/screenshots/ui/storage-read-preservation-${device}-${theme}.png`,
        });
        await page.evaluate(() =>
          (
            window as unknown as { restoreStorageRead: () => void }
          ).restoreStorageRead(),
        );
        assert.equal(
          await page.evaluate((key) => localStorage.getItem(key), key),
          original,
        );
        // The next successful read merges the unseen save and both in-memory changes.
        await page.getByRole('button', { name: 'Topics', exact: true }).click();
        await page
          .getByRole('dialog')
          .getByRole('checkbox', { name: topic.name, exact: true })
          .check();
        const stored = await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          key,
        );
        assert.equal(
          Object.values(stored.bookmarks).filter(
            (change) => (change as { copy: unknown }).copy,
          ).length,
          2,
        );
        assert.equal(stored.hiddenTopics[topic.id].hidden, false);
        // A transient event read failure must clear after an identical successful
        // read, even when the union needs no repair write.
        await page.evaluate(`
          const workingRead = Storage.prototype.getItem;
          Storage.prototype.getItem = function(name) {
            if (name === 'news-digest.reader-preferences.v1') throw new DOMException('Temporary read failure');
            return workingRead.call(this, name);
          };
          window.dispatchEvent(new StorageEvent('storage', { key: 'news-digest.reader-preferences.v1' }));
        `);
        await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
          'could not save',
        );
        await page.evaluate(`
          window.restoreStorageRead();
          window.dispatchEvent(new StorageEvent('storage', { key: 'news-digest.reader-preferences.v1' }));
        `);
        await expect(page.getByRole('dialog').getByRole('alert')).toHaveCount(
          0,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/storage-read-recovered-${device}-${theme}.png`,
        });

        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      'Storage read failure preserves saves, merges pending choices and clears warnings after recovery: desktop/mobile light/dark pass.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
