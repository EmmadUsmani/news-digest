// Explicit budgeted publication check using stored real content and the configured LLM.
import assert from 'node:assert/strict';

import {
  digestPreviewSchema,
  operationsStatusSchema,
  previewHistorySchema,
} from '@digest/contracts';

import { localAdminFetch } from '../../../scripts/lib/local-admin-fetch';
import { database } from '../src/libs/db/connections';
import { qualityRejection } from '../src/modules/digests/domain/quality';
import { assessRelevance } from '../src/modules/digests/domain/relevance';
async function smoke() {
  const endpoint = 'http://127.0.0.1:8000/api/admin/digest-previews';
  const post = (body: unknown) =>
    localAdminFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  const end = new Date(),
    start = new Date(end.getTime() - 86400000);
  const window = {
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
  };
  for (const body of [
    {},
    { ...window, windowStart: window.windowEnd },
    { ...window, windowEnd: 'invalid' },
    {
      ...window,
      windowStart: new Date(end.getTime() - 32 * 86400000).toISOString(),
    },
  ])
    assert.equal((await post(body)).status, 400);
  const firstResponse = await post(window);
  assert.equal(firstResponse.status, 201);
  const first = digestPreviewSchema.parse(await firstResponse.json());
  const callCount = async () =>
    operationsStatusSchema
      .parse(
        await (
          await localAdminFetch('http://127.0.0.1:8000/api/admin/status')
        ).json(),
      )
      .llm.models.reduce((n, model) => n + model.calls, 0);
  const beforeRepeat = await callCount();
  const second = digestPreviewSchema.parse(await (await post(window)).json());
  const fullyEdited = first.topics.every(
    (t) => t.editorial?.mode === 'ai' && t.editorial.unscoredIds.length === 0,
  );
  if (fullyEdited)
    assert.equal(
      await callCount(),
      beforeRepeat,
      'Identical regeneration must make no new LLM calls',
    );
  assert.notEqual(first.id, second.id);
  assert.equal(first.topics.length, 4);
  assert.equal(first.method, 'editorial-v1');
  for (const topic of first.topics) {
    assert.ok(topic.relevancePolicy);
    assert.ok(topic.qualityRejections);
    assert.ok(
      topic.stories.length +
        topic.qualityRejections.length +
        (topic.relevanceRejectedCount ?? 0) <=
        topic.candidateCount,
    );
    for (const rejected of topic.qualityRejections) {
      assert.ok(!topic.stories.some((story) => story.id === rejected.id));
      assert.ok(rejected.rule && rejected.reason);
    }
    assert.ok(Number.isInteger(topic.relevanceRejectedCount));
    for (const story of topic.stories) {
      assert.ok(story.coverage?.length);
      assert.ok(story.coverage.some((article) => article.id === story.id));
      assert.equal(
        new Set(
          topic.stories.flatMap((s) => s.coverage?.map((a) => a.id) ?? []),
        ).size,
        topic.stories.reduce((n, s) => n + (s.coverage?.length ?? 0), 0),
      );
      assert.equal(
        qualityRejection({
          ...story,
          title:
            story.coverage?.find((a) => a.id === story.id)?.title ??
            story.title,
        }),
        null,
      );
      if (topic.editorial?.mode !== 'ai') {
        assert.equal(
          assessRelevance(story, topic.relevancePolicy).eligible,
          true,
        );
        assert.ok(
          story.reasons.includes(
            assessRelevance(story, topic.relevancePolicy).reason,
          ),
        );
      } else {
        assert.ok(story.summary && story.whyItMatters);
        assert.ok(topic.editorial.brief.length >= 1);
        assert.deepEqual(
          topic.editorial.brief,
          topic.stories.slice(0, 4).map((s) => s.title),
        );
      }
    }
  }
  assert.ok(first.topics.flatMap((t) => t.stories).length > 0);
  assert.ok(first.topics.every((t) => t.stories.length <= 5));
  if (fullyEdited) assert.deepEqual(first.topics, second.topics);
  const db = database();
  try {
    const saved = (
      await db.query('SELECT snapshot FROM digest_previews WHERE id=$1', [
        first.id,
      ])
    ).rows[0].snapshot;
    assert.deepEqual(saved, first);
    assert.deepEqual(
      await (await localAdminFetch(`${endpoint}/latest`)).json(),
      second,
    );
    for (const offset of ['-1', '1.5', 'foo', '10000000'])
      assert.equal(
        (await localAdminFetch(`${endpoint}?offset=${offset}`)).status,
        400,
      );
    assert.equal((await localAdminFetch(`${endpoint}/invalid`)).status, 400);
    assert.equal(
      (
        await localAdminFetch(
          `${endpoint}/00000000-0000-4000-8000-000000000099`,
        )
      ).status,
      404,
    );
    const expected = (
      await db.query(
        'SELECT snapshot FROM digest_previews WHERE profile_id=$1 ORDER BY created_at DESC,id DESC',
        ['00000000-0000-4000-8000-000000000001'],
      )
    ).rows.map((row) => digestPreviewSchema.parse(row.snapshot));
    const ids: string[] = [];
    for (let offset = 0; ; offset += 20) {
      const page = previewHistorySchema.parse(
        await (await localAdminFetch(`${endpoint}?offset=${offset}`)).json(),
      );
      assert.deepEqual(
        page.entries.map((entry) => entry.id),
        expected.slice(offset, offset + 20).map((entry) => entry.id),
      );
      for (const entry of page.entries) {
        const detail = digestPreviewSchema.parse(
          await (await localAdminFetch(`${endpoint}/${entry.id}`)).json(),
        );
        assert.deepEqual(
          detail,
          expected.find((snapshot) => snapshot.id === entry.id),
        );
        ids.push(entry.id);
      }
      assert.equal(page.hasMore, expected.length > offset + 20);
      if (!page.hasMore) break;
    }
    assert.equal(new Set(ids).size, expected.length);
    console.log(
      JSON.stringify({
        versions: [first.id, second.id],
        topics: first.topics.map((t) => ({
          name: t.name,
          candidates: t.candidateCount,
          selected: t.stories.length,
          mode: t.editorial?.mode,
          model: t.editorial?.model,
          summaries: t.stories.filter((s) => s.summary).length,
          relevanceRejected: t.relevanceRejectedCount,
          qualityRejected: t.qualityRejections?.length,
        })),
      }),
    );
  } finally {
    await db.end();
  }
}
void smoke();
