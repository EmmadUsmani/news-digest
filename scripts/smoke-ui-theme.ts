import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { type BrowserContext, chromium, type Page } from 'playwright';

async function smoke() {
  const origin = 'http://localhost:8000';
  const readEdition = async () => {
    const response = await fetch(`${origin}/api/editions/latest`, {
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200);
    return readerEditionSchema.parse(await response.json());
  };
  const saved = await readEdition();
  assert.ok(saved.topics.some((topic) => topic.stories.length));
  const writes: string[] = [];
  const errors: string[] = [];
  const protect = async (context: BrowserContext) => {
    context.setDefaultTimeout(15000);
    context.on('page', (page) => {
      page.on('pageerror', (error) => errors.push(error.message));
    });
    await context.route('**/*', async (route) => {
      const request = route.request();
      if (!['GET', 'HEAD'].includes(request.method())) {
        writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
        return route.abort();
      }
      if (new URL(request.url()).origin !== origin) return route.abort();
      return route.continue();
    });
  };
  const expectSavedContent = async (page: Page) => {
    await page.locator('.digest-topic').last().waitFor();
    assert.equal(
      await page.locator('.digest-topic').count(),
      saved.topics.length,
    );
    for (const topic of saved.topics) {
      const section = page.locator('.digest-topic').filter({
        has: page.getByRole('heading', { name: topic.name, exact: true }),
      });
      assert.equal(
        await section.locator('[data-slot="card"][id^="story-"]').count(),
        topic.stories.length,
      );
      assert.deepEqual(
        await section.locator('.post-card .post-text').allTextContents(),
        topic.posts
          .map((post) =>
            post.platform === 'x'
              ? `${post.displayText ?? post.text} — View post by ${post.author} on X`
              : post.platform === 'bluesky'
                ? post.text
                : post.displayText,
          )
          .filter((text) => text !== undefined),
        'Theme changes preserve saved post text',
      );
      for (const story of topic.stories) {
        const item = section.locator(`[id="story-${story.id}"]`);
        await item.waitFor();
        assert.equal(await item.locator('h3 > a').textContent(), story.title);
        if (story.summary)
          assert.equal(
            await item.locator('.excerpt').textContent(),
            story.summary,
          );
      }
    }
  };
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const context = await browser.newContext({
        viewport: { width, height },
        colorScheme: 'dark',
      });
      await protect(context);
      const page = await context.newPage();
      await page.goto('http://localhost:8000/');
      await expectSavedContent(page);
      const isDark = () =>
        page.evaluate(() =>
          document.documentElement.classList.contains('dark'),
        );
      assert.equal(await isDark(), true, 'Defaults to system dark');
      await page.emulateMedia({ colorScheme: 'light' });
      await page
        .getByRole('button', { name: 'Switch to dark theme' })
        .waitFor();
      assert.equal(await isDark(), false, 'Follows system changes');
      for (const theme of ['light', 'dark'] as const) {
        if (theme === 'dark')
          await page
            .getByRole('button', { name: 'Switch to dark theme' })
            .click();
        await expectSavedContent(page);
        await page.evaluate(() => document.fonts.ready);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          animations: 'disabled',
          path: `docs/screenshots/ui/reader-theme-${device}-${theme}.png`,
        });
      }
      await page.reload();
      await page
        .getByRole('button', { name: 'Switch to light theme' })
        .waitFor();
      assert.equal(
        await isDark(),
        true,
        'Saved dark overrides system light after reload',
      );
      await expectSavedContent(page);
      const sibling = await context.newPage();
      await sibling.goto('http://localhost:8000/');
      await sibling
        .getByRole('button', { name: 'Switch to light theme' })
        .click();
      await page
        .getByRole('button', { name: 'Switch to dark theme' })
        .waitFor();
      assert.equal(await isDark(), false, 'Other tabs follow saved preference');
      await expectSavedContent(page);
      await expectSavedContent(sibling);
      await context.close();
    }
    const context = await browser.newContext({ colorScheme: 'dark' });
    await protect(context);
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('Storage disabled');
        },
      });
    });
    const page = await context.newPage();
    await page.goto('http://localhost:8000/');
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await page.getByRole('button', { name: 'Switch to dark theme' }).waitFor();
    await expectSavedContent(page);
    await context.close();
    assert.deepEqual(writes, [], 'No browser API writes');
    assert.deepEqual(errors, []);
    assert.deepEqual(
      await readEdition(),
      saved,
      'Saved reader edition unchanged',
    );
    console.log(
      'Theme desktop/mobile, system changes, persistence, cross-tab, blocked storage and saved reader content passed without API writes.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
