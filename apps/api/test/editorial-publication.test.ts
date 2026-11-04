import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { digestPreviewSchema } from '@digest/contracts';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { ReplayLlmAdapter } from '../src/modules/curation/adapters/recorded-llm';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import { CandidateTriage } from '../src/modules/curation/application/triage';
import type { LlmPort } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';
import type { EditionProgress } from '../src/modules/digests/domain/preview.repository';

const start = new Date('2026-11-01T00:00:00Z');
const end = new Date('2026-11-02T00:00:00Z');
const id = '00000000-0000-4000-8000-000000000099';
const candidate = {
  id,
  title: 'Company launches a model',
  url: 'https://example.org/news',
  excerpt: 'The model is available today.',
  publishedAt: new Date('2026-11-01T12:00:00Z'),
  sources: ['Publisher'],
  points: 0,
};
const score = {
  id,
  relevance: 9,
  importance: 8,
  event: 'Model launch',
  rationale: 'Relevant new tool.',
};
const edit = {
  model: 'configured-editor',
  brief: ['A model launched.', 'It is available today.'],
  stories: [
    {
      id,
      evidenceIds: [id],
      headline: 'New model becomes available',
      summary: 'A company launched a model. It is available today.',
      whyItMatters: 'Builders have another tool.',
      rationale: 'Important launch.',
    },
  ],
};
async function harness(
  options: {
    incomplete?: boolean;
    refused?: boolean;
    quiet?: boolean;
    disabled?: boolean;
    supporting?: boolean;
    hardExcluded?: boolean;
    parallel?: boolean;
    reddit?: boolean;
    provider?: LlmPort;
  } = {},
) {
  const support = {
    ...candidate,
    id: '00000000-0000-4000-8000-000000000098',
    title: 'Independent hardware announcement',
    url: 'https://example.org/support',
  };
  const repository = new PostgresPreviewRepository();
  await repository.db.end();
  const stored: unknown[] = [];
  let editors = 0;
  let releaseEditors: () => void = () => {};
  const editorsReady = new Promise<void>((resolve) => {
    releaseEditors = resolve;
  });
  const calls: string[] = [];
  const client = {
    async query(
      input: string | { text: string; rowMode?: string },
      args?: unknown[],
    ) {
      const sql = typeof input === 'string' ? input : input.text;
      calls.push(
        /^(begin|commit|rollback)\b/i.test(sql) ? sql.toUpperCase() : sql,
      );
      if (sql.includes('from "social_posts" inner join "reddit_topic_posts"')) {
        assert.ok(options.reddit);
        return {
          rows: Array.from({ length: 6 }, (_, i) => ({
            externalId: `reddit${i}`,
            url: `https://www.reddit.com/comments/reddit${i}`,
            author: 'fixture',
            authorUrl: 'https://www.reddit.com/user/fixture',
            publishedAt: new Date(
              i < 5 ? '2026-10-31T02:00:00Z' : '2026-11-01T02:00:00Z',
            ),
            observedAt: new Date(
              i < 5 ? '2026-10-31T12:00:00Z' : '2026-11-01T12:00:00Z',
            ),
            metrics: {
              score: i < 5 ? 20 : 200,
              comments: 12,
              upvoteRatio: 0.95,
            },
            metadata: {
              title: 'Artificial intelligence demo',
              text: 'A new model demo.',
              subreddit: 'LocalLLaMA',
              thumbnail: null,
              externalUrl: null,
            },
            citesX: false,
          })).map((row) => Object.values(row)),
        };
      }
      if (sql.includes('from "topics"'))
        return {
          rows: Array.from(
            { length: options.parallel ? 4 : 1 },
            (_, index) => ({
              id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
              name: options.parallel ? `AI ${index}` : 'AI',
              description: 'AI tools',
              include_guidance: '',
              exclude_guidance: '',
              story_budget: 5,
              post_budget: options.reddit ? 5 : 0,
              relevance_policy: {
                includeAny: ['artificial intelligence'],
                excludeAny: options.hardExcluded ? ['cryptocurrency'] : [],
              },
            }),
          ).map((row) => Object.values(row)),
        };
      if (sql.includes('from "content_items"'))
        return {
          rows: (options.hardExcluded
            ? [
                candidate,
                { ...support, title: 'Best bets for tonight' },
                {
                  ...support,
                  id: 'excluded-topic',
                  title: 'Cryptocurrency launch',
                },
              ]
            : options.supporting
              ? [candidate, support]
              : [candidate]
          ).map((row) => [
            row.id,
            row.title,
            row.url,
            row.excerpt,
            null,
            row.publishedAt.toISOString(),
            row.sources,
            String(row.points),
          ]),
        };
      if (sql.startsWith('insert into "digest_previews"'))
        stored.push(JSON.parse(String(args?.[5])));
      return { rows: [] };
    },
    release() {},
  };
  Object.defineProperty(repository, 'db', {
    value: {
      async connect() {
        return client;
      },
    },
  });
  const cache = new Map<string, unknown>();
  const ledger: LlmLedger = {
    async cached(key) {
      return cache.get(key);
    },
    async cache(key, value) {
      cache.set(key, value);
    },
    async reserve() {
      return 'offline-reservation';
    },
    async settle() {},
    async fail() {},
  };
  const config = llmConfig({});
  const llm = options.provider
    ? new BudgetedLlm(options.provider, ledger)
    : null;
  Object.defineProperty(repository, 'editorial', {
    value: options.disabled
      ? null
      : llm
        ? {
            triage: new CandidateTriage(llm, ledger, config.haiku),
            editor: new ShortlistEditor(llm, config.sonnet, config.haiku),
          }
        : {
            triage: {
              async score(_topic: unknown, inputs: { id: string }[]) {
                if (options.hardExcluded)
                  assert.deepEqual(
                    inputs.map((item) => item.id),
                    [id],
                  );
                return {
                  scores: options.supporting
                    ? [score, { ...score, id: support.id }]
                    : [score],
                  unscoredIds: options.incomplete ? [id] : [],
                };
              },
            },
            editor: {
              async edit(_topic: unknown, shortlist: unknown[]) {
                if (options.parallel) {
                  editors++;
                  if (editors === 4) releaseEditors();
                  await editorsReady;
                }
                assert.equal(
                  shortlist.length,
                  options.supporting ? 2 : 1,
                  'Semantic relevance recovers lexical false negatives',
                );
                return options.refused
                  ? null
                  : options.quiet
                    ? { ...edit, brief: [], stories: [] }
                    : options.supporting
                      ? {
                          ...edit,
                          stories: [
                            {
                              ...edit.stories[0],
                              evidenceIds: [id, support.id],
                            },
                          ],
                        }
                      : edit;
              },
            },
          },
  });
  const progress: EditionProgress[] = [];
  const snapshot = digestPreviewSchema.parse(
    await repository.generate(start, end, undefined, async (value) => {
      progress.push(value);
    }),
  );
  assert.equal(progress[0].stage, 'topics');
  assert.ok(progress[0].topics.every((topic) => topic.stage === 'triage'));
  assert.equal(progress.at(-1)?.stage, 'publishing');
  assert.ok(progress.at(-1)?.topics.every((topic) => topic.stage === 'ready'));
  if (!options.disabled && !options.incomplete)
    assert.ok(
      progress.some((value) =>
        value.topics.some((topic) => topic.stage === 'editing'),
      ),
    );
  assert.ok(
    progress.some((value) =>
      value.topics.some((topic) => topic.stage === 'posts'),
    ),
  );
  assert.deepEqual(stored, [snapshot]);
  assert.ok(calls.includes('COMMIT'));
  return snapshot;
}
void test('publication stores semantic recovery, source provenance, editor text and audit evidence', async () => {
  const snapshot = await harness();
  const topic = snapshot.topics[0];
  assert.equal(snapshot.method, 'editorial-v1');
  assert.equal(topic.editorial?.mode, 'ai');
  assert.deepEqual(topic.editorial?.triage, [score]);
  assert.deepEqual(
    topic.editorial?.brief,
    edit.stories.map((story) => story.headline),
  );
  assert.equal(topic.stories[0].url, candidate.url);
  assert.equal(topic.stories[0].excerpt, candidate.excerpt);
  assert.equal(topic.stories[0].summary, edit.stories[0].summary);
  assert.equal(topic.stories[0].coverage?.[0].title, candidate.title);
  assert.deepEqual(topic.stories[0].evidence, [
    {
      id,
      title: candidate.title,
      url: candidate.url,
      excerpt: candidate.excerpt,
      sources: candidate.sources,
      publishedAt: candidate.publishedAt.toISOString(),
    },
  ]);
});
void test('publication labels fallback and never mixes partial semantic results with ranked selections', async () => {
  for (const options of [
    { incomplete: true },
    { refused: true },
    { disabled: true },
  ]) {
    const topic = (await harness(options)).topics[0];
    assert.equal(topic.editorial?.mode, 'non-ai');
    assert.deepEqual(topic.editorial?.brief, []);
    assert.deepEqual(
      topic.stories,
      [],
      'Fallback respects required lexical phrases',
    );
  }
});
void test('valid quiet editorial selection stays empty without padding', async () => {
  const topic = (await harness({ quiet: true })).topics[0];
  assert.equal(topic.editorial?.mode, 'ai');
  assert.deepEqual(topic.stories, []);
});

