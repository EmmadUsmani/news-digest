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
        response.end('<p>Synthetic font policy check</p>');
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
    const allowed = [`${origin}/font.woff2`];
    const blocked = [
      'https://syndication.twitter.com/font.woff2',
      'https://untrusted.example/font.woff2',
      'https://syndication.twitter.com.untrusted.example/font.woff2',
      'http://syndication.twitter.com/font.woff2',
    ];
    await page.goto(origin);
    const loadFont = (url: string) =>
      page.evaluate(async (target) => {
        // The fixture is deliberately not a valid font. Observe the CSP event,
        // independently of decoding, to distinguish policy from format errors.
        const violations: string[] = [];
        const [listener] = [
          (event: SecurityPolicyViolationEvent) => {
            if (event.effectiveDirective === 'font-src')
              violations.push(event.blockedURI);
          },
        ];
        document.addEventListener('securitypolicyviolation', listener);
        try {
          await new FontFace('probe', `url("${target}")`).load();
        } catch {
          /* Synthetic font has no glyphs. */
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
        document.removeEventListener('securitypolicyviolation', listener);
        return violations;
      }, url);
    for (const url of allowed) assert.deepEqual(await loadFont(url), [], url);
    for (const url of blocked)
      assert.deepEqual(await loadFont(url), [url], url);
    assert.deepEqual(fetched, []);
    await page.goto(`${origin}/private`);
    for (const url of blocked) assert.deepEqual(await loadFont(url), [], url);
    assert.deepEqual(fetched, blocked);
    console.log(
      'Font policy passes: same-origin allowed; foreign, lookalike and HTTP blocked; private rollback unchanged (synthetic).',
    );
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
