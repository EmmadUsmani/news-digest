// Explicit live browser check: saved reader data and real X widgets, no LLM calls.
// Inject prepared headers into this browser only; deployment flags stay untouched.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { prepareAccessStack } from '../apps/api/src/public-write/access-stack';

async function main() {
  const reviewScripts = process.argv.includes('--review-scripts');
  const origin = 'http://127.0.0.1:8000';
  const saved = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const posts = saved.topics
    .flatMap((topic) => topic.posts)
    .filter((post) => post.platform === 'x');
  assert.ok(posts.length, 'Latest saved edition needs real X posts');
  const middleware = prepareAccessStack({
    publicMode: true,
    accounts: (_request, _response, next) => next(),
    publicAccess: () => (_request, _response, next) => next(),
    legacyAccess: () => (_request, _response, next) => next(),
  });
  const server = createServer((request, response) =>
    middleware(request, response, () => response.end()),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const policy = (await fetch(`http://127.0.0.1:${address.port}`)).headers.get(
    'content-security-policy',
  );
  assert.ok(policy);
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
        });
        await page.addInitScript(() => {
          Object.assign(window, {
            policyViolations: [] as string[],
            scriptReports: [] as string[],
          });
          document.addEventListener('securitypolicyviolation', (event) => {
            if (event.disposition === 'report') {
              const source = event.sourceFile.startsWith(
                'https://platform.twitter.com/',
              )
                ? 'official-widget'
                : event.sourceFile.startsWith(location.origin + '/')
                  ? 'same-origin-reported'
                  : 'other';
              (
                window as unknown as { scriptReports: string[] }
              ).scriptReports.push(
                `${event.effectiveDirective}/${event.blockedURI === 'inline' || event.blockedURI === 'eval' ? event.blockedURI : 'external'}/${source}`,
              );
              return;
            }
            (
              window as unknown as { policyViolations: string[] }
            ).policyViolations.push(
              `${event.effectiveDirective}: ${event.blockedURI}`,
            );
          });
        });
        await page.route('**/*', async (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) return route.abort();
          if (
            new URL(request.url()).origin === origin &&
            request.isNavigationRequest()
          ) {
            const response = await route.fetch();
            return route.fulfill({
              response,
              headers: {
                ...response.headers(),
                'content-security-policy': policy,
                ...(reviewScripts
                  ? {
                      'content-security-policy-report-only':
                        "script-src 'self' https://platform.twitter.com; report-uri /__csp-review",
                    }
                  : {}),
              },
            });
          }
          return route.continue();
        });
        await page.goto(`${origin}/editions/${saved.id}`);
        for (const post of posts) {
          const card = page
            .locator('.post-card')
            .filter({ has: page.locator(`.byline a[href="${post.url}"]`) });
          await card.scrollIntoViewIfNeeded();
          const frame = card.locator('iframe');
          await frame.waitFor({ state: 'visible', timeout: 45_000 });
          await frame.contentFrame().locator('body').waitFor();
          assert.match(
            (await frame.getAttribute('src')) ?? '',
            /^https:\/\/(platform|syndication)\.twitter\.com\//,
          );
          assert.ok(
            (await frame.boundingBox())!.height > 100,
            'Real widget has rendered height',
          );
          if (!reviewScripts)
            await card.screenshot({
              path: `docs/screenshots/ui/public-x-${post.externalId}-${device}-${theme}.png`,
            });
        }
        assert.deepEqual(
          await page.evaluate(
            () =>
              (window as unknown as { policyViolations: string[] })
                .policyViolations,
          ),
          [],
        );
        if (reviewScripts) {
          const reports = await page.evaluate(
            () =>
              (window as unknown as { scriptReports: string[] }).scriptReports,
          );
          const counts: Record<string, number> = {};
          for (const report of reports)
            counts[report] = (counts[report] ?? 0) + 1;
          console.log(
            `${device}/${theme}: script report-only ${JSON.stringify(counts)}`,
          );
        }
        console.log(
          `${device}/${theme}: ${posts.length} real saved X widgets visible; no enforced document CSP violations`,
        );
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
