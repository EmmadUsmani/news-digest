import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Job } from 'bullmq';

import { createLogger, logJob } from '../src/libs/observability/logging';
import { HistoricalXSearch as DirectXSearch } from '../src/modules/social/adapters/historical-x-search';

const request = {
  topic: 'private topic',
  guidance: 'private guidance',
  fromDate: '2026-11-01',
  toDate: '2026-11-02',
};
void test('xAI logs one safe contextual outcome per attempt including protocol and transport failures', async () => {
  const lines: string[] = [];
  const log = createLogger(
    'test',
    {
      write: (line) => {
        lines.push(line);
      },
    },
    [],
  );
  const usage = {
    input_tokens: 30,
    output_tokens: 10,
    server_side_tool_usage_details: { x_posts_fetched: 2, x_users_fetched: 1 },
  };
  const cases: [
    typeof fetch,
    number | undefined,
    string,
    string | undefined,
  ][] = [
    [
      async () => new Response(JSON.stringify({ usage, output: [] })),
      200,
      'success',
      undefined,
    ],
    [
      async () =>
        new Response('private body insufficient credits', { status: 402 }),
      402,
      'failure',
      'credits-depleted',
    ],
    [
      async () => new Response('private body', { status: 401 }),
      401,
      'failure',
      'rejected',
    ],
    [
      async () => new Response('private body', { status: 503 }),
      503,
      'failure',
      'uncertain',
    ],
    [async () => new Response('private body'), 200, 'failure', 'uncertain'],
    [async () => new Response('{}'), 200, 'failure', 'uncertain'],
    [
      async () => {
        throw new Error('private transport bearer private-key');
      },
      undefined,
      'failure',
      'uncertain',
    ],
    [
      async () =>
        new Response(
          new ReadableStream({
            start(c) {
              c.error(new Error('private stream'));
            },
          }),
        ),
      200,
      'failure',
      'uncertain',
    ],
  ];
  for (const [send, status, outcome, reason] of cases) {
    const client = new DirectXSearch('private-key', send, log);
    await logJob(
      'fixture',
      async () => {
        if (outcome === 'success') await client.search(request);
        else await assert.rejects(client.search(request));
      },
      log,
    )({ id: 'job-fixture', name: 'search', attemptsMade: 0 } as Job);
    const entry = lines
      .map((line) => JSON.parse(line))
      .filter((line) => line.event === 'external.call')
      .at(-1);
    assert.equal(entry.target, 'xai');
    assert.equal(entry.event, 'external.call');
    assert.equal(entry.jobId, 'job-fixture');
    assert.equal(entry.status, status);
    assert.equal(entry.outcome, outcome);
    assert.equal(entry.reason, reason);
    assert.equal(entry.searchType, 'open');
    assert.ok(entry.durationMs >= 0);
  }
  assert.equal(
    lines.filter((line) => JSON.parse(line).event === 'external.call').length,
    cases.length,
  );
  const success = lines
    .map((line) => JSON.parse(line))
    .find((line) => line.event === 'external.call');
  assert.equal(success.execution, 'unconfirmed');
  assert.equal(success.level, 40);
  assert.equal(success.usage.input, 30);
  assert.equal(success.usage.output, 10);
  assert.equal(success.postsFetched, 2);
  assert.equal(success.profilesFetched, 1);
  assert.equal(success.citedLinks, 0);
  await new DirectXSearch(
    'private-key',
    async () =>
      new Response(
        JSON.stringify({
          usage: { input_tokens: 3, output_tokens: 1 },
          output: [
            {
              type: 'custom_tool_call',
              name: 'x_keyword_search',
              status: 'completed',
            },
          ],
        }),
      ),
    log,
  ).search(request);
  const completed = lines
    .map((line) => JSON.parse(line))
    .filter((line) => line.event === 'external.call')
    .at(-1);
  assert.equal(completed.execution, 'completed');
  assert.equal(completed.level, 30);
  assert.equal(completed.postsFetched, 0);
  assert.doesNotMatch(lines.join(''), /private|guidance|Authorization|https:/i);
  await assert.rejects(
    new DirectXSearch('key', cases[0][0], log).search({
      ...request,
      topic: '',
    }),
  );
  assert.equal(
    lines.filter((line) => JSON.parse(line).event === 'external.call').length,
    cases.length + 1,
    'invalid local requests never call the provider',
  );
});
