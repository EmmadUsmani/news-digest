// Full public schema from migrations 001–057, including the migration ledger.
// SQL migrations remain authoritative; the isolated parity test never applies a plan.
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  date,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const schemaMigrations = pgTable('schema_migrations', {
  name: text().primaryKey().notNull(),
  appliedAt: timestamp('applied_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid().primaryKey().notNull(),
  name: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const digestSchedules = pgTable(
  'digest_schedules',
  {
    profileId: uuid('profile_id').primaryKey().notNull(),
    cadence: text().default('0 8 * * *').notNull(),
    timezone: text().default('America/Los_Angeles').notNull(),
    coverageWindow: text('coverage_window').default('P1D').notNull(),
    storyBudget: integer('story_budget').default(5).notNull(),
    postBudget: integer('post_budget').default(5).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
      name: 'digest_schedules_profile_id_fkey',
    }),
    check(
      'digest_schedules_story_budget_check',
      sql`(story_budget >= 0) AND (story_budget <= 20)`,
    ),
    check(
      'digest_schedules_post_budget_check',
      sql`(post_budget >= 0) AND (post_budget <= 20)`,
    ),
  ],
);

export const contentItems = pgTable(
  'content_items',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    canonicalUrl: text('canonical_url').notNull(),
    title: text().notNull(),
    excerpt: text().notNull(),
    author: text(),
    publishedAt: timestamp('published_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    imageUrl: text('image_url'),
    engagement: jsonb().default({}).notNull(),
  },
  (table) => [
    index('content_items_published').using(
      'btree',
      table.publishedAt.desc().nullsFirst(),
    ),
    unique('content_items_canonical_url_key').on(table.canonicalUrl),
  ],
);

export const digestPreviews = pgTable(
  'digest_previews',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    profileId: uuid('profile_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    windowStart: timestamp('window_start', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    windowEnd: timestamp('window_end', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    snapshot: jsonb().notNull(),
    scheduledKey: text('scheduled_key'),
  },
  (table) => [
    index('digest_previews_latest').using(
      'btree',
      table.profileId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst(),
    ),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
      name: 'digest_previews_profile_id_fkey',
    }),
    unique('digest_previews_scheduled_key_key').on(table.scheduledKey),
    check('digest_previews_check', sql`window_start < window_end`),
  ],
);

export const llmCalls = pgTable(
  'llm_calls',
  {
    id: uuid().primaryKey().notNull(),
    model: text().notNull(),
    purpose: text().notNull(),
    runId: text('run_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'string',
    }),
    status: text().notNull(),
    reservedMicros: bigint('reserved_micros', { mode: 'number' }).notNull(),
    costMicros: bigint('cost_micros', { mode: 'number' }),
    inputTokens: integer('input_tokens'),
    cacheWriteTokens: integer('cache_write_tokens'),
    cacheReadTokens: integer('cache_read_tokens'),
    outputTokens: integer('output_tokens'),
    errorCode: text('error_code'),
  },
  (table) => [
    index('llm_calls_created').using(
      'btree',
      table.createdAt.asc().nullsLast(),
    ),
    check('llm_calls_reserved_micros_check', sql`reserved_micros >= 0`),
    check(
      'llm_calls_status_check',
      sql`status = ANY (ARRAY['pending'::text, 'succeeded'::text, 'failed'::text, 'uncertain'::text])`,
    ),
    check('llm_calls_cost_micros_check', sql`cost_micros >= 0`),
    check('llm_calls_input_tokens_check', sql`input_tokens >= 0`),
    check('llm_calls_cache_write_tokens_check', sql`cache_write_tokens >= 0`),
    check('llm_calls_cache_read_tokens_check', sql`cache_read_tokens >= 0`),
    check('llm_calls_output_tokens_check', sql`output_tokens >= 0`),
    check(
      'llm_calls_check',
      sql`(status = 'succeeded'::text) = (cost_micros IS NOT NULL)`,
    ),
  ],
);

