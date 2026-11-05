// Cache-only diagnostics: no external HTTP, inference or edition publication.
import { llmConfig } from '../src/modules/curation/adapters/config';
import { CandidateTriage } from '../src/modules/curation/application/triage';
import { configuredLlmLedger } from '../src/modules/curation/public/ledger';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';
import { socialTriageCandidate } from '../src/modules/social/public/editorial-selection';
import { selectTopicPosts } from '../src/modules/social/public/selection';
import { PostgresTopicRepository } from '../src/modules/topics/database/topic.repository';

async function main() {
  const start = new Date(process.argv[2] ?? Date.now() - 86400000);
  const end = new Date(process.argv[3] ?? Date.now());
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start >= end
  )
    throw new Error('Supply valid start/end ISO timestamps');
  const social = new PostgresSocialRepository();
  const topics = new PostgresTopicRepository();
  try {
    const config = llmConfig();
    const ledger = configuredLlmLedger(social.db, config.caps);
    const triage = new CandidateTriage(
      {
        json() {
          return Promise.resolve(null);
        },
      },
      ledger,
      config.haiku,
      'social',
    );
    for (const topic of (await topics.listDefault()).filter(
      (topic) => topic.enabled,
    )) {
      // Use publication's exact window, exclusions, duplicate keys and caps.
      const posts = await selectTopicPosts(
        social.db,
        topic.id,
        topic.relevancePolicy,
        start,
        end,
        topic.postBudget > 0 ? 200 : 0,
        'semantic-candidates',
      );
      const candidates = posts.map(socialTriageCandidate);
      const result = await triage.score(
        {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          guidance:
            topic.includeGuidance + '\nExclude: ' + topic.excludeGuidance,
        },
        candidates,
        'social-cache-only',
      );
      console.log(
        JSON.stringify({
          topic: topic.name,
          mode: 'cache-only',
          start,
          end,
          postBudget: topic.postBudget,
          candidates: candidates.length,
          ...result,
        }),
      );
    }
  } finally {
    await social.db.end();
    await topics.onModuleDestroy();
  }
}
void main().catch(() => {
  console.error('Cache-only social triage failed');
  process.exitCode = 1;
});
