// Read-only browser check against real host samples; never changes app data.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const query = new URLSearchParams({
        'g0.expr': 'sum by (unit) (news_digest_unit_memory_bytes)',
        'g0.range_input': '15m',
        'g0.tab': '1',
      });
      await page.goto(`http://127.0.0.1:8000/metrics/vmui/#/?${query}`);
      await page
        .getByText('news-digest-api.service', { exact: false })
        .first()
        .waitFor();
      await page.screenshot({ path: `docs/screenshots/metrics-${name}.png` });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Metrics UI: real unit samples rendered on desktop/mobile without page errors.',
    );
  } finally {
    await browser.close();
  }
}
void main();
