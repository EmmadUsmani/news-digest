import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresProfileRepository } from '../src/modules/profiles/database/profile.repository';
import type { ProfileRepository } from '../src/modules/profiles/domain/profile.repository';

void test('default profile isolates foreign schedules, rejects invalid budgets atomically and detects missing schedules', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const db = database();
  const adapter = new PostgresProfileRepository();
  const repository: ProfileRepository = adapter;
  const original = await repository.getDefault();
  const foreignId = randomUUID();
  const foreignSchedule = {
    cadence: '15 22 * * *',
    timezone: 'Pacific/Auckland',
    coverageWindow: 'PT12H',
    storyBudget: 7,
    postBudget: 9,
  };
  try {
    await db.query('INSERT INTO profiles(id,name) VALUES($1,$2)', [
      foreignId,
      'Foreign schedule fixture',
    ]);
    await db.query(
      'INSERT INTO digest_schedules(profile_id,cadence,timezone,coverage_window,story_budget,post_budget) VALUES($1,$2,$3,$4,$5,$6)',
      [foreignId, ...Object.values(foreignSchedule)],
    );
    assert.deepEqual(await repository.getDefault(), original);
    for (const [storyBudget, postBudget] of [
      [0, 20],
      [20, 0],
    ]) {
      const schedule = { ...foreignSchedule, storyBudget, postBudget };
      const updated = await repository.updateDefault(schedule);
      assert.deepEqual(updated, { ...original, schedule });
      updated.name = 'Changed caller result';
      updated.schedule.storyBudget = 11;
      assert.deepEqual(await repository.getDefault(), {
        ...original,
        schedule,
      });
      for (const invalid of [
        { storyBudget: -1 },
        { storyBudget: 21 },
        { postBudget: -1 },
        { postBudget: 21 },
      ]) {
        await assert.rejects(
          repository.updateDefault({
            ...schedule,
            cadence: '0 1 * * *',
            timezone: 'UTC',
            coverageWindow: 'P7D',
            ...invalid,
          }),
        );
        assert.deepEqual(await repository.getDefault(), {
          ...original,
          schedule,
        });
      }
    }
    await db.query('DELETE FROM digest_schedules WHERE profile_id=$1', [
      original.id,
    ]);
    await assert.rejects(
      repository.getDefault(),
      /Default profile schedule missing/,
    );
    await assert.rejects(
      repository.updateDefault(original.schedule),
      /Default profile schedule missing/,
    );
    const foreign = await db.query(
      'SELECT cadence,timezone,coverage_window AS "coverageWindow",story_budget AS "storyBudget",post_budget AS "postBudget" FROM digest_schedules WHERE profile_id=$1',
      [foreignId],
    );
    assert.deepEqual(foreign.rows, [foreignSchedule]);
  } finally {
    await db.query(
      'INSERT INTO digest_schedules(profile_id) VALUES($1) ON CONFLICT DO NOTHING',
      [original.id],
    );
    await repository.updateDefault(original.schedule);
    await db.query('DELETE FROM digest_schedules WHERE profile_id=$1', [
      foreignId,
    ]);
    await db.query('DELETE FROM profiles WHERE id=$1', [foreignId]);
    await adapter.onModuleDestroy();
    await db.end();
  }
});

void test('concurrent schedule replacements preserve whole configurations and recover after rejection', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const firstAdapter = new PostgresProfileRepository();
  const secondAdapter = new PostgresProfileRepository();
  const first: ProfileRepository = firstAdapter;
  const second: ProfileRepository = secondAdapter;
  const original = await first.getDefault();
  const schedules = [
    {
      cadence: '5 7 * * *',
      timezone: 'America/Los_Angeles',
      coverageWindow: 'P1D',
      storyBudget: 3,
      postBudget: 4,
    },
    {
      cadence: '25 19 * * *',
      timezone: 'Pacific/Auckland',
      coverageWindow: 'PT12H',
      storyBudget: 8,
      postBudget: 9,
    },
  ];
  const assertWhole = (profile: typeof original) => {
    assert.equal(profile.id, original.id);
    assert.equal(profile.name, original.name);
    assert.ok(
      schedules.some(
        (schedule) =>
          JSON.stringify(schedule) === JSON.stringify(profile.schedule),
      ),
      'schedule must match one complete submitted configuration',
    );
  };
  try {
    const results = await Promise.all(
      schedules.map((schedule, index) =>
        (index ? second : first).updateDefault(schedule),
      ),
    );
    // A writer may read the other writer's later commit; neither may return a torn configuration.
    results.forEach(assertWhole);
    const winner = await first.getDefault();
    assertWhole(winner);
    assert.deepEqual(await second.getDefault(), winner);
    const outcomes = await Promise.allSettled([
      first.updateDefault({ ...schedules[0], storyBudget: -1 }),
      second.updateDefault(schedules[1]),
    ]);
    assert.equal(outcomes[0].status, 'rejected');
    assert.equal(outcomes[1].status, 'fulfilled');
    assert.deepEqual(await first.getDefault(), {
      ...original,
      schedule: schedules[1],
    });
    assert.deepEqual(await first.updateDefault(schedules[0]), {
      ...original,
      schedule: schedules[0],
    });
    assert.deepEqual(await second.getDefault(), {
      ...original,
      schedule: schedules[0],
    });
  } finally {
    await first.updateDefault(original.schedule);
    await Promise.all([
      firstAdapter.onModuleDestroy(),
      secondAdapter.onModuleDestroy(),
    ]);
  }
});