void test('publication copies evidence outside headline coverage without changing the cluster', async () => {
  const story = (await harness({ supporting: true })).topics[0].stories[0];
  assert.equal(story.coverage?.length, 1);
  assert.equal(story.evidence?.length, 2);
  assert.equal(story.evidence?.[1].url, 'https://example.org/support');
  assert.equal(story.evidence?.[1].title, 'Independent hardware announcement');
});

void test(
  'publication overlaps four topic editors and preserves configured topic order',
  { timeout: 3000 },
  async () => {
    const snapshot = await harness({ parallel: true });
    assert.deepEqual(
      snapshot.topics.map((topic) => topic.name),
      ['AI 0', 'AI 1', 'AI 2', 'AI 3'],
    );
    assert.ok(snapshot.topics.every((topic) => topic.editorial?.mode === 'ai'));
  },
);

void test('publication includes qualified Reddit snapshots from its transaction in non-AI fallback', async () => {
  const snapshot = await harness({ reddit: true, disabled: true });
  const post = snapshot.topics[0].posts?.[0];
  assert.equal(snapshot.topics[0].posts?.length, 1);
  assert.equal(post?.platform, 'reddit');
  if (post?.platform !== 'reddit') throw new Error('Missing Reddit snapshot');
  assert.equal(post.title, 'Artificial intelligence demo');
  assert.equal(post.metrics.score, 200);
  assert.equal(post.observedAt, '2026-11-01T12:00:00.000Z');
  assert.match(post.reasons.join(' '), /median/);
  assert.equal(post.citingStories, undefined);
  assert.equal(snapshot.topics[0].postEditorial?.mode, 'non-ai');
});

