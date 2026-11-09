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
        response.end('<p>Synthetic event handler policy check</p>');
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
    for (const [path, expected] of [
      ['/', false],
      ['/private', true],
    ] as const) {
      await page.goto(`${origin}${path}`);
      const result = await page.evaluate(async () => {
        let violations = 0;
        document.addEventListener('securitypolicyviolation', (event) => {
          if (event.effectiveDirective === 'script-src-attr') violations++;
        });
        const button = document.createElement('button');
        button.setAttribute('onclick', "document.body.dataset.inline = 'yes'");
        button.addEventListener('click', () => {
          document.body.dataset.listener = 'yes';
        });
        document.body.append(button);
        button.click();
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          inline: document.body.dataset.inline === 'yes',
          listener: document.body.dataset.listener === 'yes',
          violations,
        };
      });
      assert.deepEqual(result, {
        inline: expected,
        listener: true,
        violations: expected ? 0 : 1,
      });
    }
    console.log(
      'Inline event handler policy passes: public refusal, JS listener admission and private rollback (synthetic).',
    );
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
