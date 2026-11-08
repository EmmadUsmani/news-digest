// Saved editions only; no external calls or server writes.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const history = await (
    await fetch(`${origin}/api/editions?limit=20&offset=0`)
  ).json();
  const older = history.entries.find(
    (entry: { id: string }) => entry.id !== edition.id,
  );
  assert.ok(older);
  const oldEdition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/${older.id}`)).json(),
  );
  assert.ok(
    oldEdition.topics.some((topic) => topic.id === edition.topics[0].id),
  );
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
        });
        const writes: string[] = [],
          errors: string[] = [];
        await context.route('**/*', (route) => {
          if (!['GET', 'HEAD'].includes(route.request().method())) {
            writes.push(route.request().method());
            return route.abort();
          }
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin);
        // Topic writes must preserve the bounded bookmark envelope for /saved.
        await page.evaluate(() => {
          localStorage.setItem(
            'news-digest.reader-preferences.v1',
            JSON.stringify({
              version: 1,
              hiddenTopics: {},
              bookmarks: {
                'story:regression': {
                  updatedAt: 1,
                  copy: {
                    title: 'Storage regression fixture',
                    url: 'https://example.org/story',
                    attribution: 'Offline fixture',
                    excerpt: 'Not live content',
                    platform: 'story',
                    editionId: 'fixture-edition',
                  },
                },
              },
            }),
          );
        });
        await page.reload();
        await expect(page.locator('.digest-topic')).toHaveCount(
          edition.topics.length,
        );
        await page.getByRole('button', { name: 'Topics', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog
          .getByRole('checkbox', { name: edition.topics[0].name, exact: true })
          .uncheck();
        await expect(page.locator('.digest-topic')).toHaveCount(
          edition.topics.length - 1,
        );
        assert.equal(
          await page.evaluate(
            () =>
              JSON.parse(
                localStorage.getItem('news-digest.reader-preferences.v1')!,
              ).bookmarks['story:regression'].copy.title,
          ),
          'Storage regression fixture',
        );
        await page.keyboard.press('Escape');
        await page.reload();
        await expect(page.locator('.digest-topic')).toHaveCount(
          edition.topics.length - 1,
        );
        await page.goto(`${origin}/editions/${older.id}`);
        await expect(page.locator('.digest-topic')).toHaveCount(
          oldEdition.topics.length - 1,
        );
        await expect(
          page.locator(`[id="topic-${edition.topics[0].id}"]`),
        ).toHaveCount(0);
        await page.goto(`${origin}/editions/${edition.id}`);
        await page.getByRole('button', { name: 'Topics', exact: true }).click();
        for (const checkbox of await dialog.getByRole('checkbox').all()) {
          const target = checkbox.locator('..');
          const bounds = await target.boundingBox();
          assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
        }
        for (const checkbox of await dialog.getByRole('checkbox').all())
          await checkbox.uncheck();
        await expect(
          page.getByRole('status', { includeHidden: true }),
        ).toContainText('All topics are hidden');
        // Tap the row padding, outside the checkbox and text.
        await dialog
          .getByRole('checkbox', { name: edition.topics[0].name, exact: true })
          .locator('..')
          .click({ position: { x: 4, y: 4 } });
        await page.screenshot({
          path: `docs/screenshots/reader-topics-menu-${device}-${theme}.png`,
        });
        await page.keyboard.press('Escape');
        await expect(page.locator('.digest-topic')).toHaveCount(1);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/reader-preferences-${device}-${theme}.png`,
        });
        const second = await context.newPage();
        await second.goto(origin);
        await expect(second.locator('.digest-topic')).toHaveCount(1);
        await second
          .getByRole('button', { name: 'Topics', exact: true })
          .click();
        for (const checkbox of await second
          .getByRole('dialog')
          .getByRole('checkbox')
          .all())
          await checkbox.check();
        await expect(page.locator('.digest-topic')).toHaveCount(
          edition.topics.length,
        );
        const saved = await page.evaluate(() =>
          JSON.parse(
            localStorage.getItem('news-digest.reader-preferences.v1')!,
          ),
        );
        assert.ok(
          Object.values(saved.hiddenTopics).every(
            (value) => (value as { hidden: boolean }).hidden === false,
          ),
        );
        await page.evaluate(() =>
          localStorage.setItem('news-digest.reader-preferences.v1', '{invalid'),
        );
        await page.reload();
        await expect(page.locator('.digest-topic')).toHaveCount(
          edition.topics.length,
        );
        await page.evaluate(() => {
          Storage.prototype.setItem = () => {
            throw new DOMException('blocked');
          };
        });
        await page.getByRole('button', { name: 'Topics', exact: true }).click();
        await dialog.getByRole('checkbox').first().uncheck();
        await expect(dialog.getByRole('alert')).toContainText('could not save');
        await page.addInitScript(() => {
          Storage.prototype.getItem = () => {
            throw new DOMException('blocked');
          };
        });
        await page.goto(`${origin}/saved`);
        await expect(page.getByRole('alert')).toContainText('could not save');
        await page.screenshot({
          path: `docs/screenshots/reader-storage-blocked-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(writes, []);
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${device}/${theme}: reload, old edition, all-hidden recovery, cross-tab, tombstones, corrupt/blocked storage pass`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
