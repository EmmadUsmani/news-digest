import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// Incremental mapping of existing migrations, not a migration-generation input
// until the full database schema has passed the parity gate.
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const digestSchedules = pgTable(
  'digest_schedules',
  {
    profileId: uuid('profile_id')
      .primaryKey()
      .references(() => profiles.id),
    cadence: text('cadence').notNull().default('0 8 * * *'),
    timezone: text('timezone').notNull().default('America/Los_Angeles'),
    coverageWindow: text('coverage_window').notNull().default('P1D'),
    storyBudget: integer('story_budget').notNull().default(5),
    postBudget: integer('post_budget').notNull().default(5),
  },
  (table) => [
    check(
      'digest_schedules_story_budget_check',
      sql`${table.storyBudget} BETWEEN 0 AND 20`,
    ),
    check(
      'digest_schedules_post_budget_check',
      sql`${table.postBudget} BETWEEN 0 AND 20`,
    ),
  ],
);