export const llmProviderBlocks = pgTable('llm_provider_blocks', {
  monthStart: date('month_start').primaryKey().notNull(),
  errorCode: text('error_code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const llmCache = pgTable('llm_cache', {
  cacheKey: text('cache_key').primaryKey().notNull(),
  response: jsonb().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const xEmbedChecks = pgTable('x_embed_checks', {
  externalId: text('external_id').primaryKey().notNull(),
  checkedAt: timestamp('checked_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  error: text(),
});

export const socialDiscoverySources = pgTable(
  'social_discovery_sources',
  {
    id: text().primaryKey().notNull(),
    topicId: uuid('topic_id'),
    name: text().notNull(),
    url: text().notNull(),
    lastSuccess: timestamp('last_success', {
      withTimezone: true,
      mode: 'string',
    }),
    lastError: text('last_error'),
    lastLinkCount: integer('last_link_count'),
  },
  (table) => [
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: 'social_discovery_sources_topic_id_fkey',
    }).onDelete('set null'),
    unique('social_discovery_sources_url_key').on(table.url),
  ],
);

export const contentSources = pgTable(
  'content_sources',
  {
    id: text().primaryKey().notNull(),
    topicId: uuid('topic_id'),
    name: text().notNull(),
    kind: text().notNull(),
    url: text().notNull(),
    lastAttempt: timestamp('last_attempt', {
      withTimezone: true,
      mode: 'string',
    }),
    lastSuccess: timestamp('last_success', {
      withTimezone: true,
      mode: 'string',
    }),
    lastError: text('last_error'),
    lastItemCount: integer('last_item_count').default(0).notNull(),
    articleDiscoveryHost: text('article_discovery_host'),
  },
  (table) => [
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: 'content_sources_topic_id_fkey',
    }).onDelete('set null'),
    check(
      'content_sources_kind_check',
      sql`kind = ANY (ARRAY['feed'::text, 'hn'::text])`,
    ),
  ],
);

export const articleXDiscoveryChecks = pgTable(
  'article_x_discovery_checks',
  {
    itemId: uuid('item_id').primaryKey().notNull(),
    checkedAt: timestamp('checked_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    lastError: text('last_error'),
    linkCount: integer('link_count').default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [contentItems.id],
      name: 'article_x_discovery_checks_item_id_fkey',
    }).onDelete('cascade'),
    check(
      'article_x_discovery_checks_link_count_check',
      sql`(link_count >= 0) AND (link_count <= 50)`,
    ),
  ],
);

export const xDiscoveryProviderBlock = pgTable(
  'x_discovery_provider_block',
  {
    singleton: boolean().default(true).primaryKey().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`clock_timestamp()`)
      .notNull(),
    errorCode: text('error_code').notNull(),
  },
  () => [
    check('x_discovery_provider_block_singleton_check', sql`singleton`),
    check(
      'x_discovery_provider_block_error_code_check',
      sql`error_code = 'credits-depleted'::text`,
    ),
  ],
);

export const topics = pgTable(
  'topics',
  {
    id: uuid().primaryKey().notNull(),
    profileId: uuid('profile_id').notNull(),
    name: text().notNull(),
    description: text().notNull(),
    includeGuidance: text('include_guidance').notNull(),
    excludeGuidance: text('exclude_guidance').default('').notNull(),
    enabled: boolean().default(true).notNull(),
    position: integer().notNull(),
    storyBudget: integer('story_budget').default(5).notNull(),
    postBudget: integer('post_budget').default(5).notNull(),
    sources: jsonb().default([]).notNull(),
    queries: jsonb().default([]).notNull(),
    accounts: jsonb().default([]).notNull(),
    relevancePolicy: jsonb('relevance_policy')
      .default({ excludeAny: [], includeAny: [] })
      .notNull(),
    redditCommunities: jsonb('reddit_communities').default([]).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
      name: 'topics_profile_id_fkey',
    }),
    check(
      'topics_story_budget_check',
      sql`(story_budget >= 0) AND (story_budget <= 20)`,
    ),
    check(
      'topics_post_budget_check',
      sql`(post_budget >= 0) AND (post_budget <= 20)`,
    ),
    check(
      'topics_relevance_policy_check',
      sql`(jsonb_typeof(relevance_policy) = 'object'::text) AND (jsonb_typeof((relevance_policy -> 'includeAny'::text)) = 'array'::text) AND (jsonb_typeof((relevance_policy -> 'excludeAny'::text)) = 'array'::text)`,
    ),
    check(
      'topics_reddit_communities_check',
      sql`(jsonb_typeof(reddit_communities) = 'array'::text) AND (jsonb_array_length(reddit_communities) <= 20)`,
    ),
  ],
);

