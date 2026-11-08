// Published edition with an explicitly labelled offline long-excerpt fixture.
// GET-only, external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const story = edition.topics[0].stories[0];
  assert.ok(story?.summary);
  // Exercise the display limit without rewriting any saved server content.
  const fixture = structuredClone(edition);
  const fixtureStory = fixture.topics[0].stories[0];
  fixtureStory.title = 'Offline fixture: long saved excerpt';
  fixtureStory.summary =
    'Offline fixture reporting for the saved-item display limit. '.repeat(20);
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
        let useFixture = true;
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          if (
            useFixture &&
            route.request().url() === `${origin}/api/editions/${edition.id}`
          ) {
            return route.fulfill({ json: fixture });
          }
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/editions/${edition.id}`);
        await page
          .getByRole('button', {
            name: `Save story: ${fixtureStory.title}`,
            exact: true,
          })
          .click();
        await page.goto(`${origin}/saved`);
        const card = page.getByRole('listitem').filter({
          has: page.getByRole('link', {
            name: fixtureStory.title,
            exact: true,
          }),
        });
        const excerpt = card.locator('p.whitespace-pre-line');
        await expect(excerpt).toBeVisible();
        const text = await excerpt.innerText();
        assert.ok(text.length <= 600 && text.endsWith('…'));
        assert.ok(fixtureStory.summary.startsWith(text.slice(0, -1)));
        assert.match(fixtureStory.summary.slice(text.length - 1), /^\s/u);
        await page.reload();
        await expect(excerpt).toHaveText(text);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/saved-excerpt-${device}-${theme}.png`,
          fullPage: true,
        });
        await page
          .getByRole('button', {
            name: `Remove saved item: ${fixtureStory.title}`,
            exact: true,
          })
          .click();
        useFixture = false;
        await page.goto(`${origin}/editions/${edition.id}`);
        await page
          .getByRole('button', {
            name: `Save story: ${story.title}`,
            exact: true,
          })
          .click();
        await page.goto(`${origin}/saved`);
        await expect(page.locator('p.whitespace-pre-line')).toHaveText(
          story.summary,
        );
        const headline = page.getByRole('link', {
          name: story.title,
          exact: true,
        });
        assert.equal(
          await headline.evaluate((node) => getComputedStyle(node).display),
          'flex',
        );
        const bounds = await headline.boundingBox();
        assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
        assert.equal(await headline.getAttribute('href'), story.url);
        await headline.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        assert.ok(
          await headline.evaluate((node) => document.activeElement === node),
        );
        assert.equal(
          await headline.evaluate(
            (node) => getComputedStyle(node).outlineStyle,
          ),
          'solid',
        );
        await page.screenshot({
          path: `docs/screenshots/ui/saved-headline-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        console.log(
          `${device}/${theme}: offline fixture excerpt shortened visibly and preserved on reload`,
        );
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
