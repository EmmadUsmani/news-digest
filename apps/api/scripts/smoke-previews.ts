// Explicit local check using stored real content; no publisher or LLM requests.
import assert from 'node:assert/strict';
import { digestPreviewSchema, previewHistorySchema } from '@digest/contracts';
import { qualityRejection } from '../src/modules/digests/domain/quality';
import { assessRelevance } from '../src/modules/digests/domain/relevance';
import { database } from '../src/libs/db/connections';
async function smoke() {
  const endpoint = 'http://localhost:8000/api/digest-previews';
  const post = (body: unknown) =>
    fetch(endpoint, {
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
  const second = digestPreviewSchema.parse(await (await post(window)).json());
  assert.notEqual(first.id, second.id);
  assert.equal(first.topics.length, 4);
  assert.equal(first.method, 'signals-v6');
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
      assert.equal(qualityRejection(story), null);
      assert.equal(
        assessRelevance(story, topic.relevancePolicy).eligible,
        true,
      );
      assert.ok(
        story.reasons.includes(
          assessRelevance(story, topic.relevancePolicy).reason,
        ),
      );
    }
  }
  assert.ok(first.topics.flatMap((t) => t.stories).length > 0);
  assert.ok(first.topics.every((t) => t.stories.length <= 5));
  assert.deepEqual(first.topics, second.topics);
  const db = database();
  try {
    const saved = (
      await db.query('SELECT snapshot FROM digest_previews WHERE id=$1', [
        first.id,
      ])
    ).rows[0].snapshot;
    assert.deepEqual(saved, first);
    assert.deepEqual(await (await fetch(`${endpoint}/latest`)).json(), second);
    for (const offset of ['-1', '1.5', 'foo', '10000000'])
      assert.equal((await fetch(`${endpoint}?offset=${offset}`)).status, 400);
    assert.equal((await fetch(`${endpoint}/invalid`)).status, 400);
    assert.equal(
      (await fetch(`${endpoint}/00000000-0000-4000-8000-000000000099`)).status,
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
        await (await fetch(`${endpoint}?offset=${offset}`)).json(),
      );
      assert.deepEqual(
        page.entries.map((entry) => entry.id),
        expected.slice(offset, offset + 20).map((entry) => entry.id),
      );
      for (const entry of page.entries) {
        const detail = digestPreviewSchema.parse(
          await (await fetch(`${endpoint}/${entry.id}`)).json(),
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
