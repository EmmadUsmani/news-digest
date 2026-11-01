import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PostgresProfileRepository } from '../src/modules/profiles/database/profile.repository';
import { PostgresTopicRepository } from '../src/modules/topics/database/topic.repository';
import { profileSettingsSchema, topicSchema } from '@digest/contracts';
import { validateSchedule } from '../src/modules/profiles/domain/schedule';
test('persisted default profile, schedule and ordered topic seeds satisfy contracts', async () => {
 const profiles = new PostgresProfileRepository(); const topics = new PostgresTopicRepository();
 try {
 const profile = profileSettingsSchema.parse(await profiles.getDefault());
 assert.equal(validateSchedule(profile.schedule).ok, true);
 const rows = topicSchema.array().parse(await topics.listDefault());
 assert.deepEqual(rows.map(t => t.name), ['Tech & AI', 'NBA', 'Gaming', 'World news & politics']);
 assert.ok(rows.every(t => t.profileId === profile.id && t.enabled));
 assert.deepEqual(rows.map(t => t.position), [0, 1, 2, 3]);
 } finally { await profiles.onModuleDestroy(); await topics.onModuleDestroy(); }
});
