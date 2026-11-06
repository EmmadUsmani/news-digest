import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { digestPreviewSchema } from '@digest/contracts';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import { CandidateTriage } from '../src/modules/curation/application/triage';
import type { LlmPort } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';
import type { PreviewRepository } from '../src/modules/digests/domain/preview.repository';
import type { Candidate, rank } from '../src/modules/digests/domain/rank';

const fixture = (name: string) =>
  JSON.parse(
    readFileSync(
      new URL(`fixtures/editions/${name}.json`, import.meta.url),
      'utf8',
    ),
  );

for (const mode of ['non-ai', 'ai'] as const) {
  void test(`${mode} edition matches the golden snapshot through publication and retrieval`, async () => {
    assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
    assert.equal(process.env.ANTHROPIC_API_KEY, '');
    const adapter = new PostgresPreviewRepository();
    const repository: PreviewRepository = adapter;
    const calls: string[] = [];
    if (mode === 'ai') {
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
          return 'synthetic-golden-reservation';
        },
        async settle() {},
        async fail() {
          assert.fail('Golden response must validate');
        },
      };
      const provider: LlmPort = {
        async complete(request) {
          calls.push(request.purpose);
          assert.ok(
            ['candidate-triage-v1', 'shortlist-editor-v12'].includes(
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
      const expected = fixture(`${mode}-golden`);
      const editions = [];
      for (let i = 0; i < 2; i++) {
        const edition = digestPreviewSchema.parse(
          await repository.generate(
            new Date(expected.windowStart),
            new Date(expected.windowEnd),
          ),
        );
        assert.deepEqual(await repository.find(edition.id), edition);
        const { id: _id, createdAt: _createdAt, ...stable } = edition;
        assert.deepEqual(stable, expected);
        editions.push(edition);
      }
      assert.notEqual(editions[0].id, editions[1].id);
      assert.deepEqual(await repository.find(editions[0].id), editions[0]);
      // The second generation must reproduce the snapshot from cached results.
      assert.deepEqual(
        calls,
        mode === 'ai' ? ['candidate-triage-v1', 'shortlist-editor-v12'] : [],
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
