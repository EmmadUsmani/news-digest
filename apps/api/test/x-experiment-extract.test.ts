import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { extractXExperimentResponse } from '../scripts/lib/x-experiment-extract';

const metadata = {
  requestId: 'request',
  topicId: 'tech',
  style: 'trending' as const,
  model: 'saved-model',
  window: { start: '2026-11-03T21:00:00Z', end: '2026-11-04T21:00:00Z' },
  costMicros: 50000,
};
const url = (id: number) => `https://x.com/example/status/${id}`;
const message = (text: string, ids: number[]) => ({
  type: 'message',
  role: 'assistant',
  content: [
    {
      type: 'output_text',
      text,
      annotations: ids.map((id) => ({ type: 'url_citation', url: url(id) })),
    },
  ],
});
const response = (output: unknown[]) =>
  JSON.stringify({
    usage: { server_side_tool_usage_details: { x_posts_fetched: 12 } },
    output,
  });

void test('extracts every cited post beyond production five-slot limit; preserves fetched usage and unknown labels', () => {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8];
  const evidence = extractXExperimentResponse(
    metadata,
    response([
      {
        type: 'custom_tool_call',
        name: 'x_keyword_search',
        input: '{"query":"AI min_faves:500","mode":"Top"}',
      },
      message(
        JSON.stringify(ids.map((id) => ({ url: url(id), likes: id * 100 }))),
        [...ids, 1],
      ),
    ]),
  );
  assert.equal(evidence.postsFetched, 12);
  assert.equal(evidence.posts.length, 8);
  assert.equal(evidence.posts[7].likes, 800);
  assert.ok(
    evidence.posts.every(
      (post) =>
        post.relevance === null &&
        post.promotion === null &&
        post.publishedAt === null,
    ),
  );
  assert.equal(evidence.actualToolCalls.length, 1);
});

void test('prose, uncited URLs and non-assistant messages cannot add candidates; duplicate metrics stay unknown', () => {
  const evidence = extractXExperimentResponse(
    metadata,
    response([
      message(
        JSON.stringify([
          { url: url(1), likes: 100 },
          { url: url(1), likes: 200 },
          { url: url(2), likes: 900 },
        ]),
        [1],
      ),
      { ...message('', [3]), role: 'user' },
      message(`popular post ${url(4)}`, []),
    ]),
  );
  assert.deepEqual(evidence.posts, [
    {
      id: '1',
      likes: null,
      publishedAt: null,
      relevance: null,
      promotion: null,
    },
  ]);
});

void test('retains query evidence with no citations and refuses unavailable usage', () => {
  const tool = {
    type: 'custom_tool_call',
    name: 'x_keyword_search',
    input: '{}',
  };
  assert.equal(
    extractXExperimentResponse(metadata, response([tool])).actualToolCalls
      .length,
    1,
  );
  assert.throws(() =>
    extractXExperimentResponse(metadata, JSON.stringify({ output: [] })),
  );
});

void test('CLI failure emits no partial evidence or private input', () => {
  const directory = mkdtempSync(join(tmpdir(), 'x-extract-'));
  try {
    const result = spawnSync(
      'pnpm',
      ['exec', 'tsx', 'apps/api/scripts/extract-x-experiment.ts', directory],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.ok(!result.stderr.includes(directory));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
