import { chromium } from 'playwright';
import assert from 'node:assert/strict';
async function smoke() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://localhost:8000');
      await page
        .getByText('System online · Database and queue connected')
        .waitFor();
      await page
        .locator('.topic-grid')
        .getByRole('heading', { name: 'Tech & AI', exact: true })
        .waitFor();
      assert.equal(await page.locator('.topic-grid article').count(), 4);
      if (name === 'desktop') {
        await page
          .getByRole('button', { name: 'Create edition · last 24 hours' })
          .click();
        await page
          .locator('.period')
          .filter({ hasText: 'Saved edition' })
          .waitFor();
      }
      await page.locator('.digest-topic').first().waitFor();
      await page
        .getByText('Topic phrase filtering', { exact: false })
        .waitFor();
      assert.equal(
        await page
          .locator('.selection-count')
          .filter({ hasText: 'filtered by topic rules' })
          .count(),
        4,
      );
      assert.equal(
        await page
          .locator('.selection-count')
          .filter({ hasText: 'filtered by quality rules' })
          .count(),
        4,
      );
      const nba = page
        .locator('.digest-topic')
        .filter({
          has: page.getByRole('heading', { name: 'NBA', exact: true }),
        });
      await nba.locator('.omissions summary').click();
      await page
        .getByText('Monthly schedule guide', { exact: false })
        .waitFor();
      const tech = page
        .locator('.digest-topic')
        .filter({
          has: page.getByRole('heading', { name: 'Tech & AI', exact: true }),
        });
      await tech.locator('.omissions summary').click();
      await tech
        .getByText('Hacker News question thread', { exact: false })
        .waitFor();
      assert.equal(
        await tech
          .locator('ol>li')
          .filter({ hasText: 'Ask HN: Which TV' })
          .count(),
        0,
      );
      const selection = page
        .locator('.digest-topic ol details')
        .filter({ has: page.locator('summary', { hasText: 'Why selected' }) })
        .first();
      await selection.locator('summary').click();
      await selection.getByText('Topic phrase:', { exact: false }).waitFor();
      assert.equal(await page.locator('.digest-topic').count(), 4);
      assert.ok((await page.locator('.digest-topic ol>li').count()) > 0);
      const snapshot = await (
        await page.request.get(
          'http://localhost:8000/api/digest-previews/latest',
        )
      ).json();
      await page.reload();
      await page
        .locator('.period')
        .filter({ hasText: 'Saved edition' })
        .waitFor();
      const reloaded = await (
        await page.request.get(
          'http://localhost:8000/api/digest-previews/latest',
        )
      ).json();
      assert.deepEqual(reloaded, snapshot);
      const imageStories = snapshot.topics
        .flatMap(
          (topic: { stories: { imageUrl?: string | null }[] }) => topic.stories,
        )
        .filter((story: { imageUrl?: string | null }) => story.imageUrl);
      assert.ok(
        imageStories.length > 0,
        'Live edition must include stored publisher images',
      );
      const images = page.locator('.story-image');
      for (const image of await images.all()) {
        assert.equal(await image.getAttribute('alt'), '');
        assert.equal(await image.getAttribute('loading'), 'lazy');
        assert.equal(await image.getAttribute('referrerpolicy'), 'no-referrer');
      }

      await page.getByText('Browse saved editions', { exact: true }).click();
      const historyResponse = await page.request.get(
        'http://localhost:8000/api/digest-previews',
      );
      const history = await historyResponse.json();
      const older = history.entries[1];
      assert.ok(older);
      await page
        .locator(`.edition-history a[href="?edition=${older.id}"]`)
        .click();
      await page.waitForURL(`**/?edition=${older.id}`);
      await page.reload();
      await page
        .locator('.period')
        .filter({ hasText: older.id.slice(0, 8) })
        .waitFor();
      await page.getByText('Browse saved editions', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Open latest edition', exact: true })
        .click();
      await page
        .locator('.period')
        .filter({ hasText: snapshot.id.slice(0, 8) })
        .waitFor();
      if (history.hasMore) {
        await page
          .getByRole('button', { name: 'Older editions', exact: true })
          .click();
        await page.getByText('Page 2', { exact: true }).waitFor();
        await page
          .getByRole('button', { name: 'Newer editions', exact: true })
          .click();
        await page.getByText('Page 1', { exact: true }).waitFor();
      }
      await page.getByText('Browse saved editions', { exact: true }).click();
      await page.locator('.headlines a').first().waitFor();
      for (const article of await page.locator('.topic-grid article').all())
        assert.ok((await article.locator('.headlines a').count()) > 0);
      assert.equal(
        await page.locator('.headlines a[href*="betting"]').count(),
        0,
      );
      await page.getByText('Schedule settings', { exact: true }).click();
      await page
        .locator('.schedule-note')
        .filter({
          hasText: 'Automatic preliminary editions follow this schedule',
        })
        .waitFor();
      await page.getByText('Schedule settings', { exact: true }).click();
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);

      await nba.locator('.omissions summary').click();
      await page
        .getByText('Monthly schedule guide', { exact: false })
        .waitFor();
      await page.screenshot({
        path: `docs/screenshots/foundation-${name}.png`,
        fullPage: true,
      });
      await page.getByText('Browse saved editions', { exact: true }).click();
      await page.locator('.edition-history a').first().waitFor();
      await page.screenshot({
        path: `docs/screenshots/history-${name}.png`,
        fullPage: false,
      });
      await page.close();
    }
    // Exercise actual persisted windows at both responsive sizes in a DST timezone.
    for (const width of [1440, 390]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        timezoneId: 'America/Los_Angeles',
      });
      await page.goto('http://localhost:8000');
      await page
        .getByRole('button', {
          name: 'Create edition · last 24 hours',
          exact: true,
        })
        .waitFor();
      for (const [choice, hours] of [
        ['6', 6],
        ['168', 168],
      ] as const) {
        await page.getByLabel('Period', { exact: true }).selectOption(choice);
        const responsePromise = page.waitForResponse(
          (r) =>
            r.url().endsWith('/api/digest-previews') &&
            r.request().method() === 'POST',
        );
        await page
          .getByRole('button', {
            name: `Create edition · ${hours === 168 ? 'last 7 days' : 'last 6 hours'}`,
            exact: true,
          })
          .click();
        const response = await responsePromise;
        assert.equal(response.status(), 201);
        const saved = await response.json();
        assert.equal(
          Date.parse(saved.windowEnd) - Date.parse(saved.windowStart),
          hours * 3600000,
        );
        await page
          .locator('.period')
          .filter({ hasText: saved.id.slice(0, 8) })
          .waitFor();
      }
      await page.getByLabel('Period', { exact: true }).selectOption('custom');
      await page
        .getByText('Times use your browser timezone (America/Los_Angeles).', {
          exact: false,
        })
        .waitFor();
      await page.getByLabel('Start', { exact: true }).fill('2026-10-31T12:00');
      await page.getByLabel('End', { exact: true }).fill('2026-10-30T12:00');
      await page
        .getByRole('button', {
          name: 'Create edition · custom period',
          exact: true,
        })
        .click();
      await page
        .getByRole('alert')
        .filter({ hasText: 'Choose a start before the end' })
        .waitFor();
      await page.getByLabel('End', { exact: true }).fill('2026-11-01T04:00');
      const responsePromise = page.waitForResponse(
        (r) =>
          r.url().endsWith('/api/digest-previews') &&
          r.request().method() === 'POST',
      );
      await page
        .getByRole('button', {
          name: 'Create edition · custom period',
          exact: true,
        })
        .click();
      const saved = await (await responsePromise).json();
      // Fall-back transition: 16 wall-clock hours cover 17 elapsed hours.
      assert.equal(saved.windowStart, '2026-10-31T19:00:00.000Z');
      assert.equal(saved.windowEnd, '2026-11-01T12:00:00.000Z');
      await page
        .locator('.period')
        .filter({ hasText: saved.id.slice(0, 8) })
        .waitFor();
      await page.reload();
      await page
        .locator('.period')
        .filter({ hasText: saved.id.slice(0, 8) })
        .waitFor();
      await page.getByLabel('Period', { exact: true }).selectOption('custom');
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      await page.getByLabel('Start', { exact: true }).fill('2026-10-31T12:00');
      await page.getByLabel('End', { exact: true }).fill('2026-11-01T04:00');
      await page.locator('.window-controls').scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/window-${width === 390 ? 'mobile' : 'desktop'}.png`,
        fullPage: false,
      });
      await page.close();
    }
    // Isolated browser-only fixture verifies the multi-article UI when live windows
    // contain no matching headlines. Never persisted or included in live screenshots.
    const page = await browser.newPage();
    const fixture = await (
      await page.request.post('http://localhost:8000/api/digest-previews', {
        data: {
          windowStart: new Date(Date.now() - 86400000).toISOString(),
          windowEnd: new Date().toISOString(),
        },
      })
    ).json();
    const story = fixture.topics[0].stories[0];
    story.coverage = [
      story.coverage[0],
      {
        ...story.coverage[0],
        id: '00000000-0000-4000-8000-000000000099',
        title: 'Fixture: additional coverage',
        url: 'https://example.org/fixture-coverage',
      },
    ];
    await page.route('**/api/digest-previews/latest', (route) =>
      route.fulfill({ json: fixture }),
    );
    await page.goto('http://localhost:8000');
    await page
      .getByText('Related coverage · 2 articles', { exact: true })
      .click();
    assert.equal(
      await page
        .getByRole('link', { name: 'Fixture: additional coverage' })
        .getAttribute('href'),
      'https://example.org/fixture-coverage',
    );
    await page
      .getByText(
        'Grouped by similar headlines; independent reporting is unverified.',
      )
      .waitFor();
    await page.close();
    // Synthetic image failure is browser-only and never saved or screenshotted.
    for (const width of [1440, 390]) {
      const failedPage = await browser.newPage({
        viewport: { width, height: 900 },
      });
      story.imageUrl = 'https://example.org/fixture-broken.jpg';
      await failedPage.route('**/fixture-broken.jpg', (route) => route.abort());
      await failedPage.route('**/api/digest-previews/latest', (route) =>
        route.fulfill({ json: fixture }),
      );
      const failedRequest = failedPage.waitForEvent(
        'requestfailed',
        (request) => request.url() === story.imageUrl,
      );
      await failedPage.goto('http://localhost:8000');
      const headline = failedPage
        .getByRole('link', { name: story.title, exact: true })
        .first();
      await headline.scrollIntoViewIfNeeded();
      await failedRequest;
      await failedPage.waitForFunction(
        () =>
          !document.querySelector(
            'img[src="https://example.org/fixture-broken.jpg"]',
          ),
      );
      assert.ok(await headline.isVisible());
      assert.equal(
        await failedPage.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      await failedPage.close();
    }
  } finally {
    await browser.close();
  }
}
void smoke();
