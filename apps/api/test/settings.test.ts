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
