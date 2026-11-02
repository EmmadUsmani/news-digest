import 'reflect-metadata';

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import {
  profileSettingsSchema,
  sourceCatalogSchema,
  topicSchema,
} from '@digest/contracts';
import { NestFactory } from '@nestjs/core';

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
