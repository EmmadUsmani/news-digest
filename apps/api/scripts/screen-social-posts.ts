// Read-only live diagnostics: no HTTP, inference, or digest publication.
import { officialPostText } from '../src/modules/social/adapters/embed-text';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';
import { assessPostEligibility } from '../src/modules/social/domain/eligibility';
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
    for (const topic of (await topics.listDefault()).filter(
      (topic) => topic.enabled,
    )) {
      const posts = await social.topicPosts(topic.id);
      console.log(
        JSON.stringify({
          topic: topic.name,
          start,
          end,
          selectionMethod: 'verified-lexical-recency-v1',
          selected: await selectTopicPosts(
            social.db,
            topic.id,
            topic.relevancePolicy,
            start,
            end,
            topic.postBudget,
          ),
          posts: posts.map((post) => ({
            externalId: post.externalId,
            ...assessPostEligibility(
              {
                text: officialPostText(post.embedHtml),
                publishedAt: post.publishedAt?.toISOString() ?? null,
              },
              topic.relevancePolicy,
              start,
              end,
            ),
          })),
        }),
      );
    }
  } finally {
    await social.db.end();
    await topics.onModuleDestroy();
  }
}
void main().catch(() => {
  console.error('Social screening failed');
  process.exitCode = 1;
});
