import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

function fixture(
  mode:
    | 'success'
    | 'overrun'
    | 'unknown'
    | 'token-only'
    | 'empty-search'
    | 'tool-failed-once'
    | 'timeout-once'
    | 'timeout',
  legacy = false,
) {
  const directory = mkdtempSync(join(tmpdir(), 'x-runner-'));
  const preload = join(directory, 'provider.cjs');
  writeFileSync(
    preload,
    `
require('node:os').homedir = () => ${JSON.stringify(directory)};
require('node:module').syncBuiltinESMExports();
const RealDate = Date;
global.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : [process.env.FAKE_NOW || '2026-11-05T21:00:00.000Z'])); }
  static now() { return RealDate.parse(process.env.FAKE_NOW || '2026-11-05T21:00:00.000Z'); }
};
global.fetch = async (url, options) => {
  if (url !== 'https://api.x.ai/v1/responses') throw Error('Unexpected URL');
  require('node:fs').appendFileSync(${JSON.stringify(join(directory, 'dispatches'))}, 'call\\n');
  const count = require('node:fs').readFileSync(${JSON.stringify(join(directory, 'dispatches'))}, 'utf8').trim().split('\\n').length;
  if (process.env.FAKE_MODE === 'timeout' || (process.env.FAKE_MODE === 'timeout-once' && count === 1)) throw new DOMException('Synthetic timeout', 'TimeoutError');
  if (process.env.FAKE_MODE === 'unknown') throw Error('Synthetic transport failure');
  return new Response(JSON.stringify({usage: {input_tokens: 1, output_tokens: 1,
    ...((process.env.FAKE_MODE === 'token-only' || process.env.FAKE_MODE === 'empty-search' || (process.env.FAKE_MODE === 'tool-failed-once' && count === 1)) ? {} : {server_side_tool_usage_details: {x_posts_fetched: process.env.FAKE_MODE === 'overrun' ? 31 : 1, x_users_fetched: 0}})}, output: process.env.FAKE_MODE === 'empty-search' ? [{type: 'custom_tool_call', name: 'x_keyword_search', status: 'completed'}] : (process.env.FAKE_MODE === 'tool-failed-once' && count === 1) ? [{type: 'custom_tool_call', name: 'x_keyword_search', status: 'failed'}] : []}));
};
`,
  );
  const input = join(directory, 'input.json');
  writeFileSync(
    input,
    JSON.stringify({
      window: { start: '2026-11-04T21:00:00Z', end: '2026-11-05T21:00:00Z' },
      topics: [1, 2, 3, 4].map((id) => ({
        topicId: String(id),
        topic: String(id),
        ready: true,
        requests: Object.fromEntries(
          (legacy
            ? ['current', 'trending', 'reactions']
            : ['viral', 'semantic']
          ).map((style) => [style, { model: 'grok-4.3' }]),
        ),
      })),
    }),
  );
  const root = join(directory, '.local/state/news-digest/x-experiment');
  const run = (fakeMode = mode, round?: string, now?: string) =>
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
          FAKE_NOW: now,
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
    input,
    run,
    journal,
    cleanup: () => rmSync(directory, { recursive: true, force: true }),
  };
}

void test('experiment runner settles all eight synthetic calls separately from production', () => {
  const f = fixture('success');
  try {
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.journal().entries.length, 8);
    const round = readdirSync(f.root).find((name) => name !== 'budget.json');
    assert.ok(round);
    const requests = readdirSync(join(f.root, round))
      .filter((name) => name.endsWith('.request.json'))
      .map(
        (name) =>
          JSON.parse(readFileSync(join(f.root, round, name), 'utf8')) as {
            style: string;
          },
      );
    assert.deepEqual(requests.map((request) => request.style).sort(), [
      'semantic',
      'semantic',
      'semantic',
      'semantic',
      'viral',
      'viral',
      'viral',
      'viral',
    ]);
    assert.ok(
      f.journal().entries.every((entry) => entry.actualMicros === 5004),
    );
    assert.equal(
      readFileSync(join(f.directory, 'dispatches'), 'utf8').trim().split('\n')
        .length,
      8,
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
    assert.equal(f.journal().entries.length, 8);
    assert.equal(
      f.journal().entries.filter((entry) => entry.actualMicros === null).length,
      1,
    );
    assert.equal(
      readFileSync(join(f.directory, 'dispatches'), 'utf8').trim().split('\n')
        .length,
      8,
    );
  } finally {
    f.cleanup();
  }
});