void test('synthetic raw LLM replay publishes the golden story through real triage and editor', async () => {
  const load = (name: string): unknown =>
    JSON.parse(
      readFileSync(new URL(`./fixtures/llm/${name}`, import.meta.url), 'utf8'),
    );
  const fixture = load('publication.synthetic.json');
  const golden = load('publication.golden.synthetic.json');
  // Fresh ledgers force the raw transport path each time; no validated cache shortcuts.
  for (let run = 0; run < 2; run++) {
    const snapshot = await harness({ provider: new ReplayLlmAdapter(fixture) });
    assert.equal(snapshot.method, 'editorial-v1');
    assert.equal(snapshot.topics[0].editorial?.mode, 'ai');
    assert.deepEqual(snapshot.topics, golden);
  }
});

void test('publication skips hard exclusions before triage while preserving semantic recovery', async () => {
  const snapshot = await harness({ hardExcluded: true });
  const topic = snapshot.topics[0];
  assert.equal(topic.candidateCount, 3);
  assert.equal(topic.editorial?.mode, 'ai');
  assert.deepEqual(topic.editorial?.unscoredIds, []);
  assert.deepEqual(
    topic.stories.map((story) => story.id),
    [id],
  );
  assert.equal(topic.qualityRejections?.length, 1);
});
