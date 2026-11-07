// Read-only acceptance scan of every reader route using stored editions.
import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium, type Page } from 'playwright';

const forbidden =
  /\b(?:scores?|why selected|why it matters|candidates?|filters?|triage|claude|haiku|sonnet|grok|AI edited|non-AI|auto-ranked|fallback|excerpts|evidence|independent|parked|budgets?|coverage.period form|incoming.articles|incoming from your sources)\b/i;
// Only editorial text is exempt. Keep surrounding controls, source rows,
// post status messages and disclosure labels in the scan.
const editorial =
  '.topic-brief, .digest-topic h2, [id^="story-"] h3, .coverage li > a, .excerpt, .post-text, .post-context-text, .post-card .byline, nav[aria-label$="contents"] a[href*="#"], .bluesky-media .sr-only';

async function scan(page: Page, label: string) {
  const labels = await page.evaluate((selector) => {
    const copy = document.body.cloneNode(true) as HTMLElement;
    copy
      .querySelectorAll(`${selector}, script, style`)
      .forEach((node) => node.remove());
    return [
      copy.textContent ?? '',
      ...Array.from(copy.querySelectorAll('[aria-label], [title]')).flatMap(
        (node) => [
          node.getAttribute('aria-label') ?? '',
          node.getAttribute('title') ?? '',
        ],
      ),
    ].join('\n');
  }, editorial);
  assert.doesNotMatch(labels, forbidden, label);
}

async function smoke() {
  const origin = 'http://localhost:8000';
  const history = readerEditionHistorySchema.parse(
    await (await fetch(`${origin}/api/editions?offset=0`)).json(),
  );
  assert.ok(history.entries.length > 1, 'Need real current and past editions');
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390])
      for (const colorScheme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 1100 },
          colorScheme,
        });
        await context.route('**/*', (route) => {
          const request = route.request();
          assert.equal(request.method(), 'GET');
          return new URL(request.url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        for (const path of [
          '/',
          '/editions',
          `/editions/${history.entries[1].id}`,
        ]) {
          await page.goto(`${origin}${path}`);
          await page
            .locator(path === '/editions' ? 'main li' : '.digest-topic')
            .first()
            .waitFor();
          await scan(page, `${path} ${width} ${colorScheme}`);
          if (path !== '/editions' && width === 390) {
            await page
              .getByRole('button', { name: 'Contents', exact: true })
              .click();
            await scan(page, `${path} mobile contents ${colorScheme}`);
            await page.keyboard.press('Escape');
          }
        }
        // Prove the scan still rejects a system label outside editorial text.
        await page.evaluate(() => {
          const label = document.createElement('p');
          label.textContent = 'AI edited';
          document.body.append(label);
        });
        await assert.rejects(scan(page, 'injected forbidden label'));
        await context.close();
      }
    console.log(
      'Reader label scan passed: all three routes, desktop/mobile light/dark and mobile contents; rejection control passed.',
    );
  } finally {
    await browser.close();
  }
}
smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