export const scheduledAiBudgetDays = pgTable(
  'scheduled_ai_budget_days',
  {
    budgetDay: date('budget_day').primaryKey().notNull(),
    scheduledAt: timestamp('scheduled_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    runId: text('run_id').notNull(),
    state: text().default('pending').notNull(),
    attempt: integer().default(0).notNull(),
    outcome: jsonb(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('scheduled_ai_budget_days_run_id_key').on(table.runId),
    check(
      'scheduled_ai_budget_days_state_check',
      sql`state = ANY (ARRAY['pending'::text, 'running'::text, 'retrying'::text, 'succeeded'::text, 'failed'::text])`,
    ),
    check('scheduled_ai_budget_days_attempt_check', sql`attempt >= 0`),
    check(
      'scheduled_ai_budget_days_check',
      sql`budget_day = ((scheduled_at AT TIME ZONE 'UTC'::text))::date`,
    ),
    check(
      'scheduled_ai_budget_days_check1',
      sql`(state = 'succeeded'::text) = (outcome IS NOT NULL)`,
    ),
  ],
);

export const xDiscoveryCalls = pgTable(
  'x_discovery_calls',
  {
    id: uuid().primaryKey().notNull(),
    model: text().notNull(),
    purpose: text().default('x-discovery').notNull(),
    runId: text('run_id').notNull(),
    status: text().notNull(),
    reservedMicros: bigint('reserved_micros', { mode: 'number' }).notNull(),
    costMicros: bigint('cost_micros', { mode: 'number' }),
    inputTokens: bigint('input_tokens', { mode: 'number' }),
    outputTokens: bigint('output_tokens', { mode: 'number' }),
    postsFetched: bigint('posts_fetched', { mode: 'number' }),
    profilesFetched: bigint('profiles_fetched', { mode: 'number' }),
    errorCode: text('error_code'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`clock_timestamp()`)
      .notNull(),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'string',
    }),
    requestedTopic: jsonb('requested_topic'),
    scheduledDay: date('scheduled_day'),
    searchType: text('search_type'),
    verificationCompletedAt: timestamp('verification_completed_at', {
      withTimezone: true,
      mode: 'string',
    }),
    optionalParentId: uuid('optional_parent_id'),
    toolCalls: jsonb('tool_calls'),
  },
  (table) => [
    index('x_discovery_calls_created_at').using(
      'btree',
      table.createdAt.asc().nullsLast(),
    ),
    uniqueIndex('x_discovery_one_optional_attempt_per_topic_day')
      .using(
        'btree',
        sql`scheduled_day`,
        sql`((requested_topic ->> 'id'::text))`,
      )
      .where(
        sql`((scheduled_day IS NOT NULL) AND (optional_parent_id IS NOT NULL))`,
      ),
    uniqueIndex('x_discovery_one_scheduled_attempt_per_topic_day')
      .using(
        'btree',
        sql`scheduled_day`,
        sql`((requested_topic ->> 'id'::text))`,
      )
      .where(
        sql`((scheduled_day IS NOT NULL) AND (optional_parent_id IS NULL) AND ((search_type IS NULL) OR (search_type <> ALL (ARRAY['fixed-reactions'::text, 'fixed-trending'::text]))))`,
      ),
    uniqueIndex('x_discovery_one_fixed_attempt_per_topic_day_style')
      .using(
        'btree',
        sql`scheduled_day`,
        sql`((requested_topic ->> 'id'::text))`,
        sql`search_type`,
      )
      .where(
        sql`((scheduled_day IS NOT NULL) AND (search_type = ANY (ARRAY['fixed-reactions'::text, 'fixed-trending'::text])))`,
      ),
    check(
      'x_fixed_requires_schedule',
      sql`(search_type <> ALL (ARRAY['fixed-reactions'::text, 'fixed-trending'::text])) OR ((scheduled_day IS NOT NULL) AND (optional_parent_id IS NULL) AND ((requested_topic ->> 'id'::text) IS NOT NULL))`,
    ),
    foreignKey({
      columns: [table.optionalParentId],
      foreignColumns: [table.id],
      name: 'x_discovery_calls_optional_parent_id_fkey',
    }),
    check(
      'x_discovery_calls_model_check',
      sql`(length(model) >= 1) AND (length(model) <= 100)`,
    ),
    check(
      'x_discovery_calls_purpose_check',
      sql`purpose = 'x-discovery'::text`,
    ),
    check(
      'x_discovery_calls_run_id_check',
      sql`(length(run_id) >= 1) AND (length(run_id) <= 200)`,
    ),
    check(
      'x_discovery_calls_status_check',
      sql`status = ANY (ARRAY['pending'::text, 'succeeded'::text, 'failed'::text, 'uncertain'::text])`,
    ),
    check('x_discovery_calls_reserved_micros_check', sql`reserved_micros > 0`),
    check('x_discovery_calls_cost_micros_check', sql`cost_micros >= 0`),
    check('x_discovery_calls_input_tokens_check', sql`input_tokens >= 0`),
    check('x_discovery_calls_output_tokens_check', sql`output_tokens >= 0`),
    check('x_discovery_calls_posts_fetched_check', sql`posts_fetched >= 0`),
    check(
      'x_discovery_calls_profiles_fetched_check',
      sql`profiles_fetched >= 0`,
    ),
    check(
      'x_discovery_calls_error_code_check',
      sql`error_code = ANY (ARRAY['credits-depleted'::text, 'rejected'::text, 'uncertain'::text, 'estimate-exceeded'::text])`,
    ),
    check(
      'x_discovery_calls_check',
      sql`(status = 'succeeded'::text) = (cost_micros IS NOT NULL)`,
    ),
    check(
      'x_discovery_requested_topic_shape',
      sql`(requested_topic IS NULL) OR ((jsonb_typeof(requested_topic) = 'object'::text) AND (requested_topic ? 'id'::text) AND (requested_topic ? 'name'::text) AND (jsonb_typeof((requested_topic -> 'id'::text)) = 'string'::text) AND (jsonb_typeof((requested_topic -> 'name'::text)) = 'string'::text))`,
    ),
    check(
      'x_discovery_calls_search_type_check',
      sql`search_type = ANY (ARRAY['open-topic'::text, 'account-list'::text, 'story-reactions'::text, 'fixed-reactions'::text, 'fixed-trending'::text])`,
    ),
    check(
      'x_optional_requires_schedule',
      sql`(optional_parent_id IS NULL) OR ((scheduled_day IS NOT NULL) AND ((requested_topic ->> 'id'::text) IS NOT NULL))`,
    ),
  ],
);

