// Explicit GET-only live acceptance after enabling the published-only reader.
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';

import { chromium, expect } from 'playwright/test';

import { localAdminJson } from './lib/local-admin-fetch';

async function main() {
  assert.ok(
    process.argv[2],
    'usage: smoke-publication-visibility.ts inventory.json',
  );
  const inventory = JSON.parse(await readFile(process.argv[2], 'utf8')) as {
    editions: {
      id: string;
      proposedPublication: { publishedAt: string | null };
    }[];
  };
  const origin = 'http://127.0.0.1:8000';
  const published = inventory.editions.filter(
    (e) => e.proposedPublication.publishedAt !== null,
  );
  const privateEditions = inventory.editions.filter(
    (e) => e.proposedPublication.publishedAt === null,
  );
  assert.ok(published.length && privateEditions.length);
  const expected = new Set(published.map((e) => e.id));
  const seen = new Set<string>();
  for (let offset = 0; ; offset += 20) {
    const response = await fetch(`${origin}/api/editions?offset=${offset}`);
    assert.equal(response.status, 200);
    const history = (await response.json()) as {
      entries: { id: string }[];
      hasMore: boolean;
    };
    for (const entry of history.entries) {
      assert.ok(expected.has(entry.id), 'private edition in reader history');
      assert.ok(!seen.has(entry.id), 'duplicate history entry');
      seen.add(entry.id);
    }
    if (!history.hasMore) break;
    assert.ok(offset < inventory.editions.length, 'unbounded pagination');
  }
  assert.deepEqual(seen, expected);
  const latest = (await (
    await fetch(`${origin}/api/editions/latest`)
  ).json()) as { id: string };
  assert.equal(latest.id, published.at(-1)!.id);
  for (const edition of privateEditions) {
    const response = await fetch(`${origin}/api/editions/${edition.id}`);
    assert.equal(response.status, 404, `${edition.id}: private reader link`);
    const saved = (await localAdminJson(
      `/api/admin/digest-previews/${edition.id}`,
    )) as { id: string };
    assert.equal(saved.id, edition.id, 'private admin edition retained');
  }
  const browser = await chromium.launch();
  try {
    await mkdir('docs/screenshots/ui', { recursive: true });
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
        });
        await context.route('**/*', (route) =>
          route.request().method() === 'GET' &&
          new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort(),
        );
        const page = await context.newPage();
        await page.goto(`${origin}/editions`);
        for (const edition of published)
          await expect(
            page.locator(`a[href="/editions/${edition.id}"]`).first(),
          ).toBeVisible();
        assert.equal(
          await page.locator('a[href^="/editions/"]').count(),
          published.length,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/published-archive-${device}-${theme}.png`,
          fullPage: true,
        });
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(
    `${published.length} published history/latest; ${privateEditions.length} private links return 404 and remain in admin; four archive browser views pass.`,
  );
}
void main();
