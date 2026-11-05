import 'reflect-metadata';

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import {
  digestPreviewSchema,
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
  const topicsPath = '/api/topics';
  let createdId: string | undefined;
  const original = topicSchema.array().parse(await request(topicsPath));
  const profile = profileSettingsSchema.parse(await request('/api/profile'));
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
      await request('/api/profile/schedule', 200, 'PUT', schedule),
    );
    assert.deepEqual(saved, { ...profile, schedule });
    assert.deepEqual(await request('/api/profile'), saved);
    for (const invalid of [
      { ...schedule, timezone: 'Invalid/Timezone' },
      { ...schedule, coverageWindow: 'P32D' },
      { ...schedule, postBudget: -1 },
    ]) {
      await request('/api/profile/schedule', 400, 'PUT', invalid);
      assert.deepEqual(await request('/api/profile'), saved);
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
    await request('/api/profile/schedule', 200, 'PUT', profile.schedule);
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
  const base = `${await app.getUrl()}/api/digest-previews`;
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
  for (const path of ['', '/jobs']) {
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
  await request('/00000000-0000-4000-8000-999999999999', 404);
  await request('/jobs/invalid', 404);
  await request('/jobs/999999999999', 404);
  assert.deepEqual(
    await request(''),
    before,
    'Rejected requests never publish',
  );
  const published = digestPreviewSchema.parse(await request('', 201, window));
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
      entries: expected.entries.map(({ method: _method, ...entry }) => entry),
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
  } finally {
    await worker.close();
    await connection.quit();
  }
});

void test('protected admin aliases use real controllers and deny unauthenticated reads and writes', async (t) => {
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
    const legacy = await fetch(`${base}/api/${path}`);
    assert.equal(authorized.status, legacy.status, path);
    assert.equal(authorized.headers.get('cache-control'), 'no-store', path);
    assert.match(authorized.headers.get('vary') ?? '', /X-ExeDev-Email/i, path);
    assert.match(
      authorized.headers.get('vary') ?? '',
      /ADMIN_LOCAL_TOKEN/i,
      path,
    );
    // Status includes current timestamps/queue timings, so compare its shape only.
    if (path === 'status') {
      assert.deepEqual(
        Object.keys(await authorized.json()).sort(),
        Object.keys(await legacy.json()).sort(),
      );
    } else {
      assert.deepEqual(await authorized.json(), await legacy.json(), path);
    }
  }
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
