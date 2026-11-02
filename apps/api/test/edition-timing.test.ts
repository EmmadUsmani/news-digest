import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setTimeout } from 'node:timers/promises';

import { Worker } from 'bullmq';

import { AnthropicLlmAdapter } from '../src/modules/curation/adapters/anthropic';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { SocialPostEditor } from '../src/modules/curation/application/social-editor';
import { CandidateTriage } from '../src/modules/curation/application/triage';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import { BullEditionJobs } from '../src/modules/digests/adapters/edition-jobs';
import { generateOnDemandEdition } from '../src/modules/digests/application/on-demand-edition';
import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';
import type { Candidate } from '../src/modules/digests/domain/rank';

// Full repository publication baseline, NOT a prediction of provider latency.
// Run only via pnpm test/check, which creates and migrates disposable services.
void test('four-topic edition timing includes SQL, batched triage, editing, publication and regeneration', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  assert.equal(process.env.ANTHROPIC_API_KEY, '');
  const repository = new PostgresPreviewRepository();
  const jobs = new BullEditionJobs();
  const connection = jobs.connection.duplicate({ maxRetriesPerRequest: null });
  const worker = new Worker(
    jobs.queue.name,
    (job) =>
      generateOnDemandEdition(repository, job.id!, job.data, (progress) =>
        job.updateProgress(progress),
      ),
    { connection },
  );
  const start = new Date('2025-01-01T00:00:00Z');
  const end = new Date('2025-01-02T00:00:00Z');
  const topicIds: string[] = [];
  const sourceIds: string[] = [];
  const itemIds: string[] = [];
  const postIds: string[] = [];
  const original = (await repository.db.query('SELECT id,enabled FROM topics'))
    .rows;
  try {
    await repository.db.query('UPDATE topics SET enabled=false');
    for (let i = 0; i < 4; i++) {
      const id = crypto.randomUUID();
      const source = `timing-${id}`;
      topicIds.push(id);
      sourceIds.push(source);
      await repository.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,story_budget,post_budget)
         VALUES($1,'00000000-0000-4000-8000-000000000001',$2,'Synthetic timing topic','',$3,5,5)`,
        [id, `Timing ${i}`, i + 100],
      );
      await repository.db.query(
        `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,'Timing publisher','feed',$3)`,
        [source, id, `https://example.org/${id}`],
      );
      await repository.db.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [id, source],
      );
    }
    for (const volume of [400, 1500]) {
      const cache = new Map<string, unknown>();
      let calls = 0;
      let editors = 0;
      let scored = 0;
      let socialScored = 0;
      let socialCalls = 0;
      let socialEdits = 0;
      const ledger: LlmLedger = {
        async cached(key) {
          return cache.get(key);
        },
        async cache(key, value) {
          cache.set(key, value);
        },
        async reserve() {
          return crypto.randomUUID();
        },
        async settle() {},
        async fail() {},
      };
      let active = 0;
      let peak = 0;
      const requests = new Map<string, LlmRequest>();
      const fakeComplete = async (request: LlmRequest) => {
        await setTimeout(25);
        const { candidates, budget } = JSON.parse(request.prompt) as {
          candidates: { id: string }[];
          budget?: number;
        };
        if (request.purpose === 'social-editor-v2') {
          socialEdits++;
          return {
            text: JSON.stringify({
              posts: candidates.slice(0, budget).map(({ id }) => ({
                id,
                whyItMatters: 'A synthetic launch.',
                rationale: 'Fixture selection.',
              })),
            }),
            usage: { input: 20, output: 20, cacheRead: 0, cacheWrite: 0 },
          };
        }
        assert.ok(candidates.length <= 50);
        if (request.purpose.startsWith('social')) {
          socialScored += candidates.length;
          socialCalls++;
        } else {
          scored += candidates.length;
          calls++;
        }
        return {
          text: JSON.stringify({
            items: candidates.map(({ id }) => ({
              id,
              relevance: 9,
              importance: 8,
              event: id,
              rationale: 'Synthetic relevant launch.',
            })),
          }),
          usage: { input: 20, output: 20, cacheRead: 0, cacheWrite: 0 },
        };
      };
      const adapter = new AnthropicLlmAdapter(
        'fixture-only',
        async (_url, init) => {
          assert.equal(typeof init?.body, 'string');
          const body = JSON.parse(init?.body as string) as {
            messages: { content: string }[];
          };
          const request = requests.get(body.messages[0].content);
          assert.ok(
            request,
            'Only registered fixture requests may reach fake HTTP',
          );
          active++;
          peak = Math.max(peak, active);
          try {
            const result = await fakeComplete(request);
            return new Response(
              JSON.stringify({
                id: 'fixture',
                type: 'message',
                role: 'assistant',
                model: request.model.id,
                content: [{ type: 'text', text: result.text }],
                stop_reason: 'end_turn',
                usage: { input_tokens: 20, output_tokens: 20 },
              }),
              { headers: { 'content-type': 'application/json' } },
            );
          } finally {
            active--;
          }
        },
      );
      const llm = new BudgetedLlm(
        {
          complete(request) {
            requests.set(request.prompt, request);
            return adapter.complete(request);
          },
        },
        ledger,
      );
      Object.defineProperty(repository, 'editorial', {
        configurable: true,
        value: {
          triage: new CandidateTriage(llm, ledger, llmConfig({}).haiku),
          socialTriage: new CandidateTriage(
            llm,
            ledger,
            llmConfig({}).haiku,
            'social',
          ),
          socialEditor: new SocialPostEditor(
            llm,
            llmConfig({}).sonnet,
            llmConfig({}).haiku,
          ),
          editor: {
            async edit(
              _topic: unknown,
              candidates: Candidate[],
              budget: number,
            ) {
              editors++;
              await setTimeout(25);
              return {
                model: 'fake-timing-editor',
                brief: [],
                stories: candidates.slice(0, budget).map((c) => ({
                  id: c.id,
                  evidenceIds: [c.id],
                  headline: c.title,
                  summary: c.excerpt,
                  whyItMatters: 'Synthetic timing example.',
                  rationale: 'Fixture selection.',
                })),
              };
            },
          },
        },
      });
      await repository.db.query(
        'DELETE FROM x_link_citations WHERE external_id=ANY($1::text[])',
        [postIds],
      );
      await repository.db.query(
        'DELETE FROM social_posts WHERE external_id=ANY($1::text[])',
        [postIds],
      );
      postIds.length = 0;
      await repository.db.query(
        'DELETE FROM content_observations WHERE item_id=ANY($1::uuid[])',
        [itemIds],
      );
      await repository.db.query(
        'DELETE FROM content_items WHERE id=ANY($1::uuid[])',
        [itemIds],
      );
      itemIds.length = 0;
      for (let topic = 0; topic < 4; topic++) {
        const inserted = await repository.db.query(
          `INSERT INTO content_items(canonical_url,title,excerpt,published_at)
           SELECT 'https://example.org/timing/' || $1 || '/' || n,
           'Synthetic launch number ' || n, 'A synthetic tool became available.',
           $2::timestamptz + n * interval '1 second'
           FROM generate_series(1,$3::int) n RETURNING id`,
          [sourceIds[topic], start, volume / 4],
        );
        const ids = inserted.rows.map((row) => String(row.id));
        itemIds.push(...ids);
        for (let n = 0; n < 60; n++) {
          const postId = `${volume}${topic}${String(n).padStart(14, '0')}`;
          postIds.push(postId);
          const url = `https://x.com/fixture/status/${postId}`;
          await repository.db.query(
            `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,metrics,embed_html)
             VALUES('x',$1,$2,'Fixture','https://x.com/fixture',$3,'{}',$4)`,
            [
              postId,
              url,
              new Date(start.getTime() + n * 1000),
              `<blockquote><p>Synthetic launch ${topic} experiment ${n} makes tool ${n} available.</p></blockquote>`,
            ],
          );
          await repository.db.query(
            `INSERT INTO x_link_citations(external_id,item_id,source_id,canonical_url,citing_engagement)
             VALUES($1,$2,$3,$4,'{}'::jsonb)`,
            [postId, ids[0], sourceIds[topic], url],
          );
        }

        await repository.db.query(
          'INSERT INTO content_observations(item_id,source_id) SELECT unnest($1::uuid[]),$2',
          [ids, sourceIds[topic]],
        );
      }
      const timings: number[] = [];
      const workerTimings: number[] = [];
      for (const pass of ['cold', 'warm']) {
        const before = performance.now();
        const queued = await jobs.enqueue(start, end);
        let status = await jobs.find(queued.id);
        for (
          let attempt = 0;
          attempt < 1000 && status?.state !== 'completed';
          attempt++
        ) {
          assert.notEqual(
            status?.state,
            'failed',
            'Timing job must publish successfully',
          );
          await setTimeout(10);
          status = await jobs.find(queued.id);
        }
        assert.equal(status?.state, 'completed');
        assert.ok(status.editionId);
        assert.ok(status.durationMs! > 0);
        assert.equal(status.progress?.stage, 'publishing');
        workerTimings.push(status.durationMs!);
        const snapshot = await repository.find(status.editionId);
        assert.ok(snapshot);
        timings.push(Math.round(performance.now() - before));
        assert.equal(snapshot.topics.length, 4);
        assert.ok(
          snapshot.topics.every(
            (topic) =>
              topic.editorial?.mode === 'ai' &&
              topic.stories.length === 5 &&
              topic.postEditorial?.mode === 'ai' &&
              topic.posts?.length === 5,
          ),
        );
        assert.deepEqual(await repository.find(snapshot.id), snapshot);
        if (pass === 'cold') {
          assert.equal(scored, Math.min(volume, 800));
          assert.equal(calls, 4 * Math.ceil(Math.min(volume / 4, 200) / 50));
        }
      }
      assert.equal(
        scored,
        Math.min(volume, 800),
        'Warm regeneration reuses every triage score',
      );
      assert.equal(socialScored, 240, 'Warm regeneration reuses social triage');
      assert.equal(socialCalls, 8, 'Sixty posts per topic use two batches');
      assert.equal(socialEdits, 4, 'Warm social selections reuse editor cache');
      assert.equal(editors, 8, 'Both editions edit all four topics');
      assert.equal(active, 0);
      assert.equal(
        peak,
        4,
        'Real adapter saturates but never exceeds four HTTP calls',
      );
      console.log(
        `Fake full-edition baseline: stored=${volume}, triaged=${scored}, triageCalls=${calls}, coldMs=${timings[0]}, warmMs=${timings[1]}, socialTriaged=${socialScored}, socialCalls=${socialCalls}, socialEdits=${socialEdits}; workerColdMs=${workerTimings[0]}, workerWarmMs=${workerTimings[1]}, peakHttp=${peak}; real adapter + BullMQ, 25ms fake HTTP inference; no live latency claim`,
      );
    }
  } finally {
    await worker.close();
    await jobs.queue.drain();
    for (const job of await jobs.queue.getJobs(['completed', 'failed']))
      if (job.name === 'on-demand') await job.remove();
    await connection.quit();
    await jobs.onModuleDestroy();
    await repository.db.query(
      'DELETE FROM x_link_citations WHERE external_id=ANY($1::text[])',
      [postIds],
    );
    await repository.db.query(
      'DELETE FROM social_posts WHERE external_id=ANY($1::text[])',
      [postIds],
    );
    // Published editions are immutable; the disposable container removes them.
    await repository.db.query(
      'DELETE FROM content_observations WHERE item_id=ANY($1::uuid[])',
      [itemIds],
    );
    await repository.db.query(
      'DELETE FROM content_items WHERE id=ANY($1::uuid[])',
      [itemIds],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE topic_id=ANY($1::uuid[])',
      [topicIds],
    );
    await repository.db.query(
      'DELETE FROM content_sources WHERE id=ANY($1::text[])',
      [sourceIds],
    );
    await repository.db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      topicIds,
    ]);
    for (const row of original)
      await repository.db.query('UPDATE topics SET enabled=$2 WHERE id=$1', [
        row.id,
        row.enabled,
      ]);
    await repository.onModuleDestroy();
  }
});
