import 'reflect-metadata';

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import {
  digestPreviewSchema,
  editionCostSchema,
  previewHistorySchema,
  profileSettingsSchema,
  readerEditionHistorySchema,
  readerEditionSchema,
  sourceCatalogSchema,
  topicSchema,
} from '@digest/contracts';
import { NestFactory } from '@nestjs/core';
import { Worker } from 'bullmq';

import { adminAccess } from '../src/admin-access';

// Use tsc output: Nest requires emitted constructor metadata, which tsx omits.
const require = createRequire(import.meta.url);
const { AppModule } = require('../dist/app.js') as typeof import('../src/app');

void test('real HTTP health, topic lifecycle and settings preserve persisted contracts', async (t) => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const app = await NestFactory.create(AppModule, { logger: false });
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const request = async (
    path: string,
    status = 200,
    method = 'GET',
    body?: unknown,
  ) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data: unknown = await response.json();
    assert.equal(
      response.status,
      status,
      `${method} ${path}: ${JSON.stringify(data)}`,
    );
    return data;
  };
  const topicsPath = '/api/admin/topics';
  let createdId: string | undefined;
  const original = topicSchema.array().parse(await request(topicsPath));
  const profile = profileSettingsSchema.parse(
    await request('/api/admin/profile'),
  );
  try {
    await request('/healthz').then((data) =>
      assert.deepEqual(data, {
        status: 'ok',
        database: true,
        redis: true,
      }),
    );
    await request(topicsPath, 400, 'POST', { name: '' });
    const input = {
      name: 'HTTP fixture topic',
      description: 'Offline HTTP characterization',
      includeGuidance: 'Demos',
      excludeGuidance: 'Promotions',
      enabled: false,
      storyBudget: 3,
      postBudget: 2,
      relevancePolicy: { includeAny: ['science'], excludeAny: ['spam'] },
      accounts: ['NASA'],
      redditCommunities: ['science'],
    };
    const created = topicSchema.parse(
      await request(topicsPath, 201, 'POST', input),
    );
    createdId = created.id;
    assert.equal(created.position, original.length);
    assert.deepEqual(created.accounts, input.accounts);
    assert.equal(created.blueskyQuery, '');
    assert.equal(created.xDiscovery, null);
    const xDiscovery = {
      minimumLikes: 250,
      exclusions: ['-crypto', '-betting'],
    };
    const xSaved = topicSchema.parse(
      await request(`${topicsPath}/${created.id}`, 200, 'PUT', {
        ...input,
        xDiscovery,
      }),
    );
    assert.deepEqual(xSaved.xDiscovery, xDiscovery);
    const xRead = topicSchema
      .array()
      .parse(await request(topicsPath))
      .find((topic) => topic.id === created.id);
    assert.deepEqual(xRead?.xDiscovery, xDiscovery);
    for (const invalid of [
      { minimumLikes: -1, exclusions: [] },
      { minimumLikes: 1.5, exclusions: [] },
      { minimumLikes: 2147483648, exclusions: [] },
      { minimumLikes: 250, exclusions: ['crypto OR betting'] },
    ])
      await request(`${topicsPath}/${created.id}`, 400, 'PUT', {
        ...input,
        xDiscovery: invalid,
      });

    const blueskySaved = topicSchema.parse(
      await request(`${topicsPath}/${created.id}`, 200, 'PUT', {
        ...input,
        blueskyQuery: '  science discoveries  ',
      }),
    );
    assert.equal(blueskySaved.blueskyQuery, 'science discoveries');
    assert.deepEqual(blueskySaved.xDiscovery, xDiscovery);
    await request(`${topicsPath}/${created.id}`, 400, 'PUT', {
      ...input,
      blueskyQuery: 'x'.repeat(501),
    });
    assert.deepEqual(created.redditCommunities, input.redditCommunities);
    assert.deepEqual(created.relevancePolicy, input.relevancePolicy);
    const updated = topicSchema.parse(
      await request(`${topicsPath}/${created.id}`, 200, 'PUT', {
        ...input,
        name: 'Updated HTTP topic',
        accounts: [],
        redditCommunities: [],
      }),
    );
    assert.equal(updated.name, 'Updated HTTP topic');
    assert.deepEqual(updated.accounts, []);
    assert.deepEqual(updated.redditCommunities, []);
    assert.deepEqual(
      topicSchema
        .array()
        .parse(await request(topicsPath))
        .at(-1),
      updated,
    );
    const catalog = sourceCatalogSchema.parse(
      await request(`${topicsPath}/sources`),
    );
    assert.ok(catalog.length > 0);
    const sourceId = catalog[0].id;
    const connected = topicSchema.parse(
      await request(`${topicsPath}/${created.id}/sources`, 200, 'PUT', {
        ids: [sourceId],
      }),
    );
    assert.deepEqual(connected.sources, [sourceId]);
    await request(`${topicsPath}/${created.id}/sources`, 400, 'PUT', {
      ids: [sourceId, sourceId],
    });
    await request(`${topicsPath}/${created.id}/sources`, 200, 'PUT', {
      ids: [],
    });
    const order = [created.id, ...original.map((topic) => topic.id)];
    const reordered = topicSchema
      .array()
      .parse(await request(`${topicsPath}/order`, 200, 'PUT', { ids: order }));
    assert.deepEqual(
      reordered.map((topic) => topic.id),
      order,
    );
    assert.deepEqual(
      reordered.map((topic) => topic.position),
      order.map((_, index) => index),
    );
    await request(`${topicsPath}/order`, 400, 'PUT', { ids: order.slice(1) });
    await request(`${topicsPath}/${created.id}/sources`, 400, 'PUT', {
      ids: ['unknown-http-source'],
    });
    assert.deepEqual(
      await request(topicsPath),
      reordered,
      'Rejected writes preserve topic state',
    );
    await request(`${topicsPath}/not-a-uuid`, 400, 'DELETE');
    const missing = '00000000-0000-4000-8000-999999999999';
    await request(`${topicsPath}/${missing}`, 404, 'PUT', input);
    await request(`${topicsPath}/${missing}`, 404, 'DELETE');
    const schedule = {
      ...profile.schedule,
      cadence: '0 8 * * *',
      timezone: 'Asia/Kolkata',
      coverageWindow: 'PT12H',
      storyBudget: 4,
      postBudget: 1,
    };
    const saved = profileSettingsSchema.parse(
      await request('/api/admin/profile/schedule', 200, 'PUT', schedule),
    );
    assert.deepEqual(saved, { ...profile, schedule });
    assert.deepEqual(await request('/api/admin/profile'), saved);
    for (const invalid of [
      { ...schedule, timezone: 'Invalid/Timezone' },
      { ...schedule, coverageWindow: 'P32D' },
      { ...schedule, postBudget: -1 },
    ]) {
      await request('/api/admin/profile/schedule', 400, 'PUT', invalid);
      assert.deepEqual(await request('/api/admin/profile'), saved);
    }
    const remaining = await request(
      `${topicsPath}/${created.id}`,
      200,
      'DELETE',
    );
    createdId = undefined;
    assert.deepEqual(
      remaining,
      original,
      'Deletion closes positions and preserves original topics',
    );
  } finally {
    if (createdId) await request(`${topicsPath}/${createdId}`, 200, 'DELETE');
    await request('/api/admin/profile/schedule', 200, 'PUT', profile.schedule);
  }
});