export const contentObservations = pgTable(
  'content_observations',
  {
    sourceId: text('source_id').notNull(),
    itemId: uuid('item_id').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sourceId],
      foreignColumns: [contentSources.id],
      name: 'content_observations_source_id_fkey',
    }),
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [contentItems.id],
      name: 'content_observations_item_id_fkey',
    }),
    primaryKey({
      columns: [table.sourceId, table.itemId],
      name: 'content_observations_pkey',
    }),
  ],
);

export const topicSourceConnections = pgTable(
  'topic_source_connections',
  {
    topicId: uuid('topic_id').notNull(),
    sourceId: text('source_id').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: 'topic_source_connections_topic_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.sourceId],
      foreignColumns: [contentSources.id],
      name: 'topic_source_connections_source_id_fkey',
    }),
    primaryKey({
      columns: [table.topicId, table.sourceId],
      name: 'topic_source_connections_pkey',
    }),
  ],
);

export const redditTopicPosts = pgTable(
  'reddit_topic_posts',
  {
    topicId: uuid('topic_id').notNull(),
    externalId: text('external_id').notNull(),
    platform: text().default('reddit').notNull(),
    lastSeenAt: timestamp('last_seen_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: 'reddit_topic_posts_topic_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.platform, table.externalId],
      foreignColumns: [socialPosts.platform, socialPosts.externalId],
      name: 'reddit_topic_posts_platform_external_id_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.topicId, table.externalId],
      name: 'reddit_topic_posts_pkey',
    }),
    check('reddit_topic_posts_platform_check', sql`platform = 'reddit'::text`),
  ],
);

