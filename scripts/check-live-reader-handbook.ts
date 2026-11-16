// Signed-out, read-only full-handbook acceptance over the public HTTPS URL.
import assert from 'node:assert/strict';
import { Resolver } from 'node:dns/promises';
import { mkdir } from 'node:fs/promises';

import { chromium } from 'playwright';

async function main() {
  const host = 'news-digest.exe.xyz';
  const resolver = new Resolver();
  resolver.setServers(['1.1.1.1']);
  const [address] = await resolver.resolve4(host);
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=MAP ${host} ${address}`],
  });
  try {
    await mkdir('docs/screenshots/handbook', { recursive: true });
    for (const width of [1440, 390]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      page.on('request', (request) => {
        if (new URL(request.url()).hostname !== host)
          errors.push(`External request: ${request.url()}`);
        assert.ok(['GET', 'HEAD'].includes(request.method()));
      });
      await page.goto(`https://${host}/docs/`);
      await page.locator('#content h1').waitFor();
      const links = await page.evaluate(async () => {
        const tree = (await (await fetch('api/tree')).json()) as {
          home: { path: string; title: string };
          sections: {
            index: { path: string; title: string } | null;
            pages: { path: string; title: string }[];
          }[];
        };
        return [
          tree.home,
          ...tree.sections.flatMap((section) => [
            ...(section.index ? [section.index] : []),
            ...section.pages,
          ]),
        ].map((entry) => ({
          href:
            '#/' + entry.path.replace(/README\.md$/, '').replace(/\.md$/, ''),
          title: entry.title,
        }));
      });
      assert.equal(links.length, 18);
      let diagrams = 0;
      for (const link of links) {
        if (
          width < 600 &&
          !(await page
            .locator('#sidebar')
            .evaluate((node) => node.classList.contains('open')))
        )
          await page.locator('#menu').click();
        await page.locator(`#sidebar a[href="${link.href}"]`).click();
        await page.waitForFunction(
          (title) =>
            document.querySelector('#content h1')?.textContent === title,
          link.title,
        );
        await page.waitForFunction(() =>
          [...document.querySelectorAll('#content pre.mermaid')].every(
            (node) =>
              node.querySelector('svg') &&
              !node.querySelector('[aria-roledescription="error"]'),
          ),
        );
        diagrams += await page.locator('#content pre.mermaid').count();
        for (const href of await page
          .locator('#content a[href^="#/"]')
          .evaluateAll((nodes) =>
            nodes.map((node) => node.getAttribute('href')!),
          ))
          assert.ok(
            links.some((candidate) => candidate.href === href),
            href,
          );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${width}: overflow on ${link.title}`,
        );
      }
      await page.locator('#search').click();
      await page.locator('#palette-input').fill('Backups');
      const option = page
        .getByRole('option')
        .filter({ hasText: 'Database and VM backups' })
        .first();
      await option.waitFor();
      await page.screenshot({
        path: `docs/screenshots/handbook/public-search-${width}.png`,
      });
      await option.click();
      await page.waitForFunction(
        () =>
          document.querySelector('#content h1')?.textContent ===
          'Database and VM backups',
      );
      await page.reload();
      await page
        .getByRole('heading', { name: 'Database and VM backups', exact: true })
        .waitFor();
      await page.screenshot({
        path: `docs/screenshots/handbook/public-page-${width}.png`,
      });
      assert.deepEqual(errors, []);
      assert.deepEqual(await context.cookies(), []);
      console.log(
        `Public signed-out handbook ${width}px: 18 pages/${diagrams} diagrams, navigation/search/direct refresh, local assets, no overflow or errors.`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
