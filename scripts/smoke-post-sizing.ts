// Real saved posts; a local widget stub exercises the official embed sizing contract.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8000';
async function smoke() {
  const saved = readerEditionSchema.parse(
    await (await fetch(`${base}/api/editions/latest`)).json(),
  );
  assert.ok(
    saved.topics.some((topic) => topic.posts.some((p) => p.platform === 'x')),
  );
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
        const errors: string[] = [],
          writes: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          if (request.url() === 'https://platform.twitter.com/widgets.js')
            return route.fulfill({
              contentType: 'text/javascript',
              body: `
              window.twttr = { widgets: { createTweet: async (id, target, options) => {
                const frame = document.createElement('iframe');
                frame.width = String(options.width);
                frame.height = '280';
                frame.title = 'Recorded widget sizing stub';
                frame.dataset.requestedWidth = String(options.width);
                frame.srcdoc = '<p>Recorded widget sizing stub</p>';
                target.append(frame);
                return frame;
              } } };
            `,
            });
          if (new URL(request.url()).origin !== base) return route.abort();
          return route.continue();
        });
        await page.goto(`${base}/editions/${saved.id}`);
        await page.locator('.digest-topic').last().waitFor();
        const hosts = page.locator('.official-post');
        assert.ok(await hosts.count());
        for (const host of await hosts.all()) {
          await host.scrollIntoViewIfNeeded();
          const card = host.locator('..');
          const timestamp = card.locator('time');
          const publishedAt = await timestamp.getAttribute('datetime');
          assert.ok(publishedAt);
          const exact = new Date(publishedAt).toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'long',
          });
          assert.equal(await timestamp.getAttribute('title'), exact);
          assert.equal(await timestamp.getAttribute('aria-label'), exact);
          assert.match(
            await timestamp.innerText(),
            /^(Just now|\d+[mhd] ago|[A-Z][a-z]+ \d+, \d{4})$/,
          );
          const savedText = card.locator('.saved-post-text');
          const frame = host.locator('iframe');
          await frame.waitFor();
          const note = card.locator('.post-context');
          if (await note.count()) {
            const noteBounds = await note.boundingBox();
            const frameBounds = await frame.boundingBox();
            assert.ok(noteBounds && frameBounds);
            assert.ok(
              noteBounds.y >= frameBounds.y + frameBounds.height,
              'Editorial context follows the loaded media',
            );
          }
          await savedText.locator('summary').click();
          const link = savedText.getByRole('link');
          const visibleText = await link.evaluate((element) =>
            [...element.childNodes]
              .filter((node) => node.nodeType === Node.TEXT_NODE)
              .map((node) => node.textContent)
              .join('')
              .replace(/\s+/g, ' ')
              .trim(),
          );
          assert.ok(visibleText.length > 0);
          const accessible = await link.ariaSnapshot();
          assert.equal(
            await savedText.getByRole('link', { name: visibleText }).count(),
            1,
            accessible,
          );
          assert.ok(accessible.includes('View post by'), accessible);
          await savedText.locator('summary').click();
          const sizes = await host.evaluate((element) => {
            const iframe = element.querySelector('iframe')!;
            return {
              available: element.clientWidth,
              requested: Number(iframe.dataset.requestedWidth),
              actual: iframe.getBoundingClientRect().width,
            };
          });
          assert.equal(
            sizes.requested,
            Math.min(550, Math.max(250, sizes.available)),
          );
          assert.ok(sizes.actual <= sizes.available + 1, JSON.stringify(sizes));
        }
        await hosts.first().scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `docs/screenshots/ui/post-sizing-${device}-${theme}.png`,
        });
        // A loaded iframe must also fit if its card shrinks after rotation/resizing.
        await page.setViewportSize({ width: 320, height: 844 });
        for (const host of await hosts.all()) {
          await host.scrollIntoViewIfNeeded();
          // Resizing replaces the official iframe asynchronously after debounce.
          await page.waitForFunction(
            (element) => {
              const frame = element?.querySelector('iframe');
              return (
                element &&
                frame &&
                Number(frame.dataset.requestedWidth) ===
                  Math.min(550, Math.max(250, element.clientWidth)) &&
                frame.getBoundingClientRect().width <= element.clientWidth + 1
              );
            },
            await host.elementHandle(),
          );
        }
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        assert.deepEqual(errors, []);
        assert.deepEqual(writes, []);
        await page.close();
      }
    }
    assert.deepEqual(
      readerEditionSchema.parse(
        await (await fetch(`${base}/api/editions/latest`)).json(),
      ),
      saved,
    );
    console.log(
      'Saved X posts: responsive widget widths and resize containment passed desktop/mobile light/dark; stubbed widgets, no writes, edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
