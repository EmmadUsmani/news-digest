import { database } from '../src/libs/db/connections';
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

test('topic deletion closes reading order and preserves shared sources, observations and profile scope', async () => {
 const topics = new PostgresTopicRepository();
 const db = (await import('../src/libs/db/connections')).database();
 const original = await topics.listDefault();
 const created: string[] = [];
 const sourceId = 'deletion-integration-fixture';
 const otherProfile = '00000000-0000-4000-8000-999999999998';
 const otherTopic = '00000000-0000-4000-8000-999999999997';
 let itemId: string | undefined;
 try {
 const input = {name:'Deletion integration fixture',description:'',includeGuidance:'',excludeGuidance:'',enabled:false,storyBudget:1,postBudget:0,relevancePolicy:{includeAny:[],excludeAny:[]}};
 const first = await topics.createDefault(input); created.push(first.id);
 const second = await topics.createDefault(input); created.push(second.id);
 await db.query("INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,'Fixture','feed','https://example.org/deletion-fixture')", [sourceId,first.id]);
 itemId = (await db.query("INSERT INTO content_items(canonical_url,title,excerpt,published_at) VALUES('https://example.org/deletion-fixture','Fixture','Fixture',now()) RETURNING id")).rows[0].id;
 await db.query('INSERT INTO content_observations(source_id,item_id) VALUES($1,$2)',[sourceId,itemId]);
 await topics.connectDefault(first.id,[sourceId]); await topics.connectDefault(second.id,[sourceId]);
 await topics.reorderDefault([first.id,...original.map(t=>t.id),second.id]);
 await db.query("INSERT INTO profiles(id,name) VALUES($1,'Other profile fixture')",[otherProfile]);
 await db.query("INSERT INTO topics(id,profile_id,name,description,include_guidance,position) VALUES($1,$2,'Other topic','','',0)",[otherTopic,otherProfile]);
 const before = await topics.listDefault();
 assert.equal(await topics.deleteDefault(otherTopic),null);
 assert.equal(await topics.deleteDefault('00000000-0000-4000-8000-999999999999'),null);
 assert.deepEqual(await topics.listDefault(),before);
 const remaining = await topics.deleteDefault(first.id); assert.ok(remaining);
 assert.deepEqual(remaining.map(t=>t.id),[...original.map(t=>t.id),second.id]);
 assert.deepEqual(remaining.map(t=>t.position),remaining.map((_,i)=>i));
 assert.deepEqual(remaining.find(t=>t.id===second.id)?.sources,[sourceId]);
 assert.equal((await db.query('SELECT topic_id FROM content_sources WHERE id=$1',[sourceId])).rows[0].topic_id,null);
 assert.equal((await db.query('SELECT 1 FROM content_observations WHERE source_id=$1 AND item_id=$2',[sourceId,itemId])).rowCount,1);
 assert.equal((await db.query('SELECT 1 FROM topic_source_connections WHERE topic_id=$1',[first.id])).rowCount,0);
 assert.equal(await topics.deleteDefault(first.id),null);
 await topics.deleteDefault(second.id);
 assert.deepEqual(await topics.listDefault(),original);
 } finally {
 await db.query('DELETE FROM content_observations WHERE source_id=$1',[sourceId]);
 await db.query('DELETE FROM content_sources WHERE id=$1',[sourceId]);
 if(itemId) await db.query('DELETE FROM content_items WHERE id=$1',[itemId]);
 await db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])',[[...created,otherTopic]]);
 await db.query('DELETE FROM profiles WHERE id=$1',[otherProfile]);
 await topics.reorderDefault(original.map(t=>t.id));
 await db.end(); await topics.onModuleDestroy();
 }
});

test('custom feed registration atomically connects and shares existing URLs without renaming catalog entries', async () => {
 const topics = new PostgresTopicRepository(); const db = database(); const ids: string[] = [];
 const url = 'https://example.org/custom-feed-integration-fixture';
 try {
 const input = {name:'Feed integration fixture',description:'',includeGuidance:'',excludeGuidance:'',enabled:false,storyBudget:1,postBudget:0,relevancePolicy:{includeAny:[],excludeAny:[]}};
 for(let n=0;n<2;n++) ids.push((await topics.createDefault(input)).id);
 const [first,second] = await Promise.all(ids.map(id=>topics.addFeedDefault(id,{name:'Fixture feed',url})));
 assert.ok(first && second); assert.deepEqual(first.sources,second.sources); assert.equal(first.sources.length,1);
 const repeated = await topics.addFeedDefault(ids[0],{name:'Changed name',url}); assert.ok(repeated); assert.deepEqual(repeated.sources,first.sources);
 const sources = await db.query('SELECT name,kind,topic_id FROM content_sources WHERE url=$1',[url]);
 assert.equal(sources.rowCount,1); assert.deepEqual(sources.rows[0],{name:'Fixture feed',kind:'feed',topic_id:null});
 assert.equal(await topics.addFeedDefault('00000000-0000-4000-8000-999999999999',{name:'Missing',url:url+'-missing'}),null);
 assert.equal((await db.query('SELECT 1 FROM content_sources WHERE url=$1',[url+'-missing'])).rowCount,0);
 await topics.deleteDefault(ids[0]); assert.deepEqual((await topics.listDefault()).find(t=>t.id===ids[1])?.sources,first.sources);
 } finally { await db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])',[ids]); await db.query('DELETE FROM content_sources WHERE url=$1',[url]); await db.end(); await topics.onModuleDestroy(); }
});