void test('digest HTTP publication, history and async jobs use real isolated persistence', async (t) => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  assert.equal(process.env.ANTHROPIC_API_KEY, '');
  const { EditionJobs } =
    require('../dist/modules/digests/domain/edition-jobs.js') as typeof import('../src/modules/digests/domain/edition-jobs');
  const { PreviewRepository } =
    require('../dist/modules/digests/domain/preview.repository.js') as typeof import('../src/modules/digests/domain/preview.repository');
  const { generateOnDemandEdition } =
    require('../dist/modules/digests/application/on-demand-edition.js') as typeof import('../src/modules/digests/application/on-demand-edition');
  const app = await NestFactory.create(AppModule, { logger: false });
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const base = `${await app.getUrl()}/api/admin/digest-previews`;
  const request = async (path: string, status = 200, body?: unknown) => {
    const response = await fetch(`${base}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data: unknown = await response.json();
    assert.equal(response.status, status, JSON.stringify(data));
    return data;
  };
  // A historical empty window fixes content independently of other fixture tests.
  const window = {
    windowStart: '2000-01-01T00:00:00.000Z',
    windowEnd: '2000-01-02T00:00:00.000Z',
  };
  const before = await request('');
  for (const path of ['', '/jobs', '/tests']) {
    for (const invalid of [
      {},
      { ...window, windowStart: 'invalid' },
      { windowStart: window.windowEnd, windowEnd: window.windowStart },
      { ...window, windowEnd: '2000-03-01T00:00:00Z' },
      { ...window, windowEnd: '2099-01-01T00:00:00Z' },
    ])
      await request(path, 400, invalid);
  }
  for (const offset of ['-1', '1.5', '10000000', 'abc'])
    await request(`?offset=${offset}`, 400);
  await request('/not-a-uuid', 400);
  await request('/not-a-uuid/cost', 400);
  await request('/00000000-0000-4000-8000-999999999999/cost', 404);
  await request('/00000000-0000-4000-8000-999999999999', 404);
  await request('/jobs/invalid', 404);
  await request('/jobs/999999999999', 404);
  assert.deepEqual(
    await request(''),
    before,
    'Rejected requests never publish',
  );
  const published = digestPreviewSchema.parse(await request('', 201, window));
  assert.deepEqual(
    editionCostSchema.parse(await request(`/${published.id}/cost`)),
    {
      calls: 0,
      costMicros: 0,
      reservedMicros: 0,
      byModelAndPurpose: [],
    },
  );
  assert.equal(published.windowStart, window.windowStart);
  assert.equal(published.windowEnd, window.windowEnd);
  assert.ok(published.topics.length > 0);
  assert.ok(published.topics.every((topic) => topic.stories.length === 0));
  assert.deepEqual(await request(`/${published.id}`), published);
  assert.deepEqual(await request('/latest'), published);
  const readerBase = `${await app.getUrl()}/api/editions`;
  for (const offset of ['', '?offset=1', '?offset=9999999']) {
    const response = await fetch(`${readerBase}${offset}`);
    assert.equal(response.status, 200);
    const raw = await response.json();
    assert.deepEqual(raw, readerEditionHistorySchema.parse(raw));
    const expected = previewHistorySchema.parse(await request(offset));
    assert.deepEqual(raw, {
      entries: expected.entries.map(
        ({ method: _method, topicModes, ...entry }) => ({
          ...entry,
          topics: (topicModes ?? []).map(({ id, name }) => ({ id, name })),
        }),
      ),
      hasMore: expected.hasMore,
    });
  }
  for (const offset of ['-1', '1.5', '10000000', 'abc', '01'])
    assert.equal((await fetch(`${readerBase}?offset=${offset}`)).status, 400);
  for (const path of ['/latest', `/${published.id}`]) {
    const response = await fetch(`${readerBase}${path}`);
    assert.equal(response.status, 200);
    const raw = await response.json();
    const reader = readerEditionSchema.parse(raw);
    assert.deepEqual(
      raw,
      reader,
      'Reader HTTP response has only allowed fields',
    );
    assert.equal(reader.id, published.id);
    assert.equal(reader.topics.length, published.topics.length);
    assert.ok(reader.topics.every((topic) => topic.brief.length === 0));
    assert.ok(!('method' in raw));
    assert.ok(
      raw.topics.every((topic: object) => !('candidateCount' in topic)),
    );
  }
  assert.equal((await fetch(`${readerBase}/not-a-uuid`)).status, 400);
  assert.equal(
    (await fetch(`${readerBase}/00000000-0000-4000-8000-ffffffffffff`)).status,
    404,
  );

  const jobs =
    app.get<
      import('../src/modules/digests/adapters/edition-jobs').BullEditionJobs
    >(EditionJobs);
  const repository = app.get(PreviewRepository);
  // Enqueue before starting a worker so duplicate requests deterministically overlap.
  const first = (await request('/jobs', 202, window)) as { id: string };
  const duplicate = (await request('/jobs', 202, window)) as { id: string };
  assert.equal(first.id, duplicate.id);
  const connection = jobs.connection.duplicate({ maxRetriesPerRequest: null });
  const worker = new Worker(
    jobs.queue.name,
    (job) =>
      generateOnDemandEdition(repository, job.id!, job.data, (progress) =>
        job.updateProgress(progress),
      ),
    { connection },
  );
  try {
    let completed:
      | import('../src/modules/digests/domain/edition-jobs').EditionJobStatus
      | undefined;
    for (let attempt = 0; attempt < 300; attempt++) {
      const status = (await request(
        `/jobs/${first.id}`,
      )) as import('../src/modules/digests/domain/edition-jobs').EditionJobStatus;
      if (status.state === 'failed') assert.fail(status.error ?? 'Job failed');
      if (status.state === 'completed') {
        completed = status;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    assert.ok(completed?.editionId, 'Job completes within bounded polling');
    assert.equal(completed.error, null);
    assert.ok(completed.durationMs! >= 0);
    const edition = digestPreviewSchema.parse(
      await request(`/${completed.editionId}`),
    );
    // Model retention pruning after publication: the HTTP job link must still
    // lead to the same immutable edition without another generation.
    await worker.close();
    const retained = await jobs.queue.getJob(first.id);
    assert.ok(retained);
    await retained.remove();
    assert.deepEqual(await request(`/jobs/${first.id}`), {
      id: first.id,
      state: 'completed',
      editionId: edition.id,
      progress: null,
      durationMs: null,
      error: null,
    });
    await request('/jobs/99999999999999999999', 404);
    assert.equal(
      (await repository.findByGenerationKey(`on-demand:${first.id}`)) !== null,
      true,
    );
    assert.equal(
      await repository.findByGenerationKey(`scheduled:${first.id}`),
      null,
    );
    assert.notEqual(edition.id, published.id);
    assert.deepEqual(edition.topics, published.topics);
    assert.deepEqual(await request('/latest'), edition);
    const history = previewHistorySchema.parse(await request(''));
    assert.deepEqual(
      history.entries.slice(0, 2).map((entry) => entry.id),
      [edition.id, published.id],
    );
    const next = previewHistorySchema.parse(await request('?offset=1'));
    assert.equal(next.entries[0].id, published.id);
    assert.deepEqual(
      await request(`/${published.id}`),
      published,
      'Later publication preserves earlier snapshot',
    );
    // Redis counters may restart independently of the saved publication keys.
    await jobs.connection.set(jobs.queue.toKey('id'), '0');
    const afterReset = (await request('/jobs', 202, window)) as { id: string };
    assert.notEqual(afterReset.id, first.id);
    assert.equal(
      ((await request(`/jobs/${first.id}`)) as { editionId: string }).editionId,
      edition.id,
    );
    await (await jobs.queue.getJob(afterReset.id))!.remove();
    const { EditionJobFailures } =
      require('../dist/modules/digests/domain/edition-job-failures.js') as typeof import('../src/modules/digests/domain/edition-job-failures');
    const failures = app.get(EditionJobFailures);
    const failureWorker = new Worker(
      jobs.queue.name,
      (job) =>
        generateOnDemandEdition(
          {
            generate: () =>
              Promise.reject(
                new Error('private-provider-response secret=never-expose'),
              ),
          },
          job.id!,
          job.data,
          undefined,
          failures,
        ),
      { connection },
    );
    try {
      const failedJob = (await request('/jobs', 202, window)) as { id: string };
      let failed = false;
      for (let attempt = 0; attempt < 300; attempt++) {
        const status = (await request(`/jobs/${failedJob.id}`)) as {
          state: string;
        };
        if (status.state === 'failed') {
          failed = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      assert.ok(failed, 'Fixture generation fails within bounded polling');
      await failureWorker.close();
      await (await jobs.queue.getJob(failedJob.id))!.remove();
      const recovered = (await request(
        `/jobs/${failedJob.id}`,
      )) as import('../src/modules/digests/domain/edition-jobs').EditionJobStatus;
      assert.equal(recovered.state, 'failed');
      assert.equal(recovered.editionId, null);
      assert.equal(recovered.progress, null);
      assert.ok(recovered.durationMs! >= 0);
      assert.equal(
        recovered.error,
        'Edition generation failed. Try again later.',
      );
      assert.ok(!JSON.stringify(recovered).includes('private-provider'));
      assert.equal(
        await repository.findByGenerationKey(`on-demand:${failedJob.id}`),
        null,
      );
    } finally {
      await failureWorker.close();
    }
  } finally {
    await worker.close();
    await connection.quit();
  }
});

void test('admin routes use real controllers and deny unauthenticated reads and writes', async (t) => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const app = await NestFactory.create(AppModule, { logger: false });
  app.use(adminAccess({ localToken: 'isolated-admin-token' }));
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const headers = {
    ADMIN_LOCAL_TOKEN: 'isolated-admin-token',
    'content-type': 'application/json',
  };
  for (const path of [
    'topics',
    'topics/sources',
    'profile',
    'content',
    'content/sources',
    'digest-previews',
    'digest-previews/latest',
    'status',
  ]) {
    const denied = await fetch(`${base}/api/admin/${path}`);
    assert.equal(denied.status, 404, path);
    assert.equal(await denied.text(), '');
    const authorized = await fetch(`${base}/api/admin/${path}`, { headers });
    for (const legacyHeaders of [{}, headers]) {
      const legacy = await fetch(`${base}/api/${path}`, {
        headers: legacyHeaders,
      });
      assert.equal(legacy.status, 404, `Removed legacy route: ${path}`);
    }
    assert.equal(authorized.status, 200, path);
    assert.equal(authorized.headers.get('cache-control'), 'no-store', path);
    assert.match(authorized.headers.get('vary') ?? '', /X-ExeDev-Email/i, path);
    assert.match(
      authorized.headers.get('vary') ?? '',
      /ADMIN_LOCAL_TOKEN/i,
      path,
    );
    await authorized.json();
  }
  const catalogForToggle = await (
    await fetch(`${base}/api/admin/topics/sources`, { headers })
  ).json();
  const toggleUrl = `${base}/api/admin/topics/sources/${encodeURIComponent(catalogForToggle[0].id)}/enabled`;
  assert.equal(
    (
      await fetch(toggleUrl, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: '{"enabled":false}',
      })
    ).status,
    404,
  );
  for (const body of [
    { enabled: 'false' },
    { enabled: false, extra: true },
    {},
  ])
    assert.equal(
      (
        await fetch(toggleUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        })
      ).status,
      400,
    );
  for (const enabled of [false, true]) {
    const response = await fetch(toggleUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ enabled }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      id: catalogForToggle[0].id,
      enabled,
    });
  }
  assert.equal(
    (
      await fetch(`${base}/api/admin/topics/sources/missing/enabled`, {
        method: 'PUT',
        headers,
        body: '{"enabled":true}',
      })
    ).status,
    404,
  );
  const latestResponse = await fetch(
    `${base}/api/admin/digest-previews/latest`,
    { headers },
  );
  const latest = digestPreviewSchema.parse(await latestResponse.json());
  const costUrl = `${base}/api/admin/digest-previews/${latest.id}/cost`;
  assert.equal((await fetch(costUrl)).status, 404);
  const costResponse = await fetch(costUrl, { headers });
  assert.equal(costResponse.status, 200);
  editionCostSchema.parse(await costResponse.json());
  const input = {
    name: 'Admin alias fixture',
    description: 'Isolated admin write',
    includeGuidance: '',
    excludeGuidance: '',
    relevancePolicy: { includeAny: [], excludeAny: [] },
    enabled: false,
    storyBudget: 2,
    postBudget: 1,
  };
  const url = `${base}/api/admin/topics`;
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const denied = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    assert.equal(denied.status, 404);
    assert.equal(await denied.text(), '');
  }
  const createdResponse = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  assert.equal(createdResponse.status, 201);
  assert.equal(createdResponse.headers.get('cache-control'), 'no-store');
  const created = topicSchema.parse(await createdResponse.json());
  try {
    const updated = await fetch(`${url}/${created.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...input, name: 'Updated admin fixture' }),
    });
    assert.equal(updated.status, 200);
    assert.equal(
      topicSchema.parse(await updated.json()).name,
      'Updated admin fixture',
    );
    const denied = await fetch(`${url}/${created.id}`, { method: 'DELETE' });
    assert.equal(denied.status, 404);
  } finally {
    const deleted = await fetch(`${url}/${created.id}`, {
      method: 'DELETE',
      headers,
    });
    assert.equal(deleted.status, 200);
  }
  const reader = await fetch(`${base}/api/editions`);
  assert.equal(reader.status, 200);
  readerEditionHistorySchema.parse(await reader.json());
});

