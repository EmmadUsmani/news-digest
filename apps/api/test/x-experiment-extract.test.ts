import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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

void test('CLI extracts revised viral and semantic rounds without inventing review or free-link evidence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'x-extract-revised-'));
  const save = (name: string, value: unknown) =>
    writeFileSync(join(directory, name), JSON.stringify(value));
  try {
    const styles = ['viral', 'semantic'] as const;
    save('inputs.json', {
      topics: [
        {
          topicId: 'tech',
          settings: {
            trendingMinFaves: 500,
            exclusions: ['-odds'],
          },
        },
      ],
    });
    save('round.json', {
      calls: styles.map((requestId) => ({ requestId, costMicros: 50000 })),
    });
    for (const style of styles) {
      save(`${style}.request.json`, {
        ...metadata,
        requestId: style,
        style,
        body: { model: 'grok-4.3' },
      });
      save(`${style}.settled.json`, { costMicros: 50000 });
      const ids = Array.from(
        { length: style === 'viral' ? 16 : 8 },
        (_, i) => i + 1,
      );
      save(`${style}.response.json`, {
        status: 200,
        raw: response([
          {
            type: 'custom_tool_call',
            name: style === 'viral' ? 'x_keyword_search' : 'x_semantic_search',
            input: '{}',
          },
          message(
            JSON.stringify(ids.map((id) => ({ url: url(id), likes: 1000 }))),
            ids,
          ),
        ]),
      });
    }
    const run = () =>
      spawnSync(
        'pnpm',
        ['exec', 'tsx', 'apps/api/scripts/extract-x-experiment.ts', directory],
        { encoding: 'utf8' },
      );
    const result = run();
    assert.equal(result.status, 0, result.stderr);
    const evidence = JSON.parse(result.stdout);
    assert.deepEqual(
      evidence.map((call: { style: string; posts: unknown[] }) => [
        call.style,
        call.posts.length,
      ]),
      [
        ['viral', 16],
        ['semantic', 8],
      ],
    );
    for (const call of evidence) {
      assert.deepEqual(call.expectedSearch, {
        minFaves: 500,
        exclusions: ['-odds', '-giveaway'],
      });
      assert.ok(
        call.posts.every(
          (post: {
            relevance: unknown;
            promotion: unknown;
            foundByFreeLinks: unknown;
          }) =>
            post.relevance === null &&
            post.promotion === null &&
            post.foundByFreeLinks === null,
        ),
      );
    }
    save('semantic.settled.json', { costMicros: 1 });
    const mismatch = run();
    assert.equal(mismatch.status, 1);
    assert.equal(mismatch.stdout, '');
    save('semantic.settled.json', { costMicros: 50000 });
    save('inputs.json', {
      topics: [
        {
          topicId: 'tech',
          settings: { trendingMinFaves: 500, exclusions: [] },
        },
      ],
    });
    const defaultExclusion = run();
    assert.equal(defaultExclusion.status, 0, defaultExclusion.stderr);
    for (const call of JSON.parse(defaultExclusion.stdout)) {
      assert.deepEqual(call.expectedSearch.exclusions, ['-giveaway']);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
