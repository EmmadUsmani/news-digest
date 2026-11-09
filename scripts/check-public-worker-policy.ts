// Offline proof: workers never contact external providers.
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
  let workerRequests = 0;
  const server = createServer((request, response) => {
    if (request.url === '/worker.js') {
      workerRequests++;
      response.setHeader('Content-Type', 'text/javascript');
      response.end('postMessage("ready")');
      return;
    }
    (request.url === '/private' ? privateStack : publicStack)(
      request,
      response,
      () => {
        response.setHeader('Content-Type', 'text/html');
        response.end('<p>Synthetic worker policy check</p>');
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
    for (const path of ['/', '/private']) {
      await page.goto(`${origin}${path}`);
      const results = await page.evaluate(async () => {
        const violations: string[] = [];
        document.addEventListener('securitypolicyviolation', (event) => {
          if (event.effectiveDirective === 'worker-src')
            violations.push(event.blockedURI);
        });
        const blob = URL.createObjectURL(
          new Blob(['postMessage("ready")'], { type: 'text/javascript' }),
        );
        const loaded: boolean[] = [];
        for (const url of ['/worker.js', blob]) {
          loaded.push(
            await new Promise<boolean>((resolve) => {
              try {
                const worker = new Worker(url);
                worker.onmessage = () => {
                  worker.terminate();
                  resolve(true);
                };
                worker.onerror = (event) => {
                  event.preventDefault();
                  worker.terminate();
                  resolve(false);
                };
              } catch {
                resolve(false);
              }
            }),
          );
        }
        URL.revokeObjectURL(blob);
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { loaded, violations };
      });
      assert.deepEqual(
        results.loaded,
        path === '/' ? [false, false] : [true, true],
      );
      assert.equal(results.violations.length, path === '/' ? 2 : 0);
      assert.equal(workerRequests, path === '/' ? 0 : 1);
    }
    console.log(
      'Worker policy passes: local and blob workers refused; private rollback executes both (synthetic).',
    );
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
