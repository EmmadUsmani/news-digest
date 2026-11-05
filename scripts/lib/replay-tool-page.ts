import assert from 'node:assert/strict';

import type { Page } from 'playwright';

import { localAdminFetch } from './local-admin-fetch';

// Tool reads are bridged in Node so browser contexts never receive credentials.
export async function replayToolPage(page: Page) {
  await page.route(
    'http://127.0.0.1:8000/{grafana,logs,metrics}/**',
    async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const readQuery =
        request.method() === 'POST' &&
        (url.pathname.startsWith('/logs/select/logsql/') ||
          [
            '/grafana/api/ds/query',
            '/metrics/prometheus/api/v1/query',
            '/metrics/prometheus/api/v1/query_range',
          ].includes(url.pathname));
      assert.ok(
        ['GET', 'HEAD'].includes(request.method()) || readQuery,
        `Unexpected tool mutation: ${request.method()} ${url.pathname}`,
      );
      try {
        const response = await localAdminFetch(url, {
          method: request.method(),
          headers: {
            'content-type':
              request.headers()['content-type'] ?? 'application/json',
          },
          body: request.postDataBuffer(),
          signal: AbortSignal.timeout(30_000),
        });
        await route.fulfill({
          status: response.status,
          contentType:
            response.headers.get('content-type') ?? 'application/octet-stream',
          body: Buffer.from(await response.arrayBuffer()),
        });
      } catch {
        // Closing a page or a timed-out tool query must cancel the browser read.
        await route.abort().catch(() => undefined);
      }
    },
  );
}
