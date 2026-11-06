import assert from 'node:assert/strict';

import {
  contentGroupSchema,
  operationsStatusSchema,
  profileSettingsSchema,
  readerEditionSchema,
  topicSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function smoke() {
  assert.ok(
    [undefined, 'desktop', 'mobile'].includes(
      process.env.EDITION_JOB_SMOKE_VIEWPORT,
    ),
    'EDITION_JOB_SMOKE_VIEWPORT must be desktop or mobile when set',
  );
  // Read-only live edition; every generation request is intercepted (no inference).
  const readLatest = async () => {
    const response = await fetch('http://localhost:8000/api/editions/latest', {
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200);
    return readerEditionSchema.parse(await response.json());
  };
  const [edition, content, topics, profile, status, savedEdition] =
    await Promise.all([
      readLatest(),
      localAdminJson('/api/admin/content').then((data) =>
        contentGroupSchema.array().parse(data),
      ),
      localAdminJson('/api/admin/topics').then((data) =>
        topicSchema.array().parse(data),
      ),
      localAdminJson('/api/admin/profile').then((data) =>
        profileSettingsSchema.parse(data),
      ),
      localAdminJson('/api/admin/status').then((data) =>
        operationsStatusSchema.parse(data),
      ),
      localAdminJson('/api/admin/digest-previews/latest'),
    ]);
  assert.equal((savedEdition as { id: string }).id, edition.id);
  const snapshots: Record<string, unknown> = {
    '/api/admin/content': content,
    '/api/admin/topics': topics,
    '/api/admin/profile': profile,
    '/api/admin/status': status,
  };
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      if (
        process.env.EDITION_JOB_SMOKE_VIEWPORT &&
        process.env.EDITION_JOB_SMOKE_VIEWPORT !== name
      )
        continue;
      for (const theme of ['light', 'dark'] as const) {
        const screenshotName = `${name}${theme === 'dark' ? '-dark' : ''}`;
        const jobId =
          name === 'desktop' ? '11111111-1111-4111-8111-111111111111' : '123';
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          serviceWorkers: 'block',
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.setDefaultTimeout(15000);
        const writes: string[] = [];
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
            writes.push(
              `${request.method()} ${new URL(request.url()).pathname}`,
            );
            return route.abort();
          }
          if (new URL(request.url()).origin !== 'http://127.0.0.1:8000')
            return route.abort();
          const path = new URL(request.url()).pathname;
          if (Object.hasOwn(snapshots, path))
            return route.fulfill({ json: snapshots[path] });
          return route.continue();
        });
        let submissions = 0;
        let loseQueueResponse = true;
        let stallQueueResponse = true;
        let state = 'waiting';
        let disconnected = false;
        let invalidStatus: unknown = undefined;
        let stallNextPoll = false;
        let stalledPolls = 0;
        let stage = 'triage';
        await context.route(
          '**/api/admin/digest-previews/jobs',
          async (route) => {
            assert.equal(route.request().method(), 'POST');
            submissions++;
            if (stallQueueResponse) return;
            if (loseQueueResponse) return route.abort('failed');
            await route.fulfill({
              status: 202,
              json: { id: jobId },
            });
          },
        );
        await context.route(
          `**/api/admin/digest-previews/jobs/${jobId}`,
          async (route) => {
            if (stallNextPoll) {
              stallNextPoll = false;
              stalledPolls++;
              return; // Hold this request until the browser's real deadline aborts it.
            }
            if (invalidStatus !== undefined)
              return route.fulfill({ json: invalidStatus });
            if (disconnected) return route.fulfill({ status: 503, json: {} });
            await route.fulfill({
              json: {
                id: jobId,
                state,
                progress:
                  state === 'active'
                    ? {
                        stage: stage === 'publishing' ? 'publishing' : 'topics',
                        topics: [
                          {
                            id: 'fixture',
                            name: 'Fixture topic',
                            stage: stage === 'publishing' ? 'ready' : stage,
                          },
                        ],
                      }
                    : null,
                editionId: state === 'completed' ? edition.id : null,
              },
            });
          },
        );
        await replayAdminPage(page);
        await page.goto('http://127.0.0.1:8000/admin/editions/new');
        const create = page.getByRole('button', {
          name: 'Create edition · last 24 hours',
        });
        await create.waitFor();
        assert.equal(
          await page
            .locator('html')
            .evaluate((node) => node.classList.contains('dark')),
          theme === 'dark',
        );
        await page.waitForFunction(
          () =>
            !document.querySelector<HTMLFieldSetElement>('fieldset')?.disabled,
        );
        await create.click();
        await page
          .getByRole('alert')
          .filter({
            hasText: 'Could not confirm whether your edition was queued.',
          })
          .waitFor({ timeout: 25000 });
        assert.equal(await create.isEnabled(), true);
        await page
          .getByRole('link', { name: 'Browse saved editions' })
          .waitFor();
        assert.equal(submissions, 1);
        assert.equal(
          await page.evaluate(() => sessionStorage.getItem('edition-job')),
          null,
        );
        await page
          .getByText('Browse saved editions', { exact: true })
          .scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `docs/screenshots/ui/edition-queue-review-focus-${screenshotName}.png`,
          fullPage: false,
        });
        await page.reload();
        await create.waitFor();
        assert.equal(
          submissions,
          1,
          'Reload must not resubmit a timed-out job',
        );
        stallQueueResponse = false;
        await create.click();
        await page
          .getByRole('alert')
          .filter({
            hasText:
              'Check saved editions before trying again to avoid a duplicate run.',
          })
          .waitFor();
        assert.equal(submissions, 2);
        assert.equal(await create.isEnabled(), true);
        await page
          .getByRole('link', { name: 'Browse saved editions' })
          .waitFor();
        assert.equal(
          await page.evaluate(() => sessionStorage.getItem('edition-job')),
          null,
        );
        await page
          .getByRole('alert')
          .filter({
            hasText: 'Could not confirm whether your edition was queued.',
          })
          .scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `docs/screenshots/ui/edition-queue-interrupted-${screenshotName}.png`,
          fullPage: false,
        });
        await page.reload();
        await create.waitFor();
        assert.equal(
          submissions,
          2,
          'Reload must not resubmit an uncertain job',
        );
        loseQueueResponse = false;
        await create.click();
        await page
          .getByRole('status')
          .filter({ hasText: 'Edition queued' })
          .waitFor();
        assert.equal(
          await page
            .getByRole('button', { name: 'Creating edition…' })
            .isDisabled(),
          true,
        );
        state = 'active';
        await page
          .getByRole('status')
          .filter({ hasText: 'Creating your edition' })
          .waitFor();
        await page.screenshot({
          path: `docs/screenshots/edition-job-${screenshotName}.png`,
          fullPage: true,
        });
        await page.reload();
        await page
          .getByRole('status')
          .filter({ hasText: 'Creating your edition' })
          .waitFor();
        assert.equal(submissions, 3);
        for (const [next, label] of [
          ['editing', 'Fixture topic · editing'],
          ['posts', 'Fixture topic · posts'],
          ['publishing', 'Publishing your edition'],
        ]) {
          stage = next;
          await page
            .getByRole(next === 'publishing' ? 'status' : 'listitem')
            .filter({ hasText: label })
            .waitFor();
        }
        disconnected = true;
        await page
          .getByRole('status')
          .filter({ hasText: 'Connection interrupted' })
          .waitFor();
        disconnected = false;
        await page
          .getByRole('status')
          .filter({ hasText: 'Publishing your edition' })
          .waitFor();
        for (const invalid of [
          {},
          { id: '456', state: 'failed', editionId: null, progress: null },
          {
            id: jobId,
            state: 'completed',
            editionId: null,
            progress: null,
          },
          {
            id: jobId,
            state: 'completed',
            editionId: '../admin',
            progress: null,
          },
          {
            id: jobId,
            state: 'active',
            editionId: null,
            progress: { stage: 'topics', topics: 'invalid' },
          },
        ]) {
          invalidStatus = invalid;
          await page
            .getByRole('status')
            .filter({ hasText: 'Connection interrupted' })
            .waitFor();
          assert.equal(submissions, 3);
          assert.equal(
            await page.evaluate(() => sessionStorage.getItem('edition-job')),
            jobId,
          );
          assert.equal(
            await page
              .getByRole('button', { name: 'Creating edition…' })
              .isDisabled(),
            true,
          );
          if (Object.keys(invalid).length === 0) {
            await page
              .getByRole('status')
              .filter({ hasText: 'Connection interrupted' })
              .scrollIntoViewIfNeeded();
            await page.screenshot({
              path: `docs/screenshots/edition-job-invalid-status-${screenshotName}.png`,
            });
          }
          invalidStatus = undefined;
          await page
            .getByRole('status')
            .filter({ hasText: 'Publishing your edition' })
            .waitFor();
        }
        stallNextPoll = true;
        // The stalled request must time out without submitting a replacement job.
        await page.waitForFunction(
          () =>
            Array.from(document.querySelectorAll('[role="status"]')).some(
              (node) => node.textContent?.includes('Connection interrupted'),
            ),
          undefined,
          { timeout: 25000 },
        );
        assert.equal(stalledPolls, 1);
        assert.equal(submissions, 3);
        assert.equal(
          await page.evaluate(() => sessionStorage.getItem('edition-job')),
          jobId,
        );
        await page
          .getByRole('status')
          .filter({ hasText: 'Connection interrupted' })
          .scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `docs/screenshots/edition-job-timeout-${screenshotName}.png`,
        });
        state = 'completed';
        await page
          .getByRole('link', { name: 'Inspect created edition' })
          .waitFor();
        assert.equal(
          await page
            .getByRole('link', { name: 'Inspect created edition' })
            .getAttribute('href'),
          `/admin/editions/${edition.id}`,
        );
        assert.equal(
          await page.evaluate(() => sessionStorage.getItem('edition-job')),
          null,
        );
        state = 'failed';
        await page.goto('http://127.0.0.1:8000/admin/editions/new');
        await create.click();
        await page
          .getByRole('status')
          .filter({ hasText: 'Edition generation failed' })
          .waitFor();
        assert.equal(await create.isEnabled(), true);
        assert.equal(submissions, 4);
        assert.deepEqual(errors, []);
        assert.deepEqual(writes, []);
        assert.deepEqual(credentials, []);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await context.close();
      }
    }
    assert.deepEqual(
      await readLatest(),
      edition,
      'Simulated jobs must not change saved editions',
    );
    assert.deepEqual(
      await localAdminJson('/api/admin/digest-previews/' + edition.id),
      savedEdition,
      'Simulated jobs must preserve the full protected saved edition',
    );
    assert.deepEqual(await localAdminJson('/api/admin/topics'), topics);
    assert.deepEqual(await localAdminJson('/api/admin/profile'), profile);
    console.log(
      'Async edition UI: desktop/mobile light/dark real queue deadline, interrupted queue response with saved edition review link without automatic resubmission, queue, active, reload, reconnect, malformed/mismatched status recovery, stalled-poll timeout, completion link and failure passed; protected operational snapshots; unexpected browser writes blocked and no browser credentials; full saved edition, topics and profile unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
