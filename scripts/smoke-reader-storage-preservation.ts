// GET-only published content; local preferences only, external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
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
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
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
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      'Read-only storage failure preserves existing saves and later merges pending choices: desktop/mobile light/dark pass.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
