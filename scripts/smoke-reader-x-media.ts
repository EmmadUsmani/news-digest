// Saved edition, blocked widget followed by a local recovery stub. No external calls.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

const origin = 'http://127.0.0.1:8000';
async function smoke() {
  const saved = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const posts = saved.topics
    .flatMap((topic) => topic.posts)
    .filter((post) => post.platform === 'x');
  const post = posts.find((post) => post.whyItMatters?.trim()) ?? posts[0];
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
        let releaseInitial!: () => void;
        const initialGate = new Promise<void>((resolve) => {
          releaseInitial = resolve;
        });
        let releaseRecovery!: () => void;
        const recoveryGate = new Promise<void>((resolve) => {
          releaseRecovery = resolve;
        });
        const writes: string[] = [],
          errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', async (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          if (
            request.url() === 'https://platform.twitter.com/widgets.js' &&
            recover
          ) {
            await recoveryGate;
            return route.fulfill({
              contentType: 'text/javascript',
              body: `
              window.twttr = {widgets: {createTweet: async (id, target, options) => {
                await window.mediaReplacementGate;
                const frame = document.createElement('iframe');
                frame.title = 'Local media recovery stub';
                frame.dataset.theme = options.theme;
                frame.dataset.width = String(options.width);
                frame.style.width = options.width + 'px';
                frame.srcdoc = '<p>Local media recovery stub</p>';
                target.append(frame); return frame;
              }}};
            `,
            });
          }
          if (request.url() === 'https://platform.twitter.com/widgets.js') {
            await initialGate;
            return route.abort();
          }
          if (new URL(request.url()).origin !== origin) return route.abort();
          return route.continue();
        });
        await page.goto(`${origin}/editions/${saved.id}`);
        const card = page.locator('.post-card').filter({
          has: page.locator(`.byline a[href="${post.url}"]`),
        });
        await card.scrollIntoViewIfNeeded();
        const status = card.getByRole('status');
        await status.filter({ hasText: 'Loading X post…' }).waitFor();
        assert.ok(await card.locator('.post-text').isVisible());
        await page.screenshot({
          path: `docs/screenshots/ui/x-media-loading-${device}-${theme}.png`,
        });
        releaseInitial();
        await status.filter({ hasText: 'X media unavailable.' }).waitFor();
        assert.equal(await status.innerText(), 'X media unavailable.');
        const failureRow = card.locator('.x-media-error');
        assert.ok(
          (await failureRow.boundingBox())!.height <= 72,
          'Unavailable media, original link and retry fit in two compact rows',
        );
        const original = failureRow.getByRole('link', {
          name: 'Open original on X',
          exact: true,
        });
        await expect(original).toHaveAttribute('href', post.url);
        await expect(original).toHaveAttribute('target', '_blank');
        await original.focus();
        await expect(original).toBeFocused();
        assert.ok(
          await failureRow.evaluate(
            (node) => node.scrollWidth <= node.clientWidth,
          ),
          'Fallback actions stay inside the card',
        );
        assert.ok(await card.locator('.post-text').isVisible());
        if (post.whyItMatters?.trim())
          assert.equal(
            await card.locator('.post-context-text').innerText(),
            post.whyItMatters,
          );
        await page.screenshot({
          path: `docs/screenshots/ui/x-media-failure-${device}-${theme}.png`,
        });
        recover = true;
        await card
          .getByRole('button', { name: 'Retry X post', exact: true })
          .click();
        await status.filter({ hasText: 'Loading X post…' }).waitFor();
        assert.equal(await card.locator('.x-media-error').count(), 0);
        assert.ok(await card.locator('.post-text').isVisible());
        await expect(card.locator('.post-text a').first()).toBeFocused();
        releaseRecovery();
        await card.locator('iframe').waitFor();
        assert.equal(await status.count(), 0);
        await expect(card.locator('.post-text a').first()).toBeFocused();
        assert.ok(await card.locator('.post-text').isVisible());
        await card.locator('.saved-post-text summary').click();
        assert.equal(await card.locator('.saved-post-text').count(), 1);
        await card.locator('.saved-post-text summary').click();
        assert.ok(await card.locator('.post-text').isVisible());
        const savedLink = card.locator('.post-text a').last();
        assert.equal(
          await savedLink.evaluate((node) => getComputedStyle(node).fontSize),
          '16px',
        );
        await savedLink.focus();
        for (const resizedWidth of [320, 844, width]) {
          await page.setViewportSize({ width: resizedWidth, height });
          await card.scrollIntoViewIfNeeded();
          const mediaWidth = await card
            .locator('.official-post')
            .evaluate((node) => Math.min(550, Math.max(250, node.clientWidth)));
          await expect(card.locator('iframe')).toHaveAttribute(
            'data-width',
            String(mediaWidth),
          );
          assert.ok(await card.locator('.post-text').isVisible());
          await expect(savedLink).toBeFocused();
        }
        const disclosure = card.locator('.saved-post-text summary');
        await disclosure.click();
        await expect(disclosure).toBeFocused();
        const oldMediaHeight = await card
          .locator('.official-post')
          .evaluate((node) => node.getBoundingClientRect().height);
        await page.evaluate(() => {
          const state = window as Window & {
            mediaReplacementGate?: Promise<void>;
            releaseMediaReplacement?: () => void;
          };
          state.mediaReplacementGate = new Promise<void>((resolve) => {
            state.releaseMediaReplacement = resolve;
          });
        });
        const changedTheme = theme === 'light' ? 'dark' : 'light';
        await page.emulateMedia({ colorScheme: changedTheme });
        await status.filter({ hasText: 'Loading X post…' }).waitFor();
        assert.ok(
          await card
            .locator('.official-post')
            .evaluate(
              (node, previous) =>
                node.getBoundingClientRect().height >= previous,
              oldMediaHeight,
            ),
          'Media keeps its previous height while replacement is pending',
        );
        await page.screenshot({
          path: `docs/screenshots/ui/x-media-replacement-${device}-${theme}.png`,
        });
        await page.evaluate(() => {
          (
            window as Window & { releaseMediaReplacement?: () => void }
          ).releaseMediaReplacement?.();
        });
        await card.locator(`iframe[data-theme="${changedTheme}"]`).waitFor();
        await expect(disclosure).toBeFocused();
        assert.equal(await card.locator('.post-text').isVisible(), false);
        await page.emulateMedia({ colorScheme: theme });
        await card.locator(`iframe[data-theme="${theme}"]`).waitFor();
        await expect(disclosure).toBeFocused();
        await disclosure.click();
        await savedLink.focus();
        const systemTheme = theme === 'light' ? 'dark' : 'light';
        await page.emulateMedia({ colorScheme: systemTheme });
        await card.locator(`iframe[data-theme="${systemTheme}"]`).waitFor();
        await expect(savedLink).toBeFocused();
        await page.emulateMedia({ colorScheme: theme });
        await card.locator(`iframe[data-theme="${theme}"]`).waitFor();
        await expect(savedLink).toBeFocused();
        await page.screenshot({
          path: `docs/screenshots/ui/x-media-resize-${device}-${theme}.png`,
        });
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
      'Saved X media loading/failure/retry and saved-text theme persistence: desktop/mobile light/dark passed; local widget stub, no writes or external calls.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
