// Cache-only diagnostics: no external HTTP, inference or edition publication.
import { llmConfig } from '../src/modules/curation/adapters/config';
import { CandidateTriage } from '../src/modules/curation/application/triage';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';
import { officialPostText } from '../src/modules/social/adapters/embed-text';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';
import { assessPostSafety } from '../src/modules/social/domain/eligibility';
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
    const ledger = new PostgresLlmLedger(social.db, config.caps);
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
      const posts = await social.topicPosts(topic.id);
      const candidates = posts
        .flatMap((post) => {
          const text = officialPostText(post.embedHtml);
          const safety = assessPostSafety(
            { text, publishedAt: post.publishedAt?.toISOString() ?? null },
            topic.relevancePolicy,
            start,
            end,
          );
          return safety.eligible
            ? [
                {
                  id: post.externalId,
                  title: 'Verified X post',
                  excerpt: text,
                  sources: [],
                },
              ]
            : [];
        })
        .slice(0, 200);
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
