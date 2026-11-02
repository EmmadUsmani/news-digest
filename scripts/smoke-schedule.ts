import assert from 'node:assert/strict';

import { profileSettingsSchema, scheduleSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { validateSchedule } from '../apps/api/src/modules/profiles/domain/schedule';

const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const original = profileSettingsSchema.parse(
    await (await context.request.get(`${base}/api/profile`)).json(),
  );
  const profile = structuredClone(original);
  // All browser profile reads/writes are replayed in memory, including reloads.
  await context.route('**/api/profile', (route) =>
    route.fulfill({ json: profile }),
  );
  await context.route('**/api/profile/schedule', async (route) => {
    const result = scheduleSchema.safeParse(route.request().postDataJSON());
    if (!result.success) {
      await route.fulfill({
        status: 400,
        json: { message: result.error.issues[0].message },
      });
      return;
    }
    const valid = validateSchedule(result.data);
    if (!valid.ok) {
      await route.fulfill({ status: 400, json: { message: valid.error } });
      return;
    }
    profile.schedule = result.data;
    await route.fulfill({ json: profile });
  });
  const topics = await (await context.request.get(`${base}/api/topics`)).json();
  const latest = await (
    await context.request.get(`${base}/api/digest-previews/latest`)
  ).json();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      await page.goto(base);
      await page.getByText('Schedule settings', { exact: true }).click();
      const form = page.getByRole('form', {
        name: 'Schedule settings',
        exact: true,
      });
      await form.getByLabel('Daily local time', { exact: true }).fill('09:30');
      await form
        .getByLabel('IANA timezone', { exact: true })
        .fill('Asia/Tokyo');
      await form.getByLabel('Coverage window', { exact: true }).fill('PT6H');
      await form.getByLabel('Default story budget', { exact: true }).fill('3');
      await form.getByLabel('Default post budget', { exact: true }).fill('0');
      await form
        .getByRole('button', { name: 'Save schedule', exact: true })
        .click();
      await form
        .getByRole('status')
        .filter({ hasText: 'Schedule settings saved.' })
        .waitFor();
      const saved = structuredClone(profile);
      assert.deepEqual(saved.schedule, {
        cadence: '30 9 * * *',
        timezone: 'Asia/Tokyo',
        coverageWindow: 'PT6H',
        storyBudget: 3,
        postBudget: 0,
      });
      await page.reload();
      await page.getByText('Schedule settings', { exact: true }).click();
      assert.equal(
        await form.getByLabel('Coverage window', { exact: true }).inputValue(),
        'PT6H',
      );
      assert.equal(
        await form.getByLabel('Daily local time', { exact: true }).inputValue(),
        '09:30',
      );
      await form
        .getByLabel('IANA timezone', { exact: true })
        .fill('Mars/Olympus');
      await form
        .getByRole('button', { name: 'Save schedule', exact: true })
        .click();
      await form
        .getByRole('status')
        .filter({ hasText: 'Invalid IANA timezone' })
        .waitFor();
      await form
        .getByLabel('IANA timezone', { exact: true })
        .fill('Asia/Tokyo');
      await form
        .getByRole('button', { name: 'Save schedule', exact: true })
        .click();
      await form
        .getByRole('status')
        .filter({ hasText: 'Schedule settings saved.' })
        .waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await form.screenshot({
        path: `docs/screenshots/schedule-${device}.png`,
      });
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Create topic', exact: true })
        .click();
      const create = page.getByRole('form', {
        name: 'Create topic',
        exact: true,
      });
      assert.equal(
        await create.getByLabel('Story budget', { exact: true }).inputValue(),
        '3',
      );
      assert.equal(
        await create.getByLabel('Post budget', { exact: true }).inputValue(),
        '0',
      );
      await page.close();
    }
    assert.deepEqual(
      await (await context.request.get(`${base}/api/topics`)).json(),
      topics,
    );
    if (latest)
      assert.deepEqual(
        await (
          await context.request.get(`${base}/api/digest-previews/${latest.id}`)
        ).json(),
        latest,
      );
    console.log(
      'Schedule desktop/mobile: in-memory save/reload, timezone errors, defaults and immutable history passed; live profile unchanged',
    );
  } finally {
    assert.deepEqual(
      await (await context.request.get(`${base}/api/profile`)).json(),
      original,
      'Browser replay must never change the live profile',
    );
    await browser.close();
  }
}
void smoke();
