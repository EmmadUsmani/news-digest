// Explicit live check: connects one Google News query and waits for real collection.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { topicSchema, topicUpdateSchema } from '@digest/contracts';
const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const created: string[] = [];
  try {
    const original = topicSchema
      .array()
      .parse(await (await context.request.get(`${base}/api/topics`)).json());
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const topic = topicSchema.parse(
        await (
          await context.request.post(`${base}/api/topics`, {
            data: {
              ...topicUpdateSchema.strip().parse(original[0]),
              name: `News query check ${device}`,
              relevancePolicy: { includeAny: [], excludeAny: [] },
            },
          })
        ).json(),
      );
      created.push(topic.id);
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      await page.goto(base);
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: `Sources for ${topic.name}`, exact: true })
        .click();
      const form = page.getByRole('form', {
        name: `Add news query for ${topic.name}`,
        exact: true,
      });
      await form
        .getByLabel('News query', { exact: true })
        .fill('artificial intelligence');
      await form
        .getByRole('button', { name: 'Connect news query', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Feed connected.' })
        .waitFor();
      const saved = topicSchema
        .array()
        .parse(await (await context.request.get(`${base}/api/topics`)).json())
        .find((t) => t.id === topic.id)!;
      assert.equal(saved.sources.length, 1);
      for (const query of ['', 'x'.repeat(101), 'AI\nnews'])
        assert.equal(
          (
            await context.request.post(
              `${base}/api/topics/${topic.id}/queries`,
              { data: { query } },
            )
          ).status(),
          400,
        );
      assert.equal(
        (
          await context.request.post(`${base}/api/topics/${topic.id}/queries`, {
            data: { query: 'artificial intelligence' },
          })
        ).status(),
        201,
      );
      assert.equal(
        topicSchema
          .array()
          .parse(await (await context.request.get(`${base}/api/topics`)).json())
          .find((t) => t.id === topic.id)!.sources.length,
        1,
      );
      const card = page
        .locator('.topic-grid article')
        .filter({
          has: page.getByRole('heading', { name: topic.name, exact: true }),
        });
      // Refresh incoming stories after the worker's minute scheduler discovers the source.
      const deadline = Date.now() + 100000;
      while (Date.now() < deadline) {
        const groups = await (
          await context.request.get(`${base}/api/content`)
        ).json();
        if (
          groups.find(
            (g: { topicId: string; items: unknown[] }) =>
              g.topicId === topic.id,
          )?.items.length
        )
          break;
        await page.waitForTimeout(2000);
      }
      await page.reload();
      await card.locator('.headlines a').first().waitFor();
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: `Sources for ${topic.name}`, exact: true })
        .click();
      const sources = page.getByRole('form', {
        name: `Sources for ${topic.name}`,
        exact: true,
      });
      assert.equal(
        await sources
          .getByRole('checkbox', {
            name: 'Google News: artificial intelligence',
          })
          .isChecked(),
        true,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page
        .locator('.topic-settings')
        .screenshot({ path: `docs/screenshots/news-queries-${device}.png` });
      await sources
        .getByRole('checkbox', { name: 'Google News: artificial intelligence' })
        .uncheck();
      await sources
        .getByRole('button', { name: 'Save sources', exact: true })
        .click();
      await sources
        .getByRole('status')
        .filter({ hasText: 'Source connections saved.' })
        .waitFor();
      await card
        .getByText('No sources connected yet.', { exact: false })
        .waitFor();
      await context.request.delete(`${base}/api/topics/${topic.id}`);
      await page.close();
    }
    // Retain verified discovery for Tech & AI using the same query feed.
    assert.equal(
      (
        await context.request.post(
          `${base}/api/topics/${original[0].id}/queries`,
          { data: { query: 'artificial intelligence' } },
        )
      ).status(),
      201,
    );
    assert.equal(
      (
        await context.request.post(
          `${base}/api/topics/00000000-0000-4000-8000-999999999999/queries`,
          { data: { query: 'AI' } },
        )
      ).status(),
      404,
    );
    console.log(
      'News query desktop/mobile: validation, scheduled real collection, shared query reuse, persistence and disconnect passed',
    );
  } finally {
    for (const id of created)
      await context.request.delete(`${base}/api/topics/${id}`);
    await browser.close();
  }
}
void smoke();