export const socialDiscoveryCitations = pgTable(
  'social_discovery_citations',
  {
    sourceId: text('source_id').notNull(),
    externalId: text('external_id').notNull(),
    canonicalUrl: text('canonical_url').notNull(),
    verificationUrl: text('verification_url'),
    firstSeenAt: timestamp('first_seen_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp('last_seen_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sourceId],
      foreignColumns: [socialDiscoverySources.id],
      name: 'social_discovery_citations_source_id_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.sourceId, table.externalId],
      name: 'social_discovery_citations_pkey',
    }),
  ],
);

export const blueskyObservations = pgTable(
  'bluesky_observations',
  {
    topicId: uuid('topic_id').notNull(),
    platform: text().default('bluesky').notNull(),
    externalId: text('external_id').notNull(),
    observedAt: timestamp('observed_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    publishedAt: timestamp('published_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    snapshot: jsonb().notNull(),
  },
  (table) => [
    index('bluesky_observations_window').using(
      'btree',
      table.topicId.asc().nullsLast(),
      table.publishedAt.asc().nullsLast(),
      table.observedAt.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: 'bluesky_observations_topic_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.platform, table.externalId],
      foreignColumns: [socialPosts.platform, socialPosts.externalId],
      name: 'bluesky_observations_platform_external_id_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.topicId, table.externalId, table.observedAt],
      name: 'bluesky_observations_pkey',
    }),
    check(
      'bluesky_observations_platform_check',
      sql`platform = 'bluesky'::text`,
    ),
    check(
      'bluesky_observations_snapshot_check',
      sql`jsonb_typeof(snapshot) = 'object'::text`,
    ),
    check('bluesky_observations_check', sql`observed_at >= published_at`),
  ],
);

export const redditXCitations = pgTable(
  'reddit_x_citations',
  {
    redditId: text('reddit_id').notNull(),
    platform: text().default('reddit').notNull(),
    externalId: text('external_id').notNull(),
    canonicalUrl: text('canonical_url').notNull(),
    verificationUrl: text('verification_url'),
    citingEngagement: doublePrecision('citing_engagement').default(0).notNull(),
    lastSeenAt: timestamp('last_seen_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('reddit_x_citations_external_idx').using(
      'btree',
      table.externalId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.platform, table.redditId],
      foreignColumns: [socialPosts.platform, socialPosts.externalId],
      name: 'reddit_x_citations_platform_reddit_id_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.redditId, table.externalId],
      name: 'reddit_x_citations_pkey',
    }),
    check('reddit_x_citations_platform_check', sql`platform = 'reddit'::text`),
    check(
      'reddit_x_citations_external_id_check',
      sql`external_id ~ '^[1-9][0-9]{0,19}$'::text`,
    ),
  ],
);

export const xLinkCitations = pgTable(
  'x_link_citations',
  {
    externalId: text('external_id').notNull(),
    itemId: uuid('item_id').notNull(),
    sourceId: text('source_id').notNull(),
    canonicalUrl: text('canonical_url').notNull(),
    citingEngagement: jsonb('citing_engagement').default({}).notNull(),
    firstSeenAt: timestamp('first_seen_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp('last_seen_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    verificationUrl: text('verification_url'),
  },
  (table) => [
    index('x_link_citations_item').using(
      'btree',
      table.itemId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [contentItems.id],
      name: 'x_link_citations_item_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.sourceId],
      foreignColumns: [contentSources.id],
      name: 'x_link_citations_source_id_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.externalId, table.itemId, table.sourceId],
      name: 'x_link_citations_pkey',
    }),
    check(
      'x_link_citations_external_id_check',
      sql`external_id ~ '^[0-9]{1,20}$'::text`,
    ),
  ],
);

