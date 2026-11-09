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
  let localMediaRequests = 0;
  const server = createServer((request, response) => {
    if (request.url === '/media.wav') localMediaRequests++;
    (request.url === '/private' ? privateStack : publicStack)(
      request,
      response,
      () => {
        response.setHeader('Content-Type', 'text/html');
        response.end('<p>Synthetic media policy check</p>');
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
    const allowed = [`${origin}/media.wav`];
    const blocked = [
      'https://syndication.twitter.com/media.wav',
      'https://untrusted.example/media.wav',
      'https://syndication.twitter.com.untrusted.example/media.wav',
      'http://syndication.twitter.com/media.wav',
    ];
    await page.goto(origin);
    const loadMedia = (url: string) =>
      page.evaluate(async (target) => {
        // Invalid media bytes make decoding fail; CSP events and intercepted
        // requests distinguish policy refusal from decoding failure.
        const violations: string[] = [];
        const [listener] = [
          (event: SecurityPolicyViolationEvent) => {
            if (event.effectiveDirective === 'media-src')
              violations.push(event.blockedURI);
          },
        ];
        document.addEventListener('securitypolicyviolation', listener);
        const media = document.createElement('video');
        await new Promise<void>((resolve) => {
          media.onerror = () => resolve();
          media.onloadedmetadata = () => resolve();
          media.preload = 'auto';
          media.src = target;
          media.load();
        });
        media.removeAttribute('src');
        media.load();
        await new Promise((resolve) => setTimeout(resolve, 50));
        document.removeEventListener('securitypolicyviolation', listener);
        return violations;
      }, url);
    for (const url of allowed) assert.deepEqual(await loadMedia(url), [], url);
    assert.equal(localMediaRequests, 1, 'Local media must reach the server');
    for (const url of blocked)
      assert.deepEqual(await loadMedia(url), [url], url);
    assert.deepEqual(fetched, []);
    await page.goto(`${origin}/private`);
    for (const url of blocked) assert.deepEqual(await loadMedia(url), [], url);
    assert.deepEqual(fetched, blocked);
    console.log(
      'Media policy passes: same-origin allowed; foreign, lookalike and HTTP blocked; private rollback unchanged (synthetic).',
    );
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
