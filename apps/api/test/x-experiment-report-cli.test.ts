import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { reportSavedXExperiment } from '../scripts/report-x-experiment';

const evidence = () => [
  {
    requestId: 'synthetic',
    topicId: 'world',
    model: 'synthetic-model',
    style: 'trending',
    window: { start: '2026-11-03T15:00:00Z', end: '2026-11-04T15:00:00Z' },
    costMicros: 50000,
    postsFetched: 1,
    actualToolCalls: [],
    posts: [
      {
        id: '123',
        publishedAt: null,
        likes: null,
        relevance: null,
        promotion: null,
      },
    ],
  },
];

void test('saved report rejects malformed evidence without coercing labels or dropping fields', () => {
  for (const input of [
    null,
    {},
    [null],
    [{ ...evidence()[0], costMicros: '50000' }],
    [{ ...evidence()[0], extra: true }],
    [
      {
        ...evidence()[0],
        posts: [{ ...evidence()[0].posts[0], promotion: 'false' }],
      },
    ],
    [{ ...evidence()[0], expectedSearch: { minFaves: 50 } }],
    [{ ...evidence()[0], window: { start: 'invalid', end: 'invalid' } }],
    [...evidence(), ...evidence()],
  ])
    assert.throws(() => reportSavedXExperiment(input));
  const [call] = reportSavedXExperiment(evidence()).calls;
  assert.equal(call.eligiblePosts, null);
  assert.equal(call.zeroPromotions, null);
  assert.deepEqual(call.unknown, {
    publishedAt: 1,
    likes: 1,
    relevance: 1,
    promotion: 1,
  });
});

void test('offline CLI reads evidence without changing it and fails without exposing invalid content', () => {
  const directory = mkdtempSync(join(tmpdir(), 'x-report-'));
  const path = join(directory, 'evidence.json');
  const run = (...args: string[]) =>
    spawnSync(
      process.execPath,
      ['--import', 'tsx', 'apps/api/scripts/report-x-experiment.ts', ...args],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          DATABASE_URL: '',
          REDIS_URL: '',
          XAI_API_KEY: '',
          ANTHROPIC_API_KEY: '',
        },
      },
    );
  try {
    const saved = JSON.stringify(evidence());
    writeFileSync(path, saved, { mode: 0o600 });
    const success = run(path);
    assert.equal(success.status, 0, success.stderr);
    assert.deepEqual(
      JSON.parse(success.stdout),
      reportSavedXExperiment(evidence()),
    );
    assert.equal(readFileSync(path, 'utf8'), saved);
    writeFileSync(path, 'private-invalid-payload');
    for (const args of [
      [],
      [path],
      [path, 'extra'],
      [join(directory, 'absent')],
    ]) {
      const failed = run(...args);
      assert.equal(failed.status, 1);
      assert.equal(failed.stdout, '');
      assert.match(failed.stderr, /^X experiment report failed:/);
      assert.ok(!failed.stderr.includes('private-invalid-payload'));
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