void test('revised runner refuses legacy prepared requests before any provider dispatch', () => {
  const f = fixture('success', true);
  try {
    assert.equal(f.run().status, 1);
    assert.equal(readdirSync(f.directory).includes('dispatches'), false);
    assert.equal(readdirSync(f.directory).includes('.local'), false);
  } finally {
    f.cleanup();
  }
});

void test('runner rejects invalid round windows and topics before charging or dispatch', () => {
  for (const mutate of [
    (input: {
      window: { start: string; end: string };
      topics: { topicId: string }[];
    }) => {
      input.window.start = '2026-11-03T21:00:00Z';
    },
    (input: {
      window: { start: string; end: string };
      topics: { topicId: string }[];
    }) => {
      input.window.start = '2026-11-05T21:00:00Z';
      input.window.end = '2026-11-06T21:00:00Z';
    },
    (input: {
      window: { start: string; end: string };
      topics: { topicId: string }[];
    }) => {
      input.window.start = '2026-11-04T21:00:00';
    },
    (input: {
      window: { start: string; end: string };
      topics: { topicId: string }[];
    }) => {
      input.topics[1].topicId = input.topics[0].topicId;
    },
    (input: {
      window: { start: string; end: string };
      topics: { topicId: string }[];
    }) => {
      input.topics[0].topicId = ' ';
    },
  ]) {
    const f = fixture('success');
    try {
      const input = JSON.parse(readFileSync(f.input, 'utf8'));
      mutate(input);
      writeFileSync(f.input, JSON.stringify(input));
      assert.equal(f.run().status, 1);
      assert.equal(readdirSync(f.directory).includes('dispatches'), false);
      assert.equal(readdirSync(f.directory).includes('.local'), false);
    } finally {
      f.cleanup();
    }
  }
});

void test('runner refuses a closed 24-hour window before the evening test time', () => {
  const f = fixture('success');
  try {
    const input = JSON.parse(readFileSync(f.input, 'utf8'));
    input.window = {
      start: '2026-11-04T20:00:00Z',
      end: '2026-11-05T20:00:00Z',
    };
    writeFileSync(f.input, JSON.stringify(input));
    assert.equal(f.run('success', undefined, '2026-11-05T20:59:59Z').status, 1);
    assert.equal(readdirSync(f.directory).includes('dispatches'), false);
    assert.equal(readdirSync(f.directory).includes('.local'), false);
  } finally {
    f.cleanup();
  }
});

void test('experiment runner settles token-only responses instead of retaining reservations', () => {
  const f = fixture('token-only');
  try {
    const result = f.run();
    assert.equal(result.status, 1);
    assert.equal(f.journal().entries.length, 2);
    assert.ok(f.journal().entries.every((entry) => entry.actualMicros === 4));
    const round = readdirSync(f.root).find((name) => name !== 'budget.json');
    assert.ok(round);
    assert.equal(f.run('success', round).status, 0);
    assert.equal(f.journal().entries.length, 9);
  } finally {
    f.cleanup();
  }
});

void test('timeout retry is separately admitted and retains the original hold', () => {
  const f = fixture('timeout-once');
  try {
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.journal().entries.length, 9);
    assert.equal(f.journal().entries[0].actualMicros, null);
    assert.equal(f.journal().entries[1].actualMicros, 5004);
    const round = readdirSync(f.root).find((name) => name !== 'budget.json');
    assert.ok(round);
    assert.ok(
      readdirSync(join(f.root, round)).some((name) =>
        name.endsWith('-retry-1.request.json'),
      ),
    );
  } finally {
    f.cleanup();
  }
});

void test('two timeouts stop and continuing cannot dispatch a third attempt', () => {
  const f = fixture('timeout');
  try {
    assert.equal(f.run().status, 1);
    assert.deepEqual(
      f.journal().entries.map((entry) => entry.actualMicros),
      [null, null],
    );
    const round = readdirSync(f.root).find((name) => name !== 'budget.json');
    assert.ok(round);
    assert.equal(f.run('success', round).status, 0);
    assert.equal(f.journal().entries.length, 9);
    assert.equal(
      f.journal().entries.filter((entry) => entry.actualMicros === null).length,
      2,
    );
  } finally {
    f.cleanup();
  }
});

