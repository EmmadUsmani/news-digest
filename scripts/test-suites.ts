import { readdirSync } from 'node:fs';

// Files exercising repositories, queues, or database-backed orchestration.
// Keep mixed unit/integration files here until their cases are split.
const integration = new Set([
  'article-discovery.test.ts',
  'article-pool-database.test.ts',
  'bluesky-storage.test.ts',
  'api-http.test.ts',
  'accounts-schema.test.ts',
  'reader-sync-storage.test.ts',
  'account-deletion-storage.test.ts',
  'session-revocation-storage.test.ts',
  'account-runtime-storage.test.ts',
  'login-code-admission.test.ts',
  'login-code-repository.test.ts',
  'sign-in-link-repository.test.ts',
  'login-exchange.test.ts',
  'citing-stories.test.ts',
  'content-repository.test.ts',
  'console.test.ts',
  'digests.test.ts',
  'development-spend-database.test.ts',
  'edition-jobs.test.ts',
  'edition-golden.test.ts',
  'edition-timing.test.ts',
  'editorial-publication.test.ts',
  'infrastructure.test.ts',
  'ingestion.test.ts',
  'incremental-triage-lock.test.ts',
  'incremental-triage-composition.test.ts',
  'model-allocation.test.ts',
  'migration-runner.test.ts',
  'operations.test.ts',
  'preview-history.test.ts',
  'published-reader.test.ts',
  'profile-repository.test.ts',
  'system-settings-migration.test.ts',
  'nullable-system-ownership-migration.test.ts',
  'reddit-collection.test.ts',
  'reddit-communities.test.ts',
  'relevance.test.ts',
  'reserve-admission.test.ts',
  'reserve-status.test.ts',
  'river-discovery.test.ts',
  'scheduled-digests.test.ts',
  'schema-parity.test.ts',
  'scheduled-budget.test.ts',
  'schedule-alert.test.ts',
  'query-stats.test.ts',
  'slow-query-database.test.ts',
  'settings.test.ts',
  'social-candidates.test.ts',
  'social-eligibility.test.ts',
  'social-selection.test.ts',
  'topic-coverage.test.ts',
  'topic-repository.test.ts',
  'usage-purpose.test.ts',
  'verification-budget.test.ts',
  'x-discovery-ledger.test.ts',
  'x-discovery-report.test.ts',
  'x-oembed.test.ts',
  'x-post-time.test.ts',
  'x-search.test.ts',
]);
export function testFiles(suite: 'unit' | 'integration') {
  const files = readdirSync('apps/api/test').filter((name) =>
    name.endsWith('.test.ts'),
  );
  for (const name of integration) {
    if (!files.includes(name))
      throw new Error(`Missing integration test: ${name}`);
  }
  return files
    .sort()
    .filter((name) => integration.has(name) === (suite === 'integration'))
    .map((name) => `apps/api/test/${name}`);
}
export function testEnvironment() {
  return {
    ...process.env,
    DATABASE_URL: 'postgres://invalid:invalid@127.0.0.1:1/disabled',
    REDIS_URL: 'redis://127.0.0.1:1',
    ANTHROPIC_API_KEY: '',
    XAI_API_KEY: '',
    LLM_LIVE: '',
    READER_PUBLISHED_ONLY: '',
    NEWS_DIGEST_ISOLATED_TEST: '0',
  };
}