void test('free admin test editions stay private and bypass production editorial services', async (t) => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const previousReaderFilter = process.env.READER_PUBLISHED_ONLY;
  process.env.READER_PUBLISHED_ONLY = '1';
  t.after(() => {
    if (previousReaderFilter === undefined)
      delete process.env.READER_PUBLISHED_ONLY;
    else process.env.READER_PUBLISHED_ONLY = previousReaderFilter;
  });
  const { PreviewRepository } =
    require('../dist/modules/digests/domain/preview.repository.js') as typeof import('../src/modules/digests/domain/preview.repository');
  const { database } = await import('../src/libs/db/connections');
  const db = database();
  const topicId = crypto.randomUUID(),
    sourceId = crypto.randomUUID(),
    itemId = crypto.randomUUID();
  t.after(async () => {
    try {
      await db.query('DELETE FROM content_observations WHERE item_id=$1', [
        itemId,
      ]);
      await db.query('DELETE FROM content_items WHERE id=$1', [itemId]);
      await db.query(
        'DELETE FROM topic_source_connections WHERE source_id=$1',
        [sourceId],
      );
      await db.query('DELETE FROM content_sources WHERE id=$1', [sourceId]);
      await db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    } finally {
      await db.end();
    }
  });
  await db.query(
    `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,story_budget,post_budget)
    VALUES($1,'00000000-0000-4000-8000-000000000001','Free test science','Synthetic fixture','',999,2,0)`,
    [topicId],
  );
  await db.query(
    `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,'Offline science','feed','https://example.org/free-test/feed')`,
    [sourceId, topicId],
  );
  await db.query(
    'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
    [topicId, sourceId],
  );
  await db.query(
    `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at,engagement)
    VALUES($1,'https://example.org/free-test/science','Scientists discover a new planet','A synthetic offline discovery report.','2000-01-01T12:00:00Z','{}')`,
    [itemId],
  );
  await db.query(
    'INSERT INTO content_observations(source_id,item_id) VALUES($1,$2)',
    [sourceId, itemId],
  );
  const app = await NestFactory.create(AppModule, { logger: false });
  t.after(() => app.close());
  const repository = app.get(PreviewRepository);
  // Installed services must never receive a call, even with credentials set.
  const forbidden = () => {
    throw new Error('Production editorial called');
  };
  Object.defineProperty(repository, 'editorial', {
    value: {
      triage: { score: forbidden },
      editor: { edit: forbidden },
      socialTriage: { score: forbidden },
      socialEditor: { edit: forbidden, editOutcome: forbidden },
      grouping: { group: forbidden },
    },
  });
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const window = {
    windowStart: '2000-01-01T00:00:00Z',
    windowEnd: '2000-01-02T00:00:00Z',
  };
  const post = (body: unknown) =>
    fetch(`${base}/api/admin/digest-previews/tests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  const accounting = async () =>
    (
      await db.query(`select
    (select count(*) from llm_calls)::text as llm,
    (select count(*) from x_discovery_calls)::text as x,
    (select count(*) from development_spend_reservations)::text as development`)
    ).rows;
  const before = await accounting();
  for (const options of [
    { aiEditing: true },
    { paidXSearch: true },
    { aiEditing: 'false' },
    { paidXSearch: null },
    { kind: 'scheduled' },
  ])
    assert.equal((await post({ ...window, ...options })).status, 400);
  for (const options of [{}, { aiEditing: false, paidXSearch: false }]) {
    const response = await post({ ...window, ...options });
    assert.equal(
      response.status,
      201,
      response.status === 201 ? undefined : await response.text(),
    );
    const snapshot = digestPreviewSchema.parse(await response.json());
    assert.equal(
      snapshot.topics.find((topic) => topic.id === topicId)?.stories[0]?.id,
      itemId,
      'Stored fixture content reaches the test snapshot',
    );
    assert.ok(
      snapshot.topics.every((topic) => topic.editorial?.mode === 'non-ai'),
    );
    const row = (
      await db.query(
        'select kind, published_at, scheduled_key from digest_previews where id=$1',
        [snapshot.id],
      )
    ).rows[0];
    assert.deepEqual(row, {
      kind: 'test',
      published_at: null,
      scheduled_key: null,
    });
    assert.equal(
      (await fetch(`${base}/api/editions/${snapshot.id}`)).status,
      404,
    );
    assert.equal(
      (await fetch(`${base}/api/admin/digest-previews/${snapshot.id}`)).status,
      200,
    );
  }
  // Real snapshot persistence with isolated editors; no production services,
  // provider calls or ledger writes. Empty triage intentionally uses fallback.
  const { developmentEditorialServices } =
    require('../dist/modules/curation/public/development-editorial.js') as typeof import('../src/modules/curation/public/development-editorial');
  const adapter =
    repository as import('../src/modules/digests/database/preview.repository').PostgresPreviewRepository;
  let factoryId = '';
  const attempts: string[] = [];
  const edited = await adapter.generateTest(
    new Date(window.windowStart),
    new Date(window.windowEnd),
    (id) => {
      factoryId = id;
      return developmentEditorialServices(
        {
          complete: async (_request, attempt) => {
            attempts.push(attempt);
            return {
              status: 'complete',
              mustReport: false,
              value: {
                text: '{"items":[]}',
                usage: { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 },
              },
            };
          },
        },
        id,
      );
    },
  );
  assert.equal(edited.id, factoryId);
  assert.ok(attempts.length > 0, 'Isolated editorial runtime is called');
  assert.ok(attempts.every((id) => id.includes(factoryId)));
  assert.equal(
    edited.topics.find((topic) => topic.id === topicId)?.stories[0]?.id,
    itemId,
  );
  assert.equal((await fetch(`${base}/api/editions/${edited.id}`)).status, 404);
  assert.deepEqual(
    (
      await db.query(
        'select kind, published_at from digest_previews where id=$1',
        [edited.id],
      )
    ).rows[0],
    { kind: 'test', published_at: null },
  );
  const savedBeforeFailure = (
    await db.query('select count(*) from digest_previews')
  ).rows[0].count;
  await assert.rejects(
    adapter.generateTest(
      new Date(window.windowStart),
      new Date(window.windowEnd),
      (id) =>
        developmentEditorialServices(
          {
            complete: async () => ({
              status: 'budget-refused',
              mustReport: true,
            }),
          },
          id,
        ),
    ),
    /Development editing stopped: report required/,
  );
  assert.equal(
    (await db.query('select count(*) from digest_previews')).rows[0].count,
    savedBeforeFailure,
  );
  assert.deepEqual(
    await accounting(),
    before,
    'Free tests never write provider or development accounting',
  );
});
