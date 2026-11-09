// Offline browser proof: synthetic forms only; no live accounts or external traffic.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

import { chromium } from 'playwright';

import { prepareAccessStack } from '../apps/api/src/public-write/access-stack';

async function main() {
  let foreignSubmissions = 0;
  let localSubmissions = 0;
  const foreign = createServer((_request, response) => {
    foreignSubmissions++;
    response.end('foreign submission');
  });
  await new Promise<void>((resolve) => foreign.listen(0, '127.0.0.1', resolve));
  const address = foreign.address();
  assert.ok(address && typeof address !== 'string');
  const foreignOrigin = `http://127.0.0.1:${address.port}`;
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
    const access = request.url?.startsWith('/private')
      ? privateStack
      : publicStack;
    access(request, response, () => {
      if (request.url === '/submitted') {
        localSubmissions++;
        response.end('local submission');
        return;
      }
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(`<form action="${foreignOrigin}/submitted" method="post">
        <button>Foreign</button></form>
        <form action="/submitted" method="post"><button>Local</button></form>
        <script>window.violations=[];document.addEventListener('securitypolicyviolation',
        event=>window.violations.push(event.effectiveDirective));</script>`);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const localAddress = server.address();
  assert.ok(localAddress && typeof localAddress !== 'string');
  const origin = `http://127.0.0.1:${localAddress.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(origin);
    await page
      .getByRole('button', { name: 'Foreign' })
      .click({ noWaitAfter: true });
    await page.waitForFunction(() =>
      (window as unknown as { violations: string[] }).violations.includes(
        'form-action',
      ),
    );
    assert.equal(foreignSubmissions, 0);
    assert.equal(page.url(), `${origin}/`);
    const localPage = await browser.newPage();
    await localPage.goto(origin);
    await Promise.all([
      localPage.waitForURL(`${origin}/submitted`),
      localPage.getByRole('button', { name: 'Local' }).click(),
    ]);
    assert.equal(localSubmissions, 1);
    await page.goto(`${origin}/private`);
    await Promise.all([
      page.waitForURL(`${foreignOrigin}/submitted`),
      page.getByRole('button', { name: 'Foreign' }).click(),
    ]);
    assert.equal(foreignSubmissions, 1);
    console.log(
      'Public form policy passes: foreign POST blocked, same-origin POST allowed, private rollback unchanged (synthetic local browser proof).',
    );
  } finally {
    await browser.close();
    for (const listener of [server, foreign]) {
      listener.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        listener.close((error) => (error ? reject(error) : resolve())),
      );
    }
  }
}

void main();
