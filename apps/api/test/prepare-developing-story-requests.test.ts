import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import type { ReplayCase } from '../scripts/evaluate-developing-stories';
import { replayFingerprint } from '../scripts/evaluate-developing-stories';
import { prepareDevelopingRequests } from '../scripts/prepare-developing-story-requests';
import { llmConfig } from '../src/modules/curation/adapters/config';

const fixture = JSON.parse(
  readFileSync(
    new URL(
      './fixtures/developing-stories-saved-2026-11-12-18.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as { cases: ReplayCase[] };
const model = llmConfig({}).haiku;

void test('saved windows capture real adapter requests with fingerprints, dates and conservative reservation bounds', async () => {
  const before = structuredClone(fixture);
  const report = await prepareDevelopingRequests(fixture.cases, model);
  assert.equal(report.requestCount, fixture.cases.length);
  assert.equal(report.cases.length, fixture.cases.length);
  for (const [index, result] of report.cases.entries()) {
    const item = fixture.cases[index];
    assert.equal(result.inputSha256, replayFingerprint(item));
    const request = result.request!;
    assert.equal(request.purpose, 'story-grouping-v3');
    assert.deepEqual(request.model, model);
    const prompt = JSON.parse(request.prompt) as {
      candidates: {
        id: string;
        title: string;
        excerpt: string;
        publishedAt: string;
      }[];
    };
    assert.equal(prompt.candidates.length, result.occurrences);
    assert.equal(prompt.candidates[0].id, 'current:0');
    assert.equal(prompt.candidates[0].publishedAt, item.windowEnd);
    assert.equal(
      prompt.candidates[item.stories.length].publishedAt,
      item.history[0].publishedAt,
    );
    assert.ok(
      prompt.candidates.every(
        (candidate) =>
          candidate.title.length <= 500 && candidate.excerpt.length <= 600,
      ),
    );
    const bound =
      Buffer.byteLength(request.instructions + request.prompt, 'utf8') + 2048;
    assert.equal(result.inputBound, bound);
    assert.equal(
      result.reserveMicros,
      Math.ceil(bound * model.cacheWrite + 4096 * model.output),
    );
  }
  assert.equal(
    report.totalReserveMicros,
    report.cases.reduce((sum, item) => sum + item.reserveMicros!, 0),
  );
  assert.deepEqual(fixture, before);
});

void test('oversized and empty history pools do not become ready requests or zero-cost successes', async () => {
  const oversized = structuredClone(fixture.cases[0]);
  oversized.stories = Array.from({ length: 41 }, (_, i) => ({
    id: String(i),
    title: 'Story',
    summary: null,
  }));
  const empty = { ...fixture.cases[0], history: [] };
  const report = await prepareDevelopingRequests([oversized, empty], model);
  assert.deepEqual(
    report.cases.map((item) => item.unavailableReason),
    ['occurrence-limit', 'no-historical-stories'],
  );
  assert.equal(report.requestCount, 0);
  assert.equal(report.totalReserveMicros, 0);
  for (const item of report.cases) {
    assert.equal(item.status, 'unavailable');
    assert.equal(item.request, null);
    assert.equal(item.reserveMicros, null);
    assert.equal(item.inputBound, null);
  }
});
