import 'reflect-metadata';

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import {
  digestPreviewSchema,
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { NestFactory } from '@nestjs/core';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { ReplayLlmAdapter } from '../src/modules/curation/adapters/recorded-llm';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import {
  type EditorialResult,
  ShortlistEditor,
} from '../src/modules/curation/application/editor';
import { llmFingerprint } from '../src/modules/curation/application/llm-fingerprint';
import {
  CandidateTriage,
  type TriageCandidate,
  type TriageTopic,
} from '../src/modules/curation/application/triage';
import { LlmValidationFailure } from '../src/modules/curation/application/validation-failure';
import type {
  LlmPort,
  LlmRequest,
  ModelPrice,
} from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import { developmentEditorialServices } from '../src/modules/curation/public/development-editorial';
import {
  withLlmExecution,
  withScheduledAttempt,
} from '../src/modules/curation/public/scheduled-context';
import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';
import type { PreviewRepository } from '../src/modules/digests/domain/preview.repository';
import type { Candidate, rank } from '../src/modules/digests/domain/rank';
import { readerEdition } from '../src/modules/digests/reader-edition.controller';

const fixture = (name: string) =>
  JSON.parse(
    readFileSync(
      new URL(`fixtures/editions/${name}.json`, import.meta.url),
      'utf8',
    ),
  );

for (const { systemTest, mode } of [false, true].flatMap((systemTest) =>
  (
    ['non-ai', 'ai', ...(systemTest ? [] : (['expired-ai'] as const))] as const
  ).map((mode) => ({ systemTest, mode })),
)) {
  void test(`${mode} ${systemTest ? 'system private test' : 'edition'} matches the golden snapshot through publication and retrieval`, async (t) => {
    const previous = process.env.SYSTEM_OWNERSHIP;
    process.env.SYSTEM_OWNERSHIP = systemTest ? '1' : '0';
    t.after(() => {
      if (previous === undefined) delete process.env.SYSTEM_OWNERSHIP;
      else process.env.SYSTEM_OWNERSHIP = previous;
    });
    assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
    assert.equal(process.env.ANTHROPIC_API_KEY, '');
    const adapter = new PostgresPreviewRepository();
    const repository: PreviewRepository = adapter;
    const calls: string[] = [];
    let reservations = 0;
    let replay: LlmPort | undefined;
    if (mode === 'ai' || mode === 'expired-ai') {
      // Synthetic LlmPort responses exercise real parsing, triage and editing.
      // A fresh cache per test makes the first publication exercise both calls.
      const responses = fixture('ai-responses');
      const cache = new Map<string, unknown>();
      const ledger: LlmLedger = {
        async cached(key) {
          return cache.get(key);
        },
        async cache(key, value) {
          cache.set(key, value);
        },
        async reserve() {
          reservations++;
          assert.notEqual(
            mode,
            'expired-ai',
            'expired execution must not reserve',
          );
          return 'synthetic-golden-reservation';
        },
        async settle() {},
        async fail() {
          assert.fail('Golden response must validate');
        },
      };
      const provider: LlmPort = {
        async complete(request) {
          assert.notEqual(
            mode,
            'expired-ai',
            'expired execution must not dispatch',
          );
          calls.push(request.purpose);
          assert.ok(
            ['candidate-triage-v1', 'shortlist-editor-v13'].includes(
              request.purpose,
            ),
          );
          return {
            text: JSON.stringify(
              request.purpose === 'candidate-triage-v1'
                ? {
                    items: responses.triage.items.map(
                      (item: { id: string }) => ({
                        ...item,
                        id: String(
                          JSON.parse(request.prompt).candidates.findIndex(
                            (candidate: { originalId: string }) =>
                              candidate.originalId === item.id,
                          ),
                        ),
                      }),
                    ),
                  }
                : responses.editor,
            ),
            usage: { input: 100, output: 100, cacheRead: 0, cacheWrite: 0 },
          };
        },
      };
      replay = provider;
      const config = llmConfig({});
      const llm = new BudgetedLlm(provider, ledger);
      Object.defineProperty(adapter, 'editorial', {
        value: {
          triage: new CandidateTriage(llm, ledger, config.haiku),
          editor: new ShortlistEditor(llm, config.sonnet, config.haiku),
        },
      });
    }
    const topic = '00000000-0000-4000-8000-000000000879';
    const source = 'golden-science-publisher';
    const items = fixture('non-ai-input') as {
      id: string;
      title: string;
      url: string;
      excerpt: string;
      publishedAt: string;
      points: number;
    }[];
    const original = (await adapter.db.query('SELECT id,enabled FROM topics'))
      .rows;
    try {
      await adapter.db.query('UPDATE topics SET enabled=false');
      await adapter.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,story_budget,post_budget)
       VALUES($1,'00000000-0000-4000-8000-000000000001','Golden science','Synthetic science fixture','',100,2,0)`,
        [topic],
      );
      await adapter.db.query(
        `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,'Golden publisher','feed','https://example.org/golden/feed')`,
        [source, topic],
      );
      await adapter.db.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [topic, source],
      );
      for (const item of items) {
        await adapter.db.query(
          `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at,engagement) VALUES($1,$2,$3,$4,$5,$6)`,
          [
            item.id,
            item.url,
            item.title,
            item.excerpt,
            item.publishedAt,
            { points: item.points },
          ],
        );
        await adapter.db.query(
          'INSERT INTO content_observations(source_id,item_id) VALUES($1,$2)',
          [source, item.id],
        );
      }
      const expected = fixture(
        `${mode === 'expired-ai' ? 'non-ai' : mode}-golden`,
      );
      const editions = [];
      for (let i = 0; i < 2; i++) {
        const edition = digestPreviewSchema.parse(
          await (systemTest
            ? adapter.generateTest(
                new Date(expected.windowStart),
                new Date(expected.windowEnd),
                false,
                false,
                replay
                  ? (id) =>
                      developmentEditorialServices(
                        {
                          complete: async (request) => ({
                            status: 'complete',
                            mustReport: false,
                            value: await replay.complete({
                              ...request,
                              model:
                                request.role === 'haiku'
                                  ? llmConfig({}).haiku
                                  : llmConfig({}).sonnet,
                              purpose:
                                request.role === 'haiku'
                                  ? 'candidate-triage-v1'
                                  : 'shortlist-editor-v13',
                            }),
                          }),
                        },
                        id,
                      )
                  : undefined,
              )
            : mode === 'expired-ai'
              ? withScheduledAttempt(`deadline-golden:${i}`, 1, () =>
                  withLlmExecution({ deadline: 0 }, () =>
                    repository.generate(
                      new Date(expected.windowStart),
                      new Date(expected.windowEnd),
                      `deadline-golden:${i}`,
                    ),
                  ),
                )
              : repository.generate(
                  new Date(expected.windowStart),
                  new Date(expected.windowEnd),
                )),
        );
        assert.deepEqual(await repository.find(edition.id), edition);
        if (systemTest) {
          assert.equal(await repository.find(edition.id, true), null);
          const row = (
            await adapter.db.query(
              'SELECT kind,published_at,profile_id FROM digest_previews WHERE id=$1',
              [edition.id],
            )
          ).rows[0];
          assert.deepEqual(row, {
            kind: 'test',
            published_at: null,
            profile_id: '00000000-0000-4000-8000-000000000001',
          });
          process.env.SYSTEM_OWNERSHIP = '0';
          assert.deepEqual(await repository.find(edition.id), edition);
          process.env.SYSTEM_OWNERSHIP = '1';
        }
        const { id: _id, createdAt: _createdAt, ...stable } = edition;
        if (mode === 'expired-ai') {
          assert.equal(reservations, 0);
          assert.equal(edition.topics[0].editorial.mode, 'non-ai');
          assert.deepEqual(await repository.find(edition.id, true), edition);
          assert.deepEqual(
            await repository.findByGenerationKey(`deadline-golden:${i}`),
            { id: edition.id },
          );
          assert.equal(edition.topics[0].stories.length, 2);
          for (const story of edition.topics[0].stories)
            assert.equal(story.excerpt, 'Fixture reporting.');
          assert.deepEqual(
            stable.topics.map((topic) =>
              topic.stories.map((story) => story.id),
            ),
            expected.topics.map((topic: { stories: { id: string }[] }) =>
              topic.stories.map((story) => story.id),
            ),
          );
        } else assert.deepEqual(stable, expected);
        editions.push(edition);
      }
      assert.notEqual(editions[0].id, editions[1].id);
      assert.deepEqual(await repository.find(editions[0].id), editions[0]);
      // Production repeats use the cache; private tests get a fresh per-edition cache.
      assert.deepEqual(
        calls,
        mode === 'ai'
          ? Array.from({ length: systemTest ? 2 : 1 }, () => [
              'candidate-triage-v1',
              'shortlist-editor-v13',
            ]).flat()
          : [],
      );
    } finally {
      await adapter.db.query(
        'DELETE FROM content_observations WHERE source_id=$1',
        [source],
      );
      await adapter.db.query(
        'DELETE FROM content_items WHERE id=ANY($1::uuid[])',
        [items.map((item) => item.id)],
      );
      await adapter.db.query('DELETE FROM topics WHERE id=$1', [topic]);
      await adapter.db.query('DELETE FROM content_sources WHERE id=$1', [
        source,
      ]);
      for (const row of original)
        await adapter.db.query('UPDATE topics SET enabled=$2 WHERE id=$1', [
          row.id,
          row.enabled,
        ]);
      await adapter.onModuleDestroy();
    }
  });
}

for (const mode of ['fallback', 'synthetic-ai'] as const) {
  void test(`${mode} ungrouped recorded stories survive publication and snapshot retrieval`, async () => {
    assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
    assert.equal(process.env.ANTHROPIC_API_KEY, '');
    const adapter = new PostgresPreviewRepository();
    const topic = '00000000-0000-4000-8000-000000000889';
    const source = 'grouping-recorded-publisher';
    const recorded = JSON.parse(
      readFileSync(
        new URL(
          'fixtures/event-grouping-gaming-2026-11-02.json',
          import.meta.url,
        ),
        'utf8',
      ),
    ) as { candidates: Candidate[] };
    const items = recorded.candidates.filter((item) =>
      [
        'e9fabd3c-98d9-458b-8cd0-94424c5d212e',
        'f0703d80-c31c-4799-91cc-5060a004228c',
        'c8de0e97-9ab0-4f83-b5e2-ce79ad2b4455',
      ].includes(item.id),
    );
    assert.equal(items.length, 3);
    const originals = (await adapter.db.query('SELECT id,enabled FROM topics'))
      .rows;
    if (mode === 'synthetic-ai') {
      Object.defineProperty(adapter, 'editorial', {
        value: {
          triage: {
            async score(_context: unknown, candidates: Candidate[]) {
              return {
                scores: candidates.map((item) => ({
                  id: item.id,
                  relevance: 9,
                  importance: 8,
                  event: 'Studio closure',
                  rationale: 'Recorded closure reporting.',
                })),
                unscoredIds: [],
              };
            },
          },
          editor: {
            async edit(
              _context: unknown,
              ranked: ReturnType<typeof rank>,
              budget: number,
            ) {
              return {
                model: 'synthetic-grouping-editor',
                stories: ranked.slice(0, budget).map((item) => ({
                  id: item.id,
                  evidenceIds: [item.id],
                  headline: item.title,
                  summary: 'Synthetic test summary.',
                  whyItMatters: 'Synthetic context.',
                  rationale: 'Test selection.',
                })),
              };
            },
          },
        },
      });
    } else {
      Object.defineProperty(adapter, 'editorial', { value: null });
    }
    try {
      await adapter.db.query('UPDATE topics SET enabled=false');
      await adapter.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,story_budget,post_budget) VALUES($1,'00000000-0000-4000-8000-000000000001','Grouping Gaming','Recorded offline fixture','',100,5,0)`,
        [topic],
      );
      await adapter.db.query(
        `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,'Recorded fixture','feed','https://example.org/grouping/feed')`,
        [source, topic],
      );
      await adapter.db.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [topic, source],
      );
      for (const item of items) {
        await adapter.db.query(
          'INSERT INTO content_items(id,canonical_url,title,excerpt,published_at,engagement) VALUES($1,$2,$3,$4,$5,$6)',
          [
            item.id,
            item.url,
            item.title,
            item.excerpt,
            item.publishedAt,
            { points: item.points },
          ],
        );
        await adapter.db.query(
          'INSERT INTO content_observations(source_id,item_id) VALUES($1,$2)',
          [source, item.id],
        );
      }
      const publish = async () =>
        digestPreviewSchema.parse(
          await adapter.generate(
            new Date('2026-11-02'),
            new Date('2026-11-03'),
          ),
        );
      const edition = await publish();
      assert.equal(edition.topics[0].stories.length, 3);
      assert.deepEqual(
        edition.topics[0].stories
          .map((story) => ({
            id: story.id,
            coverageIds: story.coverage.map((item) => item.id),
          }))
          .sort((a, b) => a.id.localeCompare(b.id)),
        fixture('ungrouped-coverage-golden'),
      );
      assert.equal(
        edition.topics[0].editorial?.mode,
        mode === 'fallback' ? 'non-ai' : 'ai',
      );
      assert.deepEqual(await adapter.find(edition.id), edition);
    } finally {
      await adapter.db.query(
        'DELETE FROM content_observations WHERE source_id=$1',
        [source],
      );
      await adapter.db.query(
        'DELETE FROM content_items WHERE id=ANY($1::uuid[])',
        [items.map((item) => item.id)],
      );
      await adapter.db.query('DELETE FROM topics WHERE id=$1', [topic]);
      await adapter.db.query('DELETE FROM content_sources WHERE id=$1', [
        source,
      ]);
      for (const row of originals)
        await adapter.db.query('UPDATE topics SET enabled=$2 WHERE id=$1', [
          row.id,
          row.enabled,
        ]);
      await adapter.onModuleDestroy();
    }
  });
}

