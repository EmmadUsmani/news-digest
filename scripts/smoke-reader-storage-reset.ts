// Real published stories; browser-only writes, external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const topic = edition.topics[0];
  const story = topic.stories[0];
  const key = 'news-digest.reader-preferences.v1';
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390]) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
        });
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const reader = await context.newPage();
        const saved = await context.newPage();
        const control = await context.newPage();
        await control.goto(`${origin}/saved`);
        await reader.goto(`${origin}/editions/${edition.id}`);
        await saved.goto(`${origin}/saved`);
        for (const mode of ['remove', 'clear']) {
          await reader
            .getByRole('button', {
              name: `Save story: ${story.title}`,
              exact: true,
            })
            .click();
          await expect(
            saved.getByRole('link', { name: story.title, exact: true }),
          ).toBeVisible();
          await reader
            .getByRole('button', { name: 'Topics', exact: true })
            .click();
          await reader
            .getByRole('checkbox', { name: topic.name, exact: true })
            .uncheck();
          await reader.keyboard.press('Escape');
          await expect(
            reader.getByRole('heading', { name: topic.name, exact: true }),
          ).toHaveCount(0);
          await control.evaluate(
            ({ mode, key }) => {
              if (mode === 'clear') localStorage.clear();
              else localStorage.removeItem(key);
            },
            { mode, key },
          );
          await expect(
            saved.getByText('No saved items yet.', { exact: false }),
          ).toBeVisible();
          await expect(
            reader.getByRole('heading', { name: topic.name, exact: true }),
          ).toBeVisible();
          assert.equal(
            await control.evaluate((key) => localStorage.getItem(key), key),
            null,
          );
          await reader.reload();
          await saved.reload();
          await expect(
            saved.getByText('No saved items yet.', { exact: false }),
          ).toBeVisible();
        }
        await saved.screenshot({
          path: `docs/screenshots/ui/reader-storage-reset-${width}-${theme}.png`,
        });
        await context.close();
        console.log(
          `${width}/${theme}: remove/clear reset bookmarks and hidden topics across tabs and reload`,
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
