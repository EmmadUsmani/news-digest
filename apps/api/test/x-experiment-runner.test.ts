import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

function fixture(mode: 'success' | 'overrun' | 'unknown', revised = false) {
  const directory = mkdtempSync(join(tmpdir(), 'x-runner-'));
  const preload = join(directory, 'provider.cjs');
  writeFileSync(
    preload,
    `
require('node:os').homedir = () => ${JSON.stringify(directory)};
require('node:module').syncBuiltinESMExports();
const RealDate = Date;
global.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : ['2026-11-04T21:00:00.000Z'])); }
  static now() { return RealDate.parse('2026-11-04T21:00:00.000Z'); }
};
global.fetch = async (url, options) => {
  if (url !== 'https://api.x.ai/v1/responses') throw Error('Unexpected URL');
  require('node:fs').appendFileSync(${JSON.stringify(join(directory, 'dispatches'))}, 'call\\n');
  if (process.env.FAKE_MODE === 'unknown') throw Error('Synthetic transport failure');
  return new Response(JSON.stringify({usage: {input_tokens: 1, output_tokens: 1,
    server_side_tool_usage_details: {x_posts_fetched: process.env.FAKE_MODE === 'overrun' ? 31 : 1, x_users_fetched: 0}}, output: []}));
};
`,
  );
  const input = join(directory, 'input.json');
  writeFileSync(
    input,
    JSON.stringify({
      window: { start: '2026-11-03T21:00:00Z', end: '2026-11-04T21:00:00Z' },
      topics: [1, 2, 3, 4].map((id) => ({
        topicId: String(id),
        topic: String(id),
        ready: true,
        requests: Object.fromEntries(
          (revised
            ? ['viral', 'semantic']
            : ['current', 'trending', 'reactions']
          ).map((style) => [style, { model: 'grok-4.3' }]),
        ),
      })),
    }),
  );
  const root = join(directory, '.local/state/news-digest/x-experiment');
  const run = (fakeMode = mode, round?: string) =>
    spawnSync(
      'pnpm',
      [
        'exec',
        'tsx',
        'apps/api/scripts/run-x-experiment.ts',
        input,
        ...(round ? [round] : []),
      ],
      {
        env: {
          ...process.env,
          NODE_OPTIONS: `--require=${preload}`,
          X_EXPERIMENT_LIVE: '1',
          XAI_API_KEY: 'synthetic-key',
          FAKE_MODE: fakeMode,
        },
        encoding: 'utf8',
      },
    );
  const journal = () =>
    JSON.parse(readFileSync(join(root, 'budget.json'), 'utf8')) as {
      entries: { actualMicros: number | null }[];
    };
  return {
    directory,
    root,
    run,
    journal,
    cleanup: () => rmSync(directory, { recursive: true, force: true }),
  };
}

void test('experiment runner settles all twelve synthetic calls separately from production', () => {
  const f = fixture('success');
  try {
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.journal().entries.length, 12);
    assert.ok(
      f.journal().entries.every((entry) => entry.actualMicros === 5004),
    );
    assert.equal(
      readFileSync(join(f.directory, 'dispatches'), 'utf8').trim().split('\n')
        .length,
      12,
    );
  } finally {
    f.cleanup();
  }
});

void test('experiment runner stops immediately on a settled reservation overrun', () => {
  const f = fixture('overrun');
  try {
    assert.equal(f.run().status, 1);
    assert.deepEqual(
      f.journal().entries.map((entry) => entry.actualMicros),
      [155004],
    );
  } finally {
    f.cleanup();
  }
});

void test('continuing an interrupted round never retries its unknown paid call', () => {
  const f = fixture('unknown');
  try {
    assert.equal(f.run().status, 1);
    assert.deepEqual(
      f.journal().entries.map((entry) => entry.actualMicros),
      [null],
    );
    const round = readdirSync(f.root).find((name) => name !== 'budget.json');
    assert.ok(round);
    const result = f.run('success', round);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.journal().entries.length, 12);
    assert.equal(
      f.journal().entries.filter((entry) => entry.actualMicros === null).length,
      1,
    );
    assert.equal(
      readFileSync(join(f.directory, 'dispatches'), 'utf8').trim().split('\n')
        .length,
      12,
    );
  } finally {
    f.cleanup();
  }
});

void test('legacy runner refuses revised prepared requests before any provider dispatch', () => {
  const f = fixture('success', true);
  try {
    assert.equal(f.run().status, 1);
    assert.equal(readdirSync(f.directory).includes('dispatches'), false);
    assert.equal(readdirSync(f.root).includes('budget.json'), false);
  } finally {
    f.cleanup();
  }
});
