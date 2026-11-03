// Explicit synthetic error probe; never generates editions or calls providers.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const reports: Record<string, unknown>[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/api/browser-errors'))
        reports.push(request.postDataJSON() as Record<string, unknown>);
    });
    await page.goto('http://127.0.0.1:8000/');
    await page.waitForSelector('main');
    // Use actual uncaught browser events. The marker must never leave the browser.
    await page.evaluate(() => {
      setTimeout(() => {
        throw new TypeError('PRIVATE_BROWSER_PROBE_DO_NOT_LOG');
      }, 0);
      setTimeout(() => {
        void Promise.reject(new Error('PRIVATE_BROWSER_PROBE_DO_NOT_LOG'));
      }, 10);
    });
    await page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/browser-errors') &&
        response.status() === 204,
    );
    await page.waitForFunction(() => document.querySelector('main') !== null);
    await page.waitForTimeout(500);
    assert.ok(
      reports.some(
        (report) => report.kind === 'error' && report.errorType === 'TypeError',
      ),
    );
    assert.ok(reports.some((report) => report.kind === 'unhandledrejection'));
    assert.ok(!JSON.stringify(reports).includes('PRIVATE_BROWSER_PROBE'));
    await page.evaluate(() => {
      for (let i = 0; i < 10; i++)
        window.dispatchEvent(
          new ErrorEvent('error', {
            message: 'PRIVATE_BROWSER_PROBE_DO_NOT_LOG',
          }),
        );
    });
    await page.waitForTimeout(300);
    assert.equal(reports.length, 5, 'Per-page report cap');
    console.log(
      'Browser probe: real error/rejection delivered, private text omitted, five-report cap passed.',
    );
  } finally {
    await browser.close();
  }
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
