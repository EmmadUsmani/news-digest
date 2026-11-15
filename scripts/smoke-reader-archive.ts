// Read-only loopback archive checks with a public-mode visitor, no identity.
// External requests blocked; pagination and failures replay saved response bodies.
import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const timeZone = process.env.READER_TIME_ZONE ?? 'America/New_York';
  const readHistory = async (offset: number) => {
    const response = await fetch(`${origin}/api/editions?offset=${offset}`, {
      headers: { 'X-Forwarded-For': '192.0.2.163' },
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(response.status, 200, `history offset ${offset}`);
    return readerEditionHistorySchema.parse(await response.json());
  };
  const admitReader = async (context: import('playwright').BrowserContext) => {
    await context.route('**/*', (route) => {
      const request = route.request();
      assert.ok(['GET', 'HEAD'].includes(request.method()));
      const url = new URL(request.url());
      assert.ok(!url.pathname.startsWith('/api/admin/'));
      return url.origin === origin
        ? route.continue({
            headers: {
              ...request.headers(),
              'X-Forwarded-For': '192.0.2.163',
            },
          })
        : route.abort();
    });
  };
  const saved = await readHistory(0);
  assert.ok(saved.entries.length);
  assert.ok(saved.entries[0].topics.length);
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
      ['narrow', 320, 740],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          locale: 'en-US',
          timezoneId: timeZone,
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await admitReader(context);
        await page.goto(`${origin}/editions`);
        await page
          .getByRole('link', {
            name: new RegExp(saved.entries[0].topics[0].name),
          })
          .first()
          .waitFor();
        assert.equal(await page.locator('li').count(), saved.entries.length);
        for (const entry of saved.entries) {
          const link = page.locator(`main li a[href="/editions/${entry.id}"]`);
          const window = link.locator('.archive-window');
          assert.deepEqual(
            await window
              .locator('time')
              .evaluateAll((items) =>
                items.map((item) => item.getAttribute('datetime')),
              ),
            [entry.windowStart, entry.windowEnd],
          );
          for (const timestamp of [entry.windowStart, entry.windowEnd]) {
            assert.ok(
              (await window.innerText()).includes(
                new Date(timestamp).toLocaleString('en-US', {
                  timeZone,
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                }),
              ),
            );
          }
        }
        assert.ok(
          await page
            .getByRole('heading', { name: 'Past editions' })
            .isVisible(),
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        assert.doesNotMatch(
          await page.locator('main').innerText(),
          /why selected|auto-ranked|fallback|triage|budget|AI edited/i,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/reader-archive-${device}-${theme}${timeZone === 'America/New_York' ? '' : '-tokyo'}.png`,
        });
        await page
          .locator(`a[href="/editions/${saved.entries[0].id}"]`)
          .click();
        await page.locator('.digest-topic').last().waitFor();
        assert.equal(
          new URL(page.url()).pathname,
          `/editions/${saved.entries[0].id}`,
        );
        const dates = page.getByRole('navigation', {
          name: 'Edition dates',
          exact: true,
        });
        assert.equal(
          await dates
            .getByRole('link', { name: 'Newer edition', exact: true })
            .count(),
          0,
        );
        if (saved.entries.length > 1) {
          await dates
            .getByRole('link', { name: 'Older edition', exact: true })
            .click();
          await page.waitForURL(`**/editions/${saved.entries[1].id}`);
          await dates
            .getByRole('link', { name: 'Newer edition', exact: true })
            .click();
          await page.waitForURL(`**/editions/${saved.entries[0].id}`);
          await page.reload();
          await dates
            .getByRole('link', { name: 'Older edition', exact: true })
            .waitFor();
        }
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/reader-dates-${device}-${theme}${timeZone === 'America/New_York' ? '' : '-tokyo'}.png`,
        });
        await dates.getByRole('link', { name: 'Browse past editions' }).click();
        await page.getByRole('heading', { name: 'Past editions' }).waitFor();
        // Replay a two-page archive using the same saved edition, then a failed page.
        await page.route('**/api/editions?offset=*', (route) => {
          const offset = new URL(route.request().url()).searchParams.get(
            'offset',
          );
          return route.fulfill({
            json: {
              entries: offset === '0' ? saved.entries : [],
              hasMore: offset === '0',
            },
          });
        });
        await page.goto(`${origin}/editions`);
        await page.getByRole('link', { name: 'Older editions' }).click();
        await page.getByText('No editions on this page.').waitFor();
        assert.equal(new URL(page.url()).searchParams.get('page'), '2');
        await page.reload();
        await page.getByText('No editions on this page.').waitFor();
        await page.getByRole('link', { name: 'Newer editions' }).click();
        await page.locator('li').first().waitFor();
        await page.unroute('**/api/editions?offset=*');
        await page.route('**/api/editions?offset=*', (route) =>
          route.fulfill({ status: 404, json: {} }),
        );
        await page.goto(`${origin}/editions?page=3`);
        await page.getByRole('alert').waitFor();
        await page.unroute('**/api/editions?offset=*');
        await page.getByRole('button', { name: 'Try again' }).click();
        // Published-only history can legitimately have no entries on page 3.
        const recovered = await readHistory(40);
        if (recovered.entries.length)
          await page.locator('li').first().waitFor();
        else await page.getByText('No editions on this page.').waitFor();
        assert.equal(await page.getByRole('alert').count(), 0);
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
    if (saved.hasMore) {
      const next = await readHistory(20);
      const boundary = saved.entries.at(-1)!;
      if (next.entries.length) {
        const context = await browser.newContext();
        await admitReader(context);
        const page = await context.newPage();
        await page.goto(`${origin}/editions/${boundary.id}`);
        await page
          .getByRole('link', { name: 'Older edition', exact: true })
          .click();
        await page.waitForURL(`**/editions/${next.entries[0].id}`);
        await page
          .getByRole('link', { name: 'Newer edition', exact: true })
          .click();
        await page.waitForURL(`**/editions/${boundary.id}`);
        await context.close();
      }
    }
    console.log(
      `Archive (${timeZone}): six viewport/theme cases; exact zoned coverage, saved links, paging/reload, empty/error/retry, reader-only requests passed.`,
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
