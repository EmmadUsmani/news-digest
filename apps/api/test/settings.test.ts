import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PostgresProfileRepository } from '../src/modules/profiles/database/profile.repository';
import { PostgresTopicRepository } from '../src/modules/topics/database/topic.repository';
import { profileSettingsSchema, topicSchema } from '@digest/contracts';
import { validateSchedule } from '../src/modules/profiles/domain/schedule';
test('persisted default profile, schedule and configured topics satisfy contracts', async () => {
 const profiles = new PostgresProfileRepository(); const topics = new PostgresTopicRepository();
 try {
 const profile = profileSettingsSchema.parse(await profiles.getDefault());
 assert.equal(validateSchedule(profile.schedule).ok, true);
 const rows = topicSchema.array().parse(await topics.listDefault());
 assert.ok(rows.length > 0);
 assert.ok(rows.every(t => t.profileId === profile.id));
 assert.deepEqual(rows.map(t => t.position), rows.map((_, index) => index));
 } finally { await profiles.onModuleDestroy(); await topics.onModuleDestroy(); }
});

test('topic reorder persists zero-based positions and rejects incomplete lists atomically', async () => {
 const topics = new PostgresTopicRepository();
 const original = await topics.listDefault();
 const ids = original.map(topic => topic.id);
 try {
 const reversed = [...ids].reverse();
 assert.equal(await topics.reorderDefault(reversed), true);
 const reordered = await topics.listDefault();
 assert.deepEqual(reordered.map(topic => topic.id), reversed);
 assert.deepEqual(reordered.map(topic => topic.position), reversed.map((_, index) => index));
 for (const invalid of [[], ids.slice(1), [...ids, ids[0]], ['00000000-0000-4000-8000-999999999999', ...ids.slice(1)]]) {
 assert.equal(await topics.reorderDefault(invalid), false);
 assert.deepEqual(await topics.listDefault(), reordered);
 }
 } finally {
 await topics.reorderDefault(ids);
 await topics.onModuleDestroy();
 }
});

test('concurrent topic creation appends unique ordered topics without changing existing settings', async () => {
 const topics = new PostgresTopicRepository();
 const db = (await import('../src/libs/db/connections')).database();
 const original = await topics.listDefault();
 const created: string[] = [];
 try {
 const input = { name: 'Creation integration check', description: '', includeGuidance: '', excludeGuidance: '', enabled: false, storyBudget: 2, postBudget: 0, relevancePolicy: { includeAny: ['science'], excludeAny: [] } };
 const results = await Promise.all([topics.createDefault(input), topics.createDefault(input)]);
 created.push(...results.map(topic => topic.id));
 assert.equal(new Set(created).size, 2);
 const rows = topicSchema.array().parse(await topics.listDefault());
 assert.deepEqual(rows.slice(0, original.length), original);
 assert.deepEqual(rows.map(topic => topic.position), rows.map((_, index) => index));
 for (const topic of results) {
 assert.equal(topic.profileId, original[0].profileId);
 assert.deepEqual(topic.relevancePolicy, input.relevancePolicy);
 assert.deepEqual(topic.sources, []);
 assert.deepEqual(topic.queries, []);
 assert.deepEqual(topic.accounts, []);
 assert.equal(topic.enabled, false);
 }
 assert.equal(await topics.reorderDefault(original.map(topic => topic.id)), false, 'A stale order must not overwrite newly created topics');
 } finally {
 await db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [created]);
 await db.end(); await topics.onModuleDestroy();
 }
});

test('topic source connections validate atomically and reuse the shared collection catalog', async () => {
 const topics = new PostgresTopicRepository();
 const db = (await import('../src/libs/db/connections')).database();
 let id: string | undefined;
 try {
 const catalog = await topics.catalog(); assert.ok(catalog.length > 0);
 const topic = await topics.createDefault({name:'Source integration check', description:'', includeGuidance:'', excludeGuidance:'', enabled:false, storyBudget:1, postBudget:0, relevancePolicy:{includeAny:[],excludeAny:[]}}); id=topic.id;
 const connected = await topics.connectDefault(id,[catalog[0].id]); assert.ok(connected); assert.deepEqual(connected.sources,[catalog[0].id]);
 for (const invalid of [[catalog[0].id,'missing-source'],[catalog[0].id,catalog[0].id]]) {
 assert.equal(await topics.connectDefault(id,invalid),false);
 assert.deepEqual((await topics.listDefault()).find(t=>t.id===id)?.sources,[catalog[0].id]);
 }
 assert.equal((await db.query('SELECT count(*)::int AS n FROM content_sources WHERE topic_id=$1',[id])).rows[0].n,0);
 assert.equal(await topics.connectDefault('00000000-0000-4000-8000-999999999999',[]),null);
 const disconnected=await topics.connectDefault(id,[]); assert.ok(disconnected); assert.deepEqual(disconnected.sources,[]);
 } finally { if(id) await db.query('DELETE FROM topics WHERE id=$1',[id]); await db.end(); await topics.onModuleDestroy(); }
});

test('profile schedule persists independently of topics and restores all fields', async () => {
 const profiles = new PostgresProfileRepository(); const topics = new PostgresTopicRepository();
 const original = await profiles.getDefault(); const before = await topics.listDefault();
 try {
 const schedule = { cadence: '30 9 * * *', timezone: 'Asia/Tokyo', coverageWindow: 'PT6H', storyBudget: 3, postBudget: 0 };
 assert.deepEqual(await profiles.updateDefault(schedule), { ...original, schedule });
 assert.deepEqual((await profiles.getDefault()).schedule, schedule);
 assert.deepEqual(await topics.listDefault(), before);
 } finally { await profiles.updateDefault(original.schedule); await profiles.onModuleDestroy(); await topics.onModuleDestroy(); }
});