void test('timeout retry refuses dispatch when the retained hold fills the daily cap', () => {
  const f = fixture('timeout');
  try {
    mkdirSync(f.root, { recursive: true });
    writeFileSync(
      join(f.root, 'budget.json'),
      JSON.stringify({
        version: 1,
        entries: [
          {
            id: 'prior',
            day: '2026-11-05',
            reservedMicros: 850000,
            actualMicros: 850000,
          },
        ],
      }),
    );
    assert.equal(f.run().status, 1);
    assert.equal(f.journal().entries.length, 2);
    assert.equal(
      readFileSync(join(f.directory, 'dispatches'), 'utf8').trim(),
      'call',
    );
    assert.equal(f.journal().entries[1].actualMicros, null);
  } finally {
    f.cleanup();
  }
});

void test('completed empty searches are valid and never retried', () => {
  const f = fixture('empty-search');
  try {
    assert.equal(f.run().status, 0);
    assert.equal(f.journal().entries.length, 8);
  } finally {
    f.cleanup();
  }
});

void test('failed search retries once after settling the first response', () => {
  const f = fixture('tool-failed-once');
  try {
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.journal().entries.length, 9);
    assert.equal(f.journal().entries[0].actualMicros, 4);
    assert.equal(f.journal().entries[1].actualMicros, 5004);
  } finally {
    f.cleanup();
  }
});

function prepareNov5Rerun(f: ReturnType<typeof fixture>) {
  const input = JSON.parse(readFileSync(f.input, 'utf8'));
  input.topics.forEach((topic: { topicId: string }, index: number) => {
    topic.topicId = `00000000-0000-4000-8000-0000000000${11 + index}`;
  });
  writeFileSync(f.input, JSON.stringify(input));
  const original = join(f.root, '2026-11-05T21-00-19-488Z');
  mkdirSync(original, { recursive: true });
  writeFileSync(join(original, 'inputs.json'), JSON.stringify(input));
}

void test('authorized Nov 5 rerun dispatches only three keyword cells once with required tool choice', () => {
  const f = fixture('success');
  try {
    prepareNov5Rerun(f);
    const result = f.run(
      'success',
      '--nov5-keyword-rerun',
      '2026-11-06T00:40:00.000Z',
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.journal().entries.length, 3);
    const requests = readdirSync(join(f.root, 'nov5-keyword-rerun'))
      .filter((name) => name.endsWith('.request.json'))
      .map((name) =>
        JSON.parse(
          readFileSync(join(f.root, 'nov5-keyword-rerun', name), 'utf8'),
        ),
      );
    assert.deepEqual(
      requests.map((request) => request.topicId).sort(),
      [12, 13, 14].map((id) => `00000000-0000-4000-8000-0000000000${id}`),
    );
    assert.ok(
      requests.every(
        (request) =>
          request.style === 'viral' && request.body.tool_choice === 'required',
      ),
    );
    assert.equal(
      f.run('success', '--nov5-keyword-rerun', '2026-11-06T01:00:00.000Z')
        .status,
      1,
    );
    assert.equal(f.journal().entries.length, 3);
  } finally {
    f.cleanup();
  }
});

void test('Nov 5 rerun refuses changed inputs, protected hours and other dates before dispatch', () => {
  const f = fixture('success');
  try {
    prepareNov5Rerun(f);
    for (const now of [
      '2026-11-05T23:00:00.000Z',
      '2026-11-06T14:00:00.000Z',
      '2026-11-07T00:00:00.000Z',
    ])
      assert.equal(f.run('success', '--nov5-keyword-rerun', now).status, 1);
    const input = JSON.parse(readFileSync(f.input, 'utf8'));
    input.topics[1].requests.viral.extra = 'changed';
    writeFileSync(f.input, JSON.stringify(input));
    assert.equal(
      f.run('success', '--nov5-keyword-rerun', '2026-11-06T01:00:00.000Z')
        .status,
      1,
    );
    assert.ok(!readdirSync(f.directory).includes('dispatches'));
  } finally {
    f.cleanup();
  }
});

void test('Nov 5 rerun timeout retains its hold and cannot retry a second time', () => {
  const f = fixture('timeout');
  try {
    prepareNov5Rerun(f);
    assert.equal(
      f.run('timeout', '--nov5-keyword-rerun', '2026-11-06T01:00:00.000Z')
        .status,
      1,
    );
    assert.deepEqual(
      f.journal().entries.map((entry) => entry.actualMicros),
      [null],
    );
    assert.equal(
      f.run('success', '--nov5-keyword-rerun', '2026-11-06T01:10:00.000Z')
        .status,
      0,
    );
    assert.equal(f.journal().entries.length, 3);
    assert.equal(
      f.journal().entries.filter((entry) => entry.actualMicros === null).length,
      1,
    );
  } finally {
    f.cleanup();
  }
});
