// Saved edition, blocked widget followed by a local recovery stub. No external calls.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8000';
async function smoke() {
  const saved = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const posts = saved.topics
    .flatMap((topic) => topic.posts)
    .filter((post) => post.platform === 'x');
  const post =
    posts.find((post) => post.author.includes('Santa Monica')) ?? posts[0];
  assert.ok(post);
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
        let recover = false;
        const writes: string[] = [],
          errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          if (
            request.url() === 'https://platform.twitter.com/widgets.js' &&
            recover
          ) {
            return route.fulfill({
              contentType: 'text/javascript',
              body: `
              window.twttr = {widgets: {createTweet: async (id, target, options) => {
                const frame = document.createElement('iframe');
                frame.title = 'Local media recovery stub';
                frame.dataset.theme = options.theme;
                frame.srcdoc = '<p>Local media recovery stub</p>';
                target.append(frame); return frame;
              }}};
            `,
            });
          }
          if (new URL(request.url()).origin !== origin) return route.abort();
          return route.continue();
        });
        await page.goto(`${origin}/editions/${saved.id}`);
        const card = page.locator('.post-card').filter({
          has: page.getByRole('link', {
            name: `${post.displayText ?? post.text} — View post by ${post.author} on X`,
            exact: true,
            includeHidden: true,
          }),
        });
        await card.scrollIntoViewIfNeeded();
        const status = card.getByRole('status');
        await status.waitFor();
        assert.equal(
          await status.innerText(),
          'X media could not load. Saved post text is shown above.',
        );
        assert.ok(await card.locator('.post-text').isVisible());
        assert.equal(
          await card.locator('.post-context-text').innerText(),
          post.whyItMatters,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/x-media-failure-${device}-${theme}.png`,
        });
        recover = true;
        await card
          .getByRole('button', { name: 'Retry X media', exact: true })
          .click();
        await card.locator('iframe').waitFor();
        assert.equal(await status.count(), 0);
        assert.equal(await card.locator('.saved-post-text').count(), 1);
        await card.locator('.saved-post-text summary').click();
        assert.ok(await card.locator('.post-text').isVisible());
        const toggleTheme = async (next: 'light' | 'dark') => {
          await page
            .getByRole('button', { name: `Switch to ${next} theme` })
            .click();
          await card.scrollIntoViewIfNeeded();
          await card.locator(`iframe[data-theme="${next}"]`).waitFor();
        };
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        await toggleTheme(nextTheme);
        assert.ok(
          await card.locator('.post-text').isVisible(),
          'Opened saved text remains visible after the theme rebuilds X media',
        );
        await page.screenshot({
          path: `docs/screenshots/ui/x-saved-text-theme-${device}-${nextTheme}.png`,
        });
        await card.locator('.saved-post-text summary').click();
        await toggleTheme(theme);
        assert.equal(
          await card.locator('.post-text').isVisible(),
          false,
          'Collapsed saved text remains collapsed after rebuilding X media',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        assert.deepEqual(writes, []);
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    assert.deepEqual(
      readerEditionSchema.parse(
        await (await fetch(`${origin}/api/editions/latest`)).json(),
      ),
      saved,
    );
    console.log(
      'Saved X media failure/retry and saved-text theme persistence: desktop/mobile light/dark passed; local widget stub, no writes or external calls.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
