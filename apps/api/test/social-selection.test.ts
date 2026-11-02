import assert from 'node:assert/strict';
import { test } from 'node:test';

import { digestPreviewSchema } from '@digest/contracts';

import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';

void test('editions freeze scoped screened posts, honor budgets and preserve scheduled retries after post refresh', async () => {
  const repository = new PostgresPreviewRepository();
  const social = new PostgresSocialRepository();
  Object.defineProperty(repository, 'editorial', { value: null });
  const topicId = '00000000-0000-4000-8000-000000000011';
  const start = new Date('2026-10-15T00:00:00Z');
  const end = new Date('2026-10-16T00:00:00Z');
  const ids = Array.from({ length: 6 }, (_, i) => `99910000000000000${i}`);
  try {
    await repository.db.query('UPDATE topics SET post_budget=1 WHERE id=$1', [
      topicId,
    ]);
    for (const [i, id] of ids.entries()) {
      await social.store({
        platform: 'x',
        externalId: id,
        url: `https://x.com/i/web/status/${id}`,
        author: 'Synthetic fixture',
        authorUrl: 'https://x.com/fixture',
        publishedAt:
          i === 4
            ? end.toISOString()
            : new Date(start.getTime() + i * 1000).toISOString(),
        metrics: {},
        embedHtml: `<p>${i === 3 ? 'AI crypto promo' : i === 2 ? 'Unrelated text' : i === 1 ? 'AI demo launch<br>https://example.org/demo' : 'AI demo launch'}</p>`,
      });
      if (i !== 5)
        await social.discovered('techmeme', [
          { externalId: id, url: `https://x.com/i/web/status/${id}` },
        ]);
    }
    const key = `social-test:${crypto.randomUUID()}`;
    const first = await repository.generate(start, end, key);
    digestPreviewSchema.parse(first);
    const topic = first.topics.find((t) => t.id === topicId)!;
    assert.deepEqual(
      topic.posts?.map((post) => post.externalId),
      [ids[1]],
    );
    assert.deepEqual(topic.posts?.[0].metrics, {});
    assert.equal(topic.posts?.[0].text, 'AI demo launch');
    assert.equal(
      topic.posts?.[0].displayText,
      'AI demo launch\nhttps://example.org/demo',
    );
    assert.equal(first.topics.find((t) => t.id !== topicId)?.posts?.length, 0);
    await social.db.query(
      'UPDATE social_posts SET embed_html=$2,author=$3 WHERE external_id=$1',
      [ids[1], '<p>AI changed text</p>', 'Changed author'],
    );
    await repository.db.query('UPDATE topics SET post_budget=0 WHERE id=$1', [
      topicId,
    ]);
    assert.deepEqual(await repository.generate(start, end, key), first);
    assert.deepEqual(await repository.find(first.id), first);
    const next = await repository.generate(start, end);
    assert.deepEqual(next.topics.find((t) => t.id === topicId)?.posts, []);
    await repository.db.query('UPDATE topics SET post_budget=5 WHERE id=$1', [
      topicId,
    ]);
    const regenerated = await repository.generate(start, end);
    const posts = regenerated.topics.find((t) => t.id === topicId)!.posts!;
    assert.equal(posts.length, 2); // repeated original text occupies one slot
    assert.equal(posts[0].author, 'Changed author');
    assert.notEqual(regenerated.id, first.id);
  } finally {
    await repository.db.query('UPDATE topics SET post_budget=5 WHERE id=$1', [
      topicId,
    ]);
    await social.db.query(
      'DELETE FROM social_discovery_citations WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await social.db.query(
      'DELETE FROM social_posts WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await social.db.end();
    await repository.onModuleDestroy();
  }
});

void test('direct-search citations enter only their topic editions after verification and screening', async () => {
  const repository = new PostgresPreviewRepository();
  const social = new PostgresSocialRepository();
  Object.defineProperty(repository, 'editorial', { value: null });
  const topicId = '00000000-0000-4000-8000-000000000011';
  const otherTopic = '00000000-0000-4000-8000-000000000012';
  const start = new Date('2026-10-17T00:00:00Z');
  const end = new Date('2026-10-18T00:00:00Z');
  const callId = crypto.randomUUID();
  const ids = Array.from({ length: 7 }, (_, i) => `99920000000000000${i}`);
  try {
    await repository.db.query(
      `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,cost_micros)
       VALUES($1,'synthetic-fixture','social-selection-test','succeeded',1,0)`,
      [callId],
    );
    for (const [i, id] of ids.entries()) {
      // Citation 0 has never passed official verification. Citation 1 is scoped
      // to another topic. The last two are duplicates, including another route.
      await repository.db.query(
        `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url)
         VALUES($1,$2,$3,$4)`,
        [
          callId,
          i === 1 ? otherTopic : topicId,
          id,
          `https://x.com/fixture/status/${id}`,
        ],
      );
      if (i === 0) continue;
      await social.store({
        platform: 'x',
        externalId: id,
        url: `https://x.com/fixture/status/${id}`,
        author: 'Synthetic fixture',
        authorUrl: 'https://x.com/fixture',
        publishedAt:
          i === 2
            ? end.toISOString()
            : new Date(start.getTime() + i * 1000).toISOString(),
        metrics: {},
        embedHtml: `<p>${i === 3 ? 'AI crypto promo' : i === 4 ? 'Unrelated text' : 'AI demo launch'}</p>`,
      });
    }
    const key = `direct-social-test:${crypto.randomUUID()}`;
    const first = await repository.generate(start, end, key);
    digestPreviewSchema.parse(first);
    const selected = first.topics.find((t) => t.id === topicId)!.posts!;
    assert.deepEqual(
      selected.map((post) => post.externalId),
      [ids[6]],
    );
    assert.equal(selected[0].text, 'AI demo launch');
    assert.deepEqual(selected[0].metrics, {});
    await social.discovered('techmeme', [
      { externalId: ids[6], url: `https://x.com/fixture/status/${ids[6]}` },
    ]);
    const multiRoute = await repository.generate(start, end);
    assert.deepEqual(
      multiRoute.topics.find((t) => t.id === topicId)!.posts,
      selected,
    );
    // Removing discovery scope affects a new edition, never an existing snapshot.
    await repository.db.query(
      'DELETE FROM x_search_citations WHERE call_id=$1',
      [callId],
    );
    await repository.db.query(
      'DELETE FROM social_discovery_citations WHERE external_id=ANY($1::text[])',
      [ids],
    );
    assert.deepEqual(await repository.generate(start, end, key), first);
    assert.deepEqual(await repository.find(first.id), first);
    const next = await repository.generate(start, end);
    assert.deepEqual(next.topics.find((t) => t.id === topicId)!.posts, []);
  } finally {
    await repository.db.query(
      'DELETE FROM x_search_citations WHERE call_id=$1',
      [callId],
    );
    await repository.db.query('DELETE FROM x_discovery_calls WHERE id=$1', [
      callId,
    ]);
    await repository.db.query(
      'DELETE FROM social_discovery_citations WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await repository.db.query(
      'DELETE FROM social_posts WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await social.db.end();
    await repository.onModuleDestroy();
  }
});

void test('semantic publication recovers empty positive rules and freezes post context and scores', async () => {
  const repository = new PostgresPreviewRepository();
  const social = new PostgresSocialRepository();
  const topicId = '00000000-0000-4000-8000-000000000011';
  const id = '999300000000000001';
  const start = new Date('2026-10-19T00:00:00Z');
  const end = new Date('2026-10-20T00:00:00Z');
  let calls = 0;
  Object.defineProperty(repository, 'editorial', {
    value: {
      triage: {
        async score() {
          return { scores: [], unscoredIds: [] };
        },
      },
      editor: {
        async edit() {
          return null;
        },
      },
      socialTriage: {
        async score(_topic: unknown, candidates: { id: string }[]) {
          calls++;
          return {
            scores: candidates.map((c) => ({
              id: c.id,
              relevance: 9,
              importance: 8,
              event: 'Synthetic launch',
              rationale: 'Synthetic triage',
            })),
            unscoredIds: [],
          };
        },
      },
      socialEditor: {
        async edit(_topic: unknown, candidates: { id: string }[]) {
          return {
            model: 'fake-editor',
            posts: candidates.map((c) => ({
              id: c.id,
              whyItMatters: 'Synthetic context',
              rationale: 'Synthetic selection',
            })),
          };
        },
      },
    },
  });
  const original = (
    await repository.db.query(
      'SELECT story_budget,relevance_policy FROM topics WHERE id=$1',
      [topicId],
    )
  ).rows[0];
  try {
    await repository.db.query(
      'UPDATE topics SET story_budget=0,relevance_policy=$2 WHERE id=$1',
      [topicId, { includeAny: [], excludeAny: [] }],
    );
    await social.store({
      platform: 'x',
      externalId: id,
      url: `https://x.com/fixture/status/${id}`,
      author: 'Synthetic',
      authorUrl: 'https://x.com/fixture',
      publishedAt: start.toISOString(),
      metrics: {},
      embedHtml: '<p>Synthetic event without topic keywords.</p>',
    });
    await social.discovered('techmeme', [
      { externalId: id, url: `https://x.com/fixture/status/${id}` },
    ]);
    const key = `semantic-social:${crypto.randomUUID()}`;
    const first = await repository.generate(start, end, key);
    digestPreviewSchema.parse(first);
    const selected = first.topics.find((t) => t.id === topicId)!;
    assert.equal(selected.posts?.[0].externalId, id);
    assert.equal(selected.posts?.[0].whyItMatters, 'Synthetic context');
    assert.equal(selected.postEditorial?.model, 'fake-editor');
    assert.equal(selected.postEditorial?.triage[0].importance, 8);
    assert.equal(selected.postSelectionMethod, 'verified-semantic-editor-v2');
    await social.db.query(
      'DELETE FROM social_discovery_citations WHERE external_id=$1',
      [id],
    );
    const before = calls;
    assert.deepEqual(await repository.generate(start, end, key), first);
    assert.equal(calls, before);
    assert.deepEqual(await repository.find(first.id), first);
  } finally {
    await repository.db.query(
      'UPDATE topics SET story_budget=$2,relevance_policy=$3 WHERE id=$1',
      [topicId, original.story_budget, original.relevance_policy],
    );
    await social.db.query(
      'DELETE FROM social_discovery_citations WHERE external_id=$1',
      [id],
    );
    await social.db.query('DELETE FROM social_posts WHERE external_id=$1', [
      id,
    ]);
    await social.db.end();
    await repository.onModuleDestroy();
  }
});

void test('new editions preserve distinct claims and clip links while removing copied long reposts', async () => {
  const repository = new PostgresPreviewRepository();
  const social = new PostgresSocialRepository();
  Object.defineProperty(repository, 'editorial', { value: null });
  const topicId = '00000000-0000-4000-8000-000000000011';
  const start = new Date('2026-10-21T00:00:00Z');
  const end = new Date('2026-10-22T00:00:00Z');
  const caption =
    'Our new AI tool launches today with a public demo available to all builders worldwide.';
  const texts = [
    caption,
    `RT @studio: ${caption}`,
    'AI revenue +5%',
    'AI revenue -5%',
    'AI demo <a href="https://t.co/one">clip</a>',
    'AI demo <a href="https://t.co/two">clip</a>',
  ];
  const ids = texts.map((_, i) => `99940000000000000${i}`);
  try {
    await repository.db.query('UPDATE topics SET post_budget=10 WHERE id=$1', [
      topicId,
    ]);
    for (const [i, text] of texts.entries()) {
      await social.store({
        platform: 'x',
        externalId: ids[i],
        url: `https://x.com/fixture/status/${ids[i]}`,
        author: 'Synthetic fixture',
        authorUrl: 'https://x.com/fixture',
        publishedAt: new Date(start.getTime() + i * 1000).toISOString(),
        metrics: {},
        embedHtml: `<p>${text}</p>`,
      });
      await social.discovered('techmeme', [
        { externalId: ids[i], url: `https://x.com/fixture/status/${ids[i]}` },
      ]);
    }
    const retryKey = `duplicate-social:${crypto.randomUUID()}`;
    const first = await repository.generate(start, end, retryKey);
    digestPreviewSchema.parse(first);
    const topic = first.topics.find((t) => t.id === topicId)!;
    assert.equal(topic.postSelectionMethod, 'verified-lexical-recency-v2');
    assert.deepEqual(
      topic.posts?.map((p) => p.externalId),
      [ids[5], ids[4], ids[3], ids[2], ids[1]],
    );
    await social.db.query(
      'UPDATE social_posts SET embed_html=$2 WHERE external_id=$1',
      [ids[0], '<p>AI different announcement</p>'],
    );
    assert.deepEqual(await repository.generate(start, end, retryKey), first);
    assert.deepEqual(await repository.find(first.id), first);
    const next = await repository.generate(start, end);
    assert.equal(next.topics.find((t) => t.id === topicId)?.posts?.length, 6);
  } finally {
    await repository.db.query('UPDATE topics SET post_budget=5 WHERE id=$1', [
      topicId,
    ]);
    await social.db.query(
      'DELETE FROM social_discovery_citations WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await social.db.query(
      'DELETE FROM social_posts WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await social.db.end();
    await repository.onModuleDestroy();
  }
});
