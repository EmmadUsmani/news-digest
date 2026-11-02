import assert from 'node:assert/strict';

import { profileSettingsSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { protectSchedule } from './lib/schedule-recovery';
const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const restoreSchedule = await protectSchedule(base);
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
      const saved = profileSettingsSchema.parse(
        await (await context.request.get(`${base}/api/profile`)).json(),
      );
      assert.deepEqual(saved.schedule, {
        cadence: '30 9 * * *',
        timezone: 'Asia/Tokyo',
        coverageWindow: 'PT6H',
        storyBudget: 3,
        postBudget: 0,
      });
      for (const override of [
        { timezone: 'Mars/Olympus' },
        { cadence: '* * * * *' },
        { coverageWindow: 'P32D' },
        { coverageWindow: 'P0D' },
        { storyBudget: 21 },
        { postBudget: -1 },
        { extra: true },
      ]) {
        assert.equal(
          (
            await context.request.put(`${base}/api/profile/schedule`, {
              data: { ...saved.schedule, ...override },
            })
          ).status(),
          400,
        );
        assert.deepEqual(
          await (await context.request.get(`${base}/api/profile`)).json(),
          saved,
        );
      }
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
      'Schedule desktop/mobile: persistence, validation atomicity, timezone errors, new-topic defaults and immutable history passed',
    );
  } finally {
    await restoreSchedule();
    await browser.close();
  }
}
void smoke();
