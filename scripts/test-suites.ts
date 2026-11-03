import { readdirSync } from 'node:fs';

// Files exercising repositories, queues, or database-backed orchestration.
// Keep mixed unit/integration files here until their cases are split.
const integration = new Set([
  'article-discovery.test.ts',
  'bluesky-storage.test.ts',
  'api-http.test.ts',
  'citing-stories.test.ts',
  'content-repository.test.ts',
  'digests.test.ts',
  'edition-jobs.test.ts',
  'edition-golden.test.ts',
  'edition-timing.test.ts',
  'editorial-publication.test.ts',
  'infrastructure.test.ts',
  'ingestion.test.ts',
  'model-allocation.test.ts',
  'operations.test.ts',
  'preview-history.test.ts',
  'profile-repository.test.ts',
  'reddit-collection.test.ts',
  'reddit-communities.test.ts',
  'relevance.test.ts',
  'reserve-admission.test.ts',
  'reserve-status.test.ts',
  'river-discovery.test.ts',
  'scheduled-digests.test.ts',
  'scheduled-budget.test.ts',
  'schedule-alert.test.ts',
  'query-stats.test.ts',
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
    NEWS_DIGEST_ISOLATED_TEST: '0',
  };
}
