import assert from 'node:assert/strict';

import { profileSettingsSchema, scheduleSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { validateSchedule } from '../apps/api/src/modules/profiles/domain/schedule';
import { localAdminJson } from './lib/local-admin-fetch';

const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const original = profileSettingsSchema.parse(
    await localAdminJson('/api/admin/profile'),
  );
  const profile = structuredClone(original);
  const [content, status, topics, latest] = await Promise.all([
    localAdminJson('/api/admin/content'),
    localAdminJson('/api/admin/status'),
    localAdminJson('/api/admin/topics'),
    localAdminJson('/api/admin/digest-previews/latest'),
  ]);
  const snapshots: Record<string, unknown> = {
    '/api/content': content,
    '/api/status': status,
    '/api/topics': topics,
  };
  const unexpectedWrites: string[] = [];
  const credentials: string[] = [];
  context.on('request', (request) => {
    const headers = request.headers();
    if ('admin_local_token' in headers || 'x-exedev-email' in headers)
      credentials.push(new URL(request.url()).pathname);
  });
  await context.route('**/*', (route) => {
    const request = route.request();
    const headers = request.headers();
    if ('admin_local_token' in headers || 'x-exedev-email' in headers)
      return route.abort();
    if (!['GET', 'HEAD'].includes(request.method())) {
      unexpectedWrites.push(
        `${request.method()} ${new URL(request.url()).pathname}`,
      );
      return route.abort();
    }
    const path = new URL(request.url()).pathname;
    if (Object.hasOwn(snapshots, path))
      return route.fulfill({ json: snapshots[path] });
    return route.continue();
  });
  let failSave = false;
  let pendingSave: Promise<void> | undefined;
  let releaseSave: (() => void) | undefined;
  let saves = 0;
  // All browser profile reads/writes are replayed in memory, including reloads.
  await context.route('**/api/profile', (route) =>
    route.fulfill({ json: profile }),
  );
  await context.route('**/api/profile/schedule', async (route) => {
    assert.equal(route.request().method(), 'PUT');
    saves++;
    if (pendingSave) await pendingSave;
    if (failSave) return route.abort('failed');
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
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      Object.assign(profile, structuredClone(original));
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      await page.goto(base);
      const probe = await page.evaluate(async () => {
        try {
          await fetch('/api/profile/unexpected-write-probe', {
            method: 'POST',
          });
          return false;
        } catch {
          return true;
        }
      });
      assert.ok(probe);
      assert.equal(
        unexpectedWrites.pop(),
        'POST /api/profile/unexpected-write-probe',
      );
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
      const beforeFailure = structuredClone(profile);
      failSave = true;
      const previousSaves = saves;
      pendingSave = new Promise<void>((resolve) => {
        releaseSave = resolve;
      });
      await form
        .getByRole('button', { name: 'Save schedule', exact: true })
        .click();
      const saving = form.getByRole('button', { name: 'Saving…', exact: true });
      await saving.waitFor();
      assert.ok(await saving.isDisabled());
      for (const label of [
        'Daily local time',
        'IANA timezone',
        'Coverage window',
        'Default story budget',
        'Default post budget',
      ]) {
        assert.ok(await form.getByLabel(label, { exact: true }).isDisabled());
      }
      assert.equal(saves, previousSaves + 1);
      assert.deepEqual(profile, beforeFailure);
      await form.screenshot({
        path: `docs/screenshots/schedule-saving-${device}.png`,
      });
      releaseSave!();
      pendingSave = undefined;
      await form
        .getByRole('status')
        .filter({ hasText: 'Could not save schedule settings.' })
        .waitFor();
      assert.deepEqual(profile, beforeFailure);
      assert.ok(
        await form
          .getByRole('button', { name: 'Save schedule', exact: true })
          .isEnabled(),
      );
      assert.equal(
        await form.getByLabel('Daily local time', { exact: true }).inputValue(),
        '09:30',
      );
      assert.equal(
        await form.getByLabel('IANA timezone', { exact: true }).inputValue(),
        'Asia/Tokyo',
      );
      assert.equal(
        await form.getByLabel('Coverage window', { exact: true }).inputValue(),
        'PT6H',
      );
      assert.equal(
        await form
          .getByLabel('Default story budget', { exact: true })
          .inputValue(),
        '3',
      );
      assert.equal(
        await form
          .getByLabel('Default post budget', { exact: true })
          .inputValue(),
        '0',
      );
      await form.screenshot({
        path: `docs/screenshots/schedule-save-failure-${device}.png`,
      });
      failSave = false;
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
      for (const [label, value] of [
        ['IANA timezone', 'Asia/Tokyo'],
        ['Default story budget', '3'],
        ['Default post budget', '0'],
      ]) {
        assert.equal(
          await form.getByLabel(label, { exact: true }).inputValue(),
          value,
        );
      }
      assert.equal(saves, previousSaves + 2);
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
      assert.deepEqual(pageErrors, []);
      assert.deepEqual(credentials, []);
      assert.deepEqual(unexpectedWrites, []);
      await page.close();
    }
    assert.deepEqual(await localAdminJson('/api/admin/topics'), topics);
    if (latest)
      assert.deepEqual(
        await localAdminJson(
          `/api/admin/digest-previews/${(latest as { id: string }).id}`,
        ),
        latest,
      );
    console.log(
      'Schedule desktop/mobile: pending-save locks, failed-save recovery, all saved fields after reload, timezone errors, defaults, blocked writes, credential absence and full edition/topics/profile immutability passed',
    );
  } finally {
    try {
      assert.deepEqual(
        await localAdminJson('/api/admin/profile'),
        original,
        'Browser replay must never change the live profile',
      );
    } finally {
      await browser.close();
    }
  }
}
void smoke();
