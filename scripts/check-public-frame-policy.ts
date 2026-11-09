// Synthetic browser proof. Every remote frame is intercepted; no provider traffic.
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
    const access = request.url === '/private' ? privateStack : publicStack;
    access(request, response, () => {
      response.setHeader('Content-Type', 'text/html');
      // The tool frame uses the same middleware and must remain embeddable.
      response.end(
        request.url === '/tool' ? '<p>tool loaded</p>' : '<p>host</p>',
      );
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const fetched: string[] = [];
    await page.route('**/*', async (route) => {
      if (new URL(route.request().url()).origin === origin) {
        await route.continue();
        return;
      }
      fetched.push(route.request().url());
      await route.fulfill({
        contentType: 'text/html',
        body: '<p>synthetic embed</p>',
      });
    });
    const allowed = [
      `${origin}/tool`,
      'https://platform.twitter.com/embed/Tweet.html',
      'https://syndication.twitter.com/i/jot',
    ];
    const blocked = [
      'https://untrusted.example/frame',
      'https://platform.twitter.com.untrusted.example/frame',
      'http://platform.twitter.com/embed/Tweet.html',
    ];
    await page.goto(origin);
    await page.evaluate(() => {
      const violations: string[] = [];
      Object.assign(window, { violations });
      document.addEventListener('securitypolicyviolation', (event) => {
        if (event.effectiveDirective === 'frame-src')
          violations.push(event.blockedURI);
      });
    });
    for (const src of [...allowed, ...blocked]) {
      await page.evaluate((url) => {
        const frame = document.createElement('iframe');
        frame.src = url;
        document.body.append(frame);
      }, src);
    }
    await page.waitForFunction(
      () =>
        (window as unknown as { violations: string[] }).violations.length === 3,
    );
    for (const url of allowed) {
      await page.frameLocator(`iframe[src="${url}"]`).locator('p').waitFor();
    }
    assert.deepEqual(fetched.sort(), allowed.slice(1).sort());
    const violations = await page.evaluate(
      () => (window as unknown as { violations: string[] }).violations,
    );
    assert.deepEqual(
      violations.sort(),
      blocked.map((url) => new URL(url).origin).sort(),
    );
    await page.goto(`${origin}/private`);
    await page.evaluate((src) => {
      const frame = document.createElement('iframe');
      frame.src = src;
      document.body.append(frame);
    }, blocked[0]);
    await page.frameLocator('iframe').getByText('synthetic embed').waitFor();
    assert.ok(fetched.includes(blocked[0]));
    console.log(
      'Public frame policy passes: local tools and two X hosts allowed; foreign, lookalike and HTTP frames blocked; private rollback unchanged. Synthetic responses only.',
    );
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

void main();
