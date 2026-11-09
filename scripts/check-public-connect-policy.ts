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
        response.end('<p>Synthetic connection policy check</p>');
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
    const allowed = [`${origin}/data`, 'https://syndication.twitter.com/data'];
    const blocked = [
      'https://untrusted.example/data',
      'https://syndication.twitter.com.untrusted.example/data',
      'http://syndication.twitter.com/data',
    ];
    await page.goto(origin);
    const fetchUrl = (url: string) =>
      page.evaluate(async (target) => {
        try {
          await fetch(target);
          return true;
        } catch {
          return false;
        }
      }, url);
    for (const url of allowed) assert.equal(await fetchUrl(url), true, url);
    for (const url of blocked) assert.equal(await fetchUrl(url), false, url);
    assert.deepEqual(fetched, [allowed[1]]);
    await page.goto(`${origin}/private`);
    for (const url of blocked) assert.equal(await fetchUrl(url), true, url);
    assert.deepEqual(fetched, [allowed[1], ...blocked]);
    console.log(
      'Connection policy passes: same-origin/official X allowed; foreign, lookalike and HTTP blocked; private rollback unchanged (synthetic).',
    );
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
