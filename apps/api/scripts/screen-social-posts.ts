// Read-only live diagnostics: no HTTP, inference, or digest publication.
import { officialPostText } from '../src/modules/social/adapters/embed-text';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';
import {
  assessPostEligibility,
  assessPostSafety,
} from '../src/modules/social/domain/eligibility';
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
      const assessments = posts.map((post) => {
        const input = {
          text: officialPostText(post.embedHtml),
          publishedAt: post.publishedAt?.toISOString() ?? null,
        };
        return {
          externalId: post.externalId,
          ...assessPostEligibility(input, topic.relevancePolicy, start, end),
          semanticSafety: assessPostSafety(
            input,
            topic.relevancePolicy,
            start,
            end,
          ),
        };
      });
      const semanticCandidates = await selectTopicPosts(
        social.db,
        topic.id,
        topic.relevancePolicy,
        start,
        end,
        topic.postBudget > 0 ? 200 : 0,
        'semantic-candidates',
      );
      const exclusions: Record<string, number> = {};
      for (const post of assessments) {
        if (!post.semanticSafety.eligible)
          exclusions[post.semanticSafety.reason] =
            (exclusions[post.semanticSafety.reason] ?? 0) + 1;
      }
      console.log(
        JSON.stringify({
          topic: topic.name,
          start,
          end,
          selectionMethod: 'verified-lexical-recency-v2',
          selected: await selectTopicPosts(
            social.db,
            topic.id,
            topic.relevancePolicy,
            start,
            end,
            topic.postBudget,
          ),
          postBudget: topic.postBudget,
          readiness: {
            verifiedScoped: posts.length,
            safetyEligibleBeforeDedupe: assessments.filter(
              (p) => p.semanticSafety.eligible,
            ).length,
            semanticCandidates: semanticCandidates.length,
            lexicalEligibleBeforeDedupe: assessments.filter((p) => p.eligible)
              .length,
            semanticExclusions: exclusions,
          },
          semanticCandidates,
          posts: assessments,
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
