// Signed-out read-only acceptance against the deployed public schema explorer.
import assert from 'node:assert/strict';
import { Resolver } from 'node:dns/promises';
import { mkdir } from 'node:fs/promises';

import { chromium } from 'playwright';

async function main() {
  const resolver = new Resolver();
  resolver.setServers(['1.1.1.1']);
  const host = 'news-digest.exe.xyz';
  const [address] = await resolver.resolve4(host);
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=MAP ${host} ${address}`],
  });
  try {
    await mkdir('docs/screenshots/schema', { recursive: true });
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors: string[] = [];
      const externalScripts: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('request', (request) => {
        if (
          request.resourceType() === 'script' &&
          new URL(request.url()).hostname !== host
        )
          externalScripts.push(request.url());
      });
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(`https://${host}/db/`);
      await page.locator('svg g.table').first().waitFor();
      assert.ok((await page.locator('svg g.table').count()) > 20);
      await page.screenshot({
        path: `docs/screenshots/schema/public-live-diagram-${width}.png`,
      });
      await page.locator('#search').fill('users');
      await page.locator('#search').press('Enter');
      await page.locator('#panel:not([hidden]) h2').waitFor();
      assert.equal(await page.locator('#panel h2').textContent(), 'users');
      assert.deepEqual(externalScripts, []);
      assert.deepEqual(errors, []);
      await page.screenshot({
        path: `docs/screenshots/schema/public-live-${width}.png`,
      });
      console.log(
        `Public signed-out schema ${width}px: rendered, search/detail pass, zero errors`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