export const xSearchCitations = pgTable(
  'x_search_citations',
  {
    callId: uuid('call_id').notNull(),
    topicId: uuid('topic_id'),
    externalId: text('external_id').notNull(),
    canonicalUrl: text('canonical_url').notNull(),
    verificationUrl: text('verification_url'),
    discoveredAt: timestamp('discovered_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    newCandidate: boolean('new_candidate'),
    reportedEngagement: jsonb('reported_engagement'),
  },
  (table) => [
    index('x_search_citations_post').using(
      'btree',
      table.externalId.asc().nullsLast(),
    ),
    index('x_search_citations_topic').using(
      'btree',
      table.topicId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.callId],
      foreignColumns: [xDiscoveryCalls.id],
      name: 'x_search_citations_call_id_fkey',
    }),
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: 'x_search_citations_topic_id_fkey',
    }).onDelete('set null'),
    primaryKey({
      columns: [table.callId, table.externalId],
      name: 'x_search_citations_pkey',
    }),
  ],
);

export const socialPosts = pgTable(
  'social_posts',
  {
    platform: text().notNull(),
    externalId: text('external_id').notNull(),
    canonicalUrl: text('canonical_url').notNull(),
    author: text().notNull(),
    authorUrl: text('author_url').notNull(),
    publishedAt: timestamp('published_at', {
      withTimezone: true,
      mode: 'string',
    }),
    metrics: jsonb().default({}).notNull(),
    embedHtml: text('embed_html').notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    redditMetadata: jsonb('reddit_metadata'),
    blueskyMetadata: jsonb('bluesky_metadata'),
  },
  (table) => [
    primaryKey({
      columns: [table.platform, table.externalId],
      name: 'social_posts_pkey',
    }),
    check(
      'social_posts_check1',
      sql`(platform <> 'reddit'::text) OR ((reddit_metadata IS NOT NULL) AND (jsonb_typeof(reddit_metadata) = 'object'::text))`,
    ),
    check(
      'social_posts_platform_check',
      sql`platform = ANY (ARRAY['x'::text, 'reddit'::text, 'bluesky'::text])`,
    ),
    check(
      'social_posts_check',
      sql`((platform = 'x'::text) AND (external_id ~ '^[1-9][0-9]{0,19}$'::text)) OR ((platform = 'reddit'::text) AND (external_id ~ '^[a-z0-9]{1,20}$'::text)) OR ((platform = 'bluesky'::text) AND (external_id ~ '^at://did:[a-z0-9]+:[A-Za-z0-9.:%_-]+/app\\.bsky\\.feed\\.post/[A-Za-z0-9]+$'::text))`,
    ),
    check(
      'social_posts_check2',
      sql`(platform <> 'bluesky'::text) OR ((bluesky_metadata IS NOT NULL) AND (jsonb_typeof(bluesky_metadata) = 'object'::text))`,
    ),
  ],
);

export const xSearchTopicSettings = pgTable(
  'x_search_topic_settings',
  {
    topicId: uuid('topic_id').primaryKey().notNull(),
    reactionMinFaves: integer('reaction_min_faves').notNull(),
    trendingMinFaves: integer('trending_min_faves').notNull(),
    exclusions: text().array().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: 'x_search_topic_settings_topic_id_fkey',
    }).onDelete('cascade'),
    check(
      'x_search_topic_settings_reaction_min_faves_check',
      sql`reaction_min_faves >= 0`,
    ),
    check(
      'x_search_topic_settings_trending_min_faves_check',
      sql`trending_min_faves >= 0`,
    ),
  ],
);
