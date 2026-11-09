// Offline script policy proof: external hosts are intercepted, never contacted.
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
        if (request.url === '/probe.js') {
          response.setHeader('Content-Type', 'text/javascript');
          response.end(`window.localScript = true;
            try { new Function('window.evalScript = true')(); } catch {}
            const inline = document.createElement('script');
            inline.textContent = 'window.inlineScript = true';
            document.head.append(inline);`);
        } else {
          response.end(`<script src="/probe.js"></script>
            <script src="https://platform.twitter.com/widgets.js"></script>
            <script src="https://platform.twitter.com.attacker.invalid/evil.js"></script>`);
        }
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
    await page.route('https://**/*', (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body:
          new URL(route.request().url()).hostname === 'platform.twitter.com'
            ? 'window.officialScript = true'
            : 'window.externalScript = true',
      }),
    );
    for (const [path, expected] of [
      ['/', false],
      ['/private', true],
    ] as const) {
      await page.goto(`${origin}${path}`);
      const result = await page.evaluate(() => {
        const state = window as unknown as Record<string, boolean | undefined>;
        return Object.fromEntries(
          [
            'localScript',
            'officialScript',
            'inlineScript',
            'evalScript',
            'externalScript',
          ].map((key) => [key, state[key] === true]),
        );
      });
      assert.deepEqual(result, {
        localScript: true,
        officialScript: true,
        inlineScript: expected,
        evalScript: expected,
        externalScript: expected,
      });
    }
    console.log(
      'Script policy passes: local/official admission, inline/eval/lookalike refusal and private rollback (synthetic).',
    );
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
