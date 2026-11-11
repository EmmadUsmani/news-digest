// Explicit local browser rehearsal; no database grants or public flags change.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

import { chromium } from 'playwright';

import type { SchemaModel } from '../apps/schema-explorer/src/model.ts';
import { buildPublicModel } from '../apps/schema-explorer/src/public-model.ts';

async function main() {
  const base = 'http://127.0.0.1:8200/';
  const response = await fetch(`${base}api/schema`);
  assert.equal(response.status, 200);
  const privateModel = (await response.json()) as SchemaModel;
  const model = buildPublicModel(privateModel);
  assert.ok(model.tables.some((table) => table.name === 'users'));
  const browser = await chromium.launch({ headless: true });
  await mkdir('docs/screenshots/schema', { recursive: true });
  try {
    for (const structural of [true, false]) {
      for (const width of [1440, 390]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        if (structural)
          await page.route('**/api/schema', (route) =>
            route.fulfill({ json: model }),
          );
        await page.goto(`${base}#table=users`);
        await page.waitForSelector('#panel:not([hidden]) h2');
        assert.equal(await page.locator('#panel h2').textContent(), 'users');
        assert.ok(
          (await page.locator('#panel').innerText())
            .toLowerCase()
            .includes('columns'),
        );
        for (const mode of ['all', 'tables', 'keys']) {
          await page.locator(`[data-mode="${mode}"]`).click();
          await page.waitForTimeout(250);
        }
        await page.locator('#search').fill('users');
        await page.locator('#search').press('Enter');
        const panelBounds = await page.locator('#panel').boundingBox();
        assert.ok(
          panelBounds &&
            panelBounds.x >= 0 &&
            panelBounds.x + panelBounds.width <= width,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        const text = await page.locator('body').innerText();
        assert.doesNotMatch(text, /undefined|NaN|Invalid Date/);
        if (structural) {
          assert.doesNotMatch(
            text,
            /estimated rows|on disk|live as of|Indexes|Triggers|Checks/,
          );
          assert.equal(await page.locator('#warn').isVisible(), false);
          await page.screenshot({
            path: `docs/screenshots/schema/structural-${width}.png`,
          });
        } else {
          assert.match(text, /on disk/);
        }
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      `Schema UI: structural/private desktop/mobile passed; ${model.tables.length} live catalog tables, ${model.relations.length} relations. Structural response intercepted locally; public mode unchanged.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