void test('system edition scope preserves publication filters, replay and rollback-compatible generation', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const adapter = new PostgresPreviewRepository();
  const previous = process.env.SYSTEM_OWNERSHIP;
  const owner = '00000000-0000-4000-8000-000000000001';
  const foreign = crypto.randomUUID();
  const ids = Array.from({ length: 3 }, () => crypto.randomUUID());
  const topicIds = Array.from({ length: 2 }, () => crypto.randomUUID());
  const created: string[] = [...ids];
  const originals = (await adapter.db.query('SELECT id, enabled FROM topics'))
    .rows;
  try {
    await adapter.db.query('INSERT INTO profiles (id, name) VALUES ($1, $2)', [
      foreign,
      'System scope fixture',
    ]);
    await adapter.db.query('UPDATE topics SET enabled=false');
    for (let i = 0; i < topicIds.length; i++)
      await adapter.db.query(
        `INSERT INTO topics (id, profile_id, name, description, include_guidance, position, story_budget, post_budget)
         VALUES ($1,$2,$3,'','', $4,0,0)`,
        [topicIds[i], i === 0 ? null : foreign, `Shared ${i}`, 100 + i],
      );
    for (let i = 0; i < ids.length; i++) {
      const snapshot = {
        id: ids[i],
        createdAt: `2090-01-0${i + 1}T00:00:00.000Z`,
        windowStart: '2089-12-31T00:00:00.000Z',
        windowEnd: '2090-01-01T00:00:00.000Z',
        method: 'editorial-v1',
        topics: [],
      };
      await adapter.db.query(
        `INSERT INTO digest_previews (id, profile_id, created_at, window_start, window_end, snapshot, scheduled_key, kind, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          ids[i],
          i === 0 ? owner : i === 1 ? null : foreign,
          snapshot.createdAt,
          snapshot.windowStart,
          snapshot.windowEnd,
          snapshot,
          `integration:scope:${ids[i]}`,
          i === 2 ? 'test' : 'scheduled',
          i === 2 ? null : snapshot.createdAt,
        ],
      );
    }
    delete process.env.SYSTEM_OWNERSHIP;
    assert.equal((await adapter.latest())?.id, ids[0]);
    assert.equal(await adapter.find(ids[1]), null);
    assert.equal(
      await adapter.findByGenerationKey(`integration:scope:${ids[1]}`),
      null,
    );
    process.env.SYSTEM_OWNERSHIP = '1';
    assert.equal((await adapter.latest())?.id, ids[2]);
    assert.equal((await adapter.latest(true))?.id, ids[1]);
    assert.equal(await adapter.find(ids[2], true), null);
    assert.equal((await adapter.find(ids[1], true))?.id, ids[1]);
    assert.deepEqual(
      await adapter.findByGenerationKey(`integration:scope:${ids[1]}`),
      { id: ids[1] },
    );
    assert.deepEqual(
      (await adapter.history(0)).entries.slice(0, 3).map((e) => e.id),
      [...ids].reverse(),
    );
    assert.deepEqual(
      (await adapter.history(0, true)).entries.slice(0, 2).map((e) => e.id),
      [ids[1], ids[0]],
    );
    const start = new Date('2091-01-01T00:00:00Z');
    const end = new Date('2091-01-02T00:00:00Z');
    const shared = await adapter.generateTest(start, end);
    created.push(shared.id);
    assert.deepEqual(
      shared.topics.map((t) => t.id),
      topicIds,
    );
    assert.deepEqual(await adapter.find(shared.id), shared);
    assert.deepEqual(
      (
        await adapter.db.query(
          'SELECT profile_id FROM digest_previews WHERE id=$1',
          [shared.id],
        )
      ).rows,
      [{ profile_id: owner }],
    );
    const replay = await adapter.generate(
      start,
      end,
      `integration:scope:${ids[1]}`,
    );
    assert.equal(replay.id, ids[1]);
    delete process.env.SYSTEM_OWNERSHIP;
    assert.deepEqual(await adapter.find(shared.id), shared);
    assert.equal(await adapter.find(ids[2]), null);
    assert.equal(
      (await adapter.history(0)).entries.some(
        (e) => e.id === ids[1] || e.id === ids[2],
      ),
      false,
    );
    const legacy = await adapter.generateTest(start, end);
    created.push(legacy.id);
    assert.deepEqual(legacy.topics, []);
  } finally {
    if (previous === undefined) delete process.env.SYSTEM_OWNERSHIP;
    else process.env.SYSTEM_OWNERSHIP = previous;
    const cleanup = await adapter.db.connect();
    try {
      await cleanup.query('BEGIN');
      await cleanup.query(
        'ALTER TABLE digest_previews DISABLE TRIGGER immutable_digest_preview',
      );
      await cleanup.query(
        'DELETE FROM digest_previews WHERE id=ANY($1::uuid[])',
        [created],
      );
      await cleanup.query(
        'ALTER TABLE digest_previews ENABLE TRIGGER immutable_digest_preview',
      );
      await cleanup.query('COMMIT');
    } catch (error) {
      await cleanup.query('ROLLBACK');
      throw error;
    } finally {
      cleanup.release();
    }
    await adapter.db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      topicIds,
    ]);
    await adapter.db.query('DELETE FROM profiles WHERE id=$1', [foreign]);
    for (const row of originals)
      await adapter.db.query('UPDATE topics SET enabled=$2 WHERE id=$1', [
        row.id,
        row.enabled,
      ]);
    await adapter.onModuleDestroy();
  }
});

for (const [entryIndex, label, automaticRepair] of [
  [0, 'Sonnet initial', false],
  [1, 'Sonnet repair', false],
  [2, 'malformed Haiku initial', false],
  [3, 'Haiku repair', false],
  [3, 'Haiku automatic repair', true],
] as const) {
  void test(`historical NBA ${label} ${entryIndex === 2 ? 'falls back to source excerpts' : 'survives publication'} through public reader HTTP with synthetic triage and metadata`, async (t) => {
    assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
    assert.equal(process.env.ANTHROPIC_API_KEY, '');
    const raw = JSON.parse(
      readFileSync(
        new URL('fixtures/llm/nba-2026-11-12-raw.json', import.meta.url),
        'utf8',
      ),
    ) as {
      provenance: string;
      request: LlmRequest;
      responseText: string;
    };
    const saved = JSON.parse(
      readFileSync(
        new URL('fixtures/llm/nba-2026-11-12-rejected.json', import.meta.url),
        'utf8',
      ),
    ) as {
      entries: {
        input: {
          topic: TriageTopic;
          candidates: TriageCandidate[];
          budget: number;
        };
        output: Omit<EditorialResult, 'model'>;
        model: ModelPrice;
      }[];
    };
    const { input, output, model } = saved.entries[entryIndex];
    const rejected = entryIndex === 2;
    // Only entry 0 retains verbatim transport. Other outputs are historical
    // structured values serialized here, with a synthetic request using that model.
    const request = entryIndex === 0 ? raw.request : { ...raw.request, model };
    const responseText =
      entryIndex === 0 ? raw.responseText : JSON.stringify(output);
    const provenance =
      entryIndex === 0
        ? raw.provenance
        : 'Historical NBA structured output; synthetic request, serialization and zero usage.';
    // Only the initial request/body and candidate reporting are historical. Triage,
    // URLs, dates, attribution and zero token usage below are test scaffolding.
    const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    const replay = new ReplayLlmAdapter({
      version: 1,
      provenance,
      records: automaticRepair
        ? [
            {
              fingerprint: llmFingerprint(request),
              model: model.id,
              response: {
                text: JSON.stringify(saved.entries[2].output),
                usage,
              },
            },
            {
              fingerprint: llmFingerprint({
                ...request,
                prompt:
                  request.prompt +
                  '\nReturn only valid JSON matching the requested schema. No markdown fences.' +
                  new LlmValidationFailure('invalid-selection').feedback,
              }),
              model: model.id,
              response: { text: responseText, usage },
            },
          ]
        : Array.from({ length: rejected ? 6 : 1 }, () => ({
            fingerprint: llmFingerprint(request),
            model: model.id,
            response: { text: responseText, usage },
          })),
    });
    const cache = new Map<string, unknown>();
    let dispatches = 0;
    let settlements = 0;
    let reservations = 0;
    let cacheWrites = 0;
    const llm = new BudgetedLlm(
      {
        async complete(request) {
          dispatches++;
          return replay.complete(request);
        },
      },
      {
        async cached(key) {
          return cache.get(key);
        },
        async cache(key, value) {
          cacheWrites++;
          if (automaticRepair) {
            assert.equal(
              dispatches,
              2,
              'only the corrected response may be cached',
            );
            assert.deepEqual(value, output);
          }
          cache.set(key, value);
        },
        async reserve() {
          reservations++;
          return 'historical-publication-offline';
        },
        async settle(_id, actual, cost) {
          settlements++;
          assert.deepEqual(actual, usage);
          assert.equal(cost, 0);
        },
        async fail() {
          assert.fail('Historical NBA response must validate');
        },
      },
    );
    const editor = new ShortlistEditor(
      {
        // Preserve Sonnet initial transport identity (others use synthetic requests); validate against candidates actually
        // loaded and shortlisted by the publication pipeline, using today's guard.
        json: (_request, validate) =>
          llm.json(request, validate, { repair: automaticRepair }),
      },
      model,
      model,
    );
    const adapter = new PostgresPreviewRepository();
    const topic = '00000000-0000-4000-8000-000000000890';
    const source = 'historical-nba-publication-fixture';
    const originals = (await adapter.db.query('SELECT id,enabled FROM topics'))
      .rows;
    Object.defineProperty(adapter, 'editorial', {
      value: {
        triage: {
          async score(_context: unknown, candidates: TriageCandidate[]) {
            return {
              scores: candidates.map((candidate) => ({
                id: candidate.id,
                relevance: 9,
                importance: 8,
                event: candidate.id,
                rationale: 'Synthetic triage for publication regression.',
              })),
              unscoredIds: [],
            };
          },
        },
        editor,
      },
    });
    try {
      await adapter.db.query('UPDATE topics SET enabled=false');
      await adapter.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,story_budget,post_budget) VALUES($1,'00000000-0000-4000-8000-000000000001','NBA','NBA basketball news and analysis.','',100,5,0)`,
        [topic],
      );
      await adapter.db.query(
        `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,'Offline NBA fixture','feed','https://example.org/nba/feed')`,
        [source, topic],
      );
      await adapter.db.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [topic, source],
      );
      for (const candidate of input.candidates) {
        await adapter.db.query(
          `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at,engagement) VALUES($1,$2,$3,$4,$5,$6)`,
          [
            candidate.id,
            `https://example.org/nba/${candidate.id}`,
            candidate.title,
            candidate.excerpt,
            '2026-11-12T10:00:00Z',
            { points: 0 },
          ],
        );
        await adapter.db.query(
          'INSERT INTO content_observations(source_id,item_id) VALUES($1,$2)',
          [source, candidate.id],
        );
      }
      const expected = output.stories.map((story) => ({
        id: story.id,
        title: story.headline,
        summary: story.summary,
        whyItMatters: story.whyItMatters,
        evidenceIds: [...story.evidenceIds].sort(),
      }));
      const editions = [];
      for (let i = 0; i < 2; i++) {
        const edition = digestPreviewSchema.parse(
          await adapter.generate(
            new Date('2026-11-12'),
            new Date('2026-11-13'),
            `historical-nba-offline:${entryIndex}:${automaticRepair}:${i}`,
          ),
        );
        assert.equal(edition.topics.length, 1);
        if (rejected) {
          const section = edition.topics[0];
          assert.equal(section.editorial.mode, 'non-ai');
          assert.equal(section.editorial.model, null);
          assert.deepEqual(section.editorial.brief, []);
          assert.match(section.editorial.reason, /validation exhausted/);
          assert.equal(section.stories.length, 5);
          for (const story of section.stories) {
            const source = input.candidates.find(
              (item) => item.id === story.id,
            );
            assert.ok(source, 'fallback may only select supplied story IDs');
            assert.equal(story.title, source.title);
            assert.equal(story.excerpt, source.excerpt);
            assert.equal(story.summary, undefined);
            assert.equal(story.whyItMatters, undefined);
          }
          const reader = readerEdition(edition);
          assert.deepEqual(reader.topics[0].brief, []);
          for (const story of reader.topics[0].stories) {
            assert.equal(
              story.summary,
              input.candidates.find((item) => item.id === story.id)!.excerpt,
            );
          }
        } else {
          assert.equal(edition.topics[0].editorial.mode, 'ai');
          assert.equal(edition.topics[0].editorial.model, model.id);
          assert.deepEqual(
            edition.topics[0].stories.map((story) => ({
              id: story.id,
              title: story.title,
              summary: story.summary,
              whyItMatters: story.whyItMatters,
              evidenceIds: story.evidence.map((item) => item.id).sort(),
            })),
            expected,
          );
          assert.deepEqual(await adapter.find(edition.id, true), edition);
          const reader = readerEdition((await adapter.find(edition.id, true))!);
          assert.deepEqual(
            reader.topics[0].brief,
            output.stories.slice(0, 4).map((story) => story.headline),
          );
          assert.deepEqual(
            reader.topics[0].stories.map(({ id, title, summary }) => ({
              id,
              title,
              summary,
            })),
            // Reader contracts intentionally omit editorial context from stories.
            expected.map(({ id, title, summary }) => ({ id, title, summary })),
          );
        }
        assert.deepEqual(await adapter.find(edition.id, true), edition);
        editions.push(edition);
      }
      assert.notEqual(editions[0].id, editions[1].id);
      assert.deepEqual(await adapter.find(editions[0].id, true), editions[0]);
      const unpublished = await adapter.generate(
        new Date('2026-11-12'),
        new Date('2026-11-13'),
      );
      assert.ok(await adapter.find(unpublished.id));
      assert.equal(await adapter.find(unpublished.id, true), null);
      // Use emitted constructor metadata, as in the deployed reader controller.
      const require = createRequire(import.meta.url);
      const { ReaderEditionController } =
        require('../dist/modules/digests/reader-edition.controller.js') as typeof import('../src/modules/digests/reader-edition.controller');
      const { PreviewRepository } =
        require('../dist/modules/digests/domain/preview.repository.js') as typeof import('../src/modules/digests/domain/preview.repository');
      const previous = {
        PUBLIC_MODE: process.env.PUBLIC_MODE,
        READER_PUBLISHED_ONLY: process.env.READER_PUBLISHED_ONLY,
      };
      t.after(() => {
        for (const key of ['PUBLIC_MODE', 'READER_PUBLISHED_ONLY'] as const) {
          if (previous[key] === undefined) delete process.env[key];
          else process.env[key] = previous[key];
        }
      });
      process.env.PUBLIC_MODE = '1';
      process.env.READER_PUBLISHED_ONLY = '1';
      const app = await NestFactory.create(
        {
          module: class HistoricalReaderModule {},
          controllers: [ReaderEditionController],
          // The fixture owns the pool and closes it after database cleanup.
          providers: [
            {
              provide: PreviewRepository,
              useValue: {
                latest: adapter.latest.bind(adapter),
                find: adapter.find.bind(adapter),
                history: adapter.history.bind(adapter),
              },
            },
          ],
        },
        { logger: false },
      );
      try {
        await app.listen(0, '127.0.0.1');
        const base = await app.getUrl();
        for (const edition of editions) {
          const response = await fetch(`${base}/api/editions/${edition.id}`);
          assert.equal(response.status, 200);
          assert.equal(
            response.headers.get('cache-control'),
            'private, max-age=3600, immutable',
          );
          const body: unknown = await response.json();
          assert.deepEqual(
            readerEditionSchema.parse(body),
            readerEdition(edition),
          );
          assert.deepEqual(
            body,
            readerEdition(edition),
            'HTTP response must omit private editorial fields',
          );
        }
        const hidden = await fetch(`${base}/api/editions/${unpublished.id}`);
        assert.equal(hidden.status, 404);
        assert.equal(hidden.headers.get('cache-control'), 'no-store');
        const latest = await fetch(`${base}/api/editions/latest`);
        assert.equal(latest.status, 200);
        assert.equal(latest.headers.get('cache-control'), 'no-store');
        assert.deepEqual(await latest.json(), readerEdition(editions[1]));
        const history = await fetch(`${base}/api/editions`);
        assert.equal(history.status, 200);
        assert.equal(history.headers.get('cache-control'), 'no-store');
        const index = readerEditionHistorySchema.parse(await history.json());
        assert.equal(
          index.entries.some((entry) => entry.id === unpublished.id),
          false,
        );
        for (const edition of editions)
          assert.ok(index.entries.some((entry) => entry.id === edition.id));
      } finally {
        await app.close();
      }
      if (rejected) {
        assert.equal(
          dispatches,
          6,
          'two refused model attempts per generation',
        );
        assert.equal(
          settlements,
          6,
          'invalid output still settles provider usage',
        );
        assert.equal(
          cache.size,
          0,
          'invalid responses must never enter the cache',
        );
        assert.deepEqual(
          llm.validationDiagnostics(),
          Array.from({ length: 6 }, () => ({
            attempt: 'initial',
            category: 'invalid-selection',
          })),
        );
      } else {
        const expectedCalls = automaticRepair ? 2 : 1;
        assert.equal(dispatches, expectedCalls);
        assert.equal(reservations, expectedCalls);
        assert.equal(settlements, expectedCalls);
        assert.equal(cacheWrites, 1);
        assert.equal(cache.size, 1);
        assert.deepEqual(
          llm.validationDiagnostics(),
          automaticRepair
            ? [{ attempt: 'initial', category: 'invalid-selection' }]
            : [],
        );
      }
    } finally {
      await adapter.db.query(
        'DELETE FROM content_observations WHERE source_id=$1',
        [source],
      );
      await adapter.db.query(
        'DELETE FROM content_items WHERE id=ANY($1::uuid[])',
        [input.candidates.map((candidate) => candidate.id)],
      );
      await adapter.db.query('DELETE FROM topics WHERE id=$1', [topic]);
      await adapter.db.query('DELETE FROM content_sources WHERE id=$1', [
        source,
      ]);
      for (const row of originals)
        await adapter.db.query('UPDATE topics SET enabled=$2 WHERE id=$1', [
          row.id,
          row.enabled,
        ]);
      await adapter.onModuleDestroy();
    }
  });
}
