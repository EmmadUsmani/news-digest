import assert from 'node:assert/strict';
import { test } from 'node:test';

import { digestPreviewSchema } from '@digest/contracts';

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
    parallel?: boolean;
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
    async query(sql: string, args?: unknown[]) {
      calls.push(sql);
      if (sql.includes('FROM topics'))
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
              post_budget: 0,
              relevance_policy: {
                includeAny: ['artificial intelligence'],
                excludeAny: [],
              },
            }),
          ),
        };
      if (sql.includes('FROM content_items'))
        return {
          rows: options.supporting ? [candidate, support] : [candidate],
        };
      if (sql.startsWith('INSERT')) stored.push(args?.[5]);
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
  Object.defineProperty(repository, 'editorial', {
    value: options.disabled
      ? null
      : {
          triage: {
            async score() {
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
                          { ...edit.stories[0], evidenceIds: [id, support.id] },
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
