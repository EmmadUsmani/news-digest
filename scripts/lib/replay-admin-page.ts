import assert from 'node:assert/strict';

import type { Page } from 'playwright';

import { localAdminFetch } from './local-admin-fetch';

// Read-only bridge for VM browser checks. No credential enters Playwright.
// Register after scenario routes so these two access responses take precedence.
export async function replayAdminPage(page: Page) {
  await page.route('**/api/me', (route) =>
    route.fulfill({ json: { isAdmin: true } }),
  );
  await page.route('**/admin', async (route) => {
    assert.equal(route.request().method(), 'GET');
    const response = await localAdminFetch('http://127.0.0.1:8000/admin');
    assert.equal(response.status, 200);
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: await response.text(),
    });
  });
}
