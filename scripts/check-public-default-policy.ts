// Offline browser proof: remote requests are intercepted, never sent to providers.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

import { chromium } from 'playwright';

import { prepareAccessStack } from '../apps/api/src/public-write/access-stack';

async function main() {
  const stack = (publicMode: boolean) =>
    prepareAccessStack({
      publicMode,
      accounts: (_request, _response, next) => next(),
      publicAccess: () => (_request, _response, next) => next(),
      legacyAccess: () => (_request, _response, next) => next(),
    });
  const publicStack = stack(true);
  const privateStack = stack(false);
  const server = createServer((request, response) => {
    (request.url === '/private' ? privateStack : publicStack)(
      request,
      response,
      () => {
        response.setHeader('Content-Type', 'text/html');
        response.end('<p>Synthetic default policy check</p>');
      },
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const fetched: string[] = [];
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (new URL(url).origin === origin) return route.continue();
      fetched.push(url);
      return route.fulfill({
        contentType: 'text/plain',
        headers: { 'access-control-allow-origin': '*' },
        body: 'synthetic',
      });
    });
    const target = 'https://untrusted.example/manifest.json';
    const cdp = await page.context().newCDPSession(page);
    const probe = async () => {
      await page.evaluate(async (url) => {
        const violations: string[] = [];
        (window as unknown as { violations: string[] }).violations = violations;
        document.addEventListener('securitypolicyviolation', (event) => {
          if (event.effectiveDirective === 'manifest-src')
            violations.push(event.originalPolicy);
        });
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = url;
        document.head.append(link);
        // Reading the manifest triggers Chromium's fetch even without install UI.
        await new Promise((resolve) => setTimeout(resolve, 300));
      }, target);
      await cdp.send('Page.getAppManifest');
      await page.waitForTimeout(100);
      return page.evaluate(
        () => (window as unknown as { violations: string[] }).violations,
      );
    };
    await page.goto(origin);
    const violations = await probe();
    assert.equal(violations.length, 1);
    assert.match(violations[0], /default-src 'none'/);
    assert.deepEqual(fetched, []);
    await page.goto(`${origin}/private`);
    assert.deepEqual(await probe(), []);
    assert.deepEqual(fetched, [target]);
    console.log(
      'Default policy passes: unspecified manifest blocked before fetch; private rollback unchanged (synthetic).',
    );
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
