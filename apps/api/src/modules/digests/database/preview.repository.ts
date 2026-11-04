import {
  type DigestPreview,
  type PreviewHistory,
  relevancePolicySchema,
  type SelectedSocialPost,
} from '@digest/contracts';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { and, asc, desc, DrizzleQueryError, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { digestPreviews, topics as topicTable } from '../../../libs/db/schema';
import { editorialServices } from '../../curation/public/editorial';
import { withEditionRun } from '../../curation/public/scheduled-context';
import { selectEditionBlueskyPosts } from '../../social/public/bluesky-edition';
import { linkCitingStories } from '../../social/public/citing-stories';
import { editTopicPosts } from '../../social/public/editorial-selection';
import {
  selectTopicPosts,
  selectTopicRedditPosts,
} from '../../social/public/selection';
import { observeEdition } from '../adapters/edition-logging';
import { groupShortlist } from '../application/group-shortlist';
import { parallelTopics } from '../application/parallel-topics';
import { articleTriageInput } from '../domain/article-triage-input';
import { editorialShortlist } from '../domain/editorial-shortlist';
import {
  type EditionProgress,
  PreviewRepository,
  type ReportEditionProgress,
} from '../domain/preview.repository';
import { qualityRejection } from '../domain/quality';
import { rank } from '../domain/rank';
import { assessRelevance } from '../domain/relevance';
import { loadArticleCandidates } from './article-candidates';
const profileId = '00000000-0000-4000-8000-000000000001';
@Injectable()
export class PostgresPreviewRepository
  extends PreviewRepository
  implements OnModuleDestroy
{
  readonly db = database();
  private readonly orm = drizzle(this.db);
  readonly editorial = editorialServices(this.db);
  async latest(): Promise<DigestPreview | null> {
    const [row] = await this.orm
      .select({ snapshot: digestPreviews.snapshot })
      .from(digestPreviews)
      .where(eq(digestPreviews.profileId, profileId))
      .orderBy(desc(digestPreviews.createdAt), desc(digestPreviews.id))
      .limit(1);
    return (row?.snapshot as DigestPreview | undefined) ?? null;
  }
  async find(id: string): Promise<DigestPreview | null> {
    const [row] = await this.orm
      .select({ snapshot: digestPreviews.snapshot })
      .from(digestPreviews)
      .where(
        and(eq(digestPreviews.profileId, profileId), eq(digestPreviews.id, id)),
      );
    return (row?.snapshot as DigestPreview | undefined) ?? null;
  }
  async history(offset: number): Promise<PreviewHistory> {
    const rows = await this.orm
      .select({
        id: digestPreviews.id,
        createdAt: digestPreviews.createdAt,
        windowStart: digestPreviews.windowStart,
        windowEnd: digestPreviews.windowEnd,
        method: sql<
          PreviewHistory['entries'][number]['method']
        >`${digestPreviews.snapshot}->>'method'`,
      })
      .from(digestPreviews)
      .where(eq(digestPreviews.profileId, profileId))
      .orderBy(desc(digestPreviews.createdAt), desc(digestPreviews.id))
      .limit(21)
      .offset(offset);
    return {
      entries: rows.slice(0, 20).map((row) => ({
        ...row,
        createdAt: new Date(row.createdAt).toISOString(),
        windowStart: new Date(row.windowStart).toISOString(),
        windowEnd: new Date(row.windowEnd).toISOString(),
      })),
      hasMore: rows.length > 20,
    };
  }
  async generate(
    start: Date,
    end: Date,
    scheduledKey?: string,
    reportProgress?: ReportEditionProgress,
  ): Promise<DigestPreview> {
    const runId = crypto.randomUUID();
    return withEditionRun(scheduledKey, runId, () =>
      observeEdition(
        runId,
        (report) =>
          this.generateEdition(start, end, runId, scheduledKey, report),
        reportProgress,
      ),
    );
  }
  private async generateEdition(
    start: Date,
    end: Date,
    runId: string,
    scheduledKey?: string,
    reportProgress?: ReportEditionProgress,
  ): Promise<DigestPreview> {
    const client = await this.db.connect();
    const session = drizzle(client);
    try {
      // Lock before opening the snapshot so a retry sees the committed prior run.
      if (scheduledKey)
        await session
          .select({
            lock: sql`pg_advisory_lock(hashtextextended(${scheduledKey},0))`,
          })
          .from(sql`(values (1)) as singleton(value)`);
      // Keep the session lock outside the repeatable-read snapshot for retry visibility.
      return await session.transaction(
        async (tx) => {
          if (scheduledKey) {
            const [prior] = await tx
              .select({ snapshot: digestPreviews.snapshot })
              .from(digestPreviews)
              .where(eq(digestPreviews.scheduledKey, scheduledKey));
            if (prior) {
              return prior.snapshot as DigestPreview;
            }
          }
          const topics = await tx
            .select({
              id: topicTable.id,
              name: topicTable.name,
              description: topicTable.description,
              include_guidance: topicTable.includeGuidance,
              exclude_guidance: topicTable.excludeGuidance,
              story_budget: topicTable.storyBudget,
              post_budget: topicTable.postBudget,
              relevance_policy: topicTable.relevancePolicy,
            })
            .from(topicTable)
            .where(
              and(
                eq(topicTable.profileId, profileId),
                eq(topicTable.enabled, true),
              ),
            )
            .orderBy(asc(topicTable.position), asc(topicTable.id));
          const progress: EditionProgress = {
            stage: 'topics',
            topics: topics.map((topic) => ({
              id: String(topic.id),
              name: String(topic.name),
              stage: 'triage',
            })),
          };
          const report = async () => {
            if (reportProgress) await reportProgress(structuredClone(progress));
          };
          const topicStage = async (
            id: string,
            stage: EditionProgress['topics'][number]['stage'],
          ) => {
            progress.topics.find((topic) => topic.id === String(id))!.stage =
              stage;
            await report();
          };
          await report();
          const selections = await parallelTopics(topics, async (topic) => {
            // Limit candidate work per topic, selecting the most recent 200 in the exact window.
            const candidates = await loadArticleCandidates(
              client,
              topic.id,
              start,
              end,
            );
            const policy = relevancePolicySchema.parse(topic.relevance_policy);
            const eligible = candidates.filter(
              (item) => assessRelevance(item, policy).eligible,
            );
            const qualityRejections = candidates.flatMap((item) => {
              const rejection = qualityRejection(item);
              return rejection
                ? [{ id: item.id, title: item.title, ...rejection }]
                : [];
            });
            let stories: DigestPreview['topics'][number]['stories'] = rank(
              eligible,
              start,
              end,
              topic.story_budget,
            ).map((story) => ({
              ...story,
              reasons: [
                ...story.reasons,
                assessRelevance(story, policy).reason,
              ],
            }));
            let relevanceRejectedCount = candidates.filter(
              (c) =>
                !qualityRejection(c) && !assessRelevance(c, policy).eligible,
            ).length;
            const editorial: NonNullable<
              DigestPreview['topics'][number]['editorial']
            > = {
              mode: 'non-ai',
              model: null,
              brief: [],
              triage: [],
              unscoredIds: candidates.map((c) => c.id),
              reason:
                topic.story_budget === 0
                  ? 'Non-AI ranking: topic story budget is zero.'
                  : 'Non-AI ranking: editorial service unavailable.',
            };
            if (this.editorial && topic.story_budget > 0) {
              const { topic: context, candidates: triageCandidates } =
                articleTriageInput(topic, candidates);
              const triage = await this.editorial.triage.score(
                context,
                triageCandidates,
                runId,
              );
              editorial.triage = triage.scores;
              editorial.unscoredIds = triage.unscoredIds;
              editorial.reason =
                'Non-AI ranking: incomplete triage or editor unavailable within caps.';
              // Partial semantic coverage must never silently displace unscored news.
              if (triage.unscoredIds.length === 0) {
                const { shortlist } = editorialShortlist(
                  candidates,
                  triage.scores,
                  policy,
                  start,
                  end,
                );
                await topicStage(topic.id, 'editing');
                const matches = await groupShortlist(
                  this.editorial.grouping,
                  topic.id,
                  shortlist,
                  runId,
                );
                const ranked = rank(shortlist, start, end, 10, matches);
                const result = await this.editorial.editor.edit(
                  context,
                  ranked,
                  Math.min(10, topic.story_budget),
                  runId,
                );
                if (result) {
                  stories = result.stories.map((edit) => {
                    const original = ranked.find((s) => s.id === edit.id)!;
                    const score = triage.scores.find((s) => s.id === edit.id)!;
                    return {
                      ...original,
                      title: edit.headline,
                      evidence: edit.evidenceIds.map((id) => {
                        const source = ranked.find((item) => item.id === id)!;
                        return {
                          id: source.id,
                          title: source.title,
                          url: source.url,
                          excerpt: source.excerpt,
                          sources: source.sources,
                          publishedAt: source.publishedAt,
                        };
                      }),
                      summary: edit.summary,
                      whyItMatters: edit.whyItMatters,
                      reasons: [
                        ...original.reasons,
                        `Semantic relevance ${score.relevance}/10; importance ${score.importance}/10: ${score.rationale}`,
                        `Editor: ${edit.rationale}`,
                      ],
                    };
                  });
                  relevanceRejectedCount = candidates.filter(
                    (c) =>
                      !qualityRejection(c) &&
                      !shortlist.some((s) => s.id === c.id),
                  ).length;
                  editorial.mode = 'ai';
                  editorial.model = result.model;
                  // Derive the published brief only from selected headlines. A model's
                  // free-form brief can mention candidates it ultimately omitted.
                  editorial.brief = result.stories
                    .slice(0, 4)
                    .map((story) => story.headline);
                  editorial.reason =
                    'AI edited from supplied headlines and excerpts; full articles were not fetched.';
                }
              }
            }
            await topicStage(topic.id, 'posts');
            const redditPosts = await selectTopicRedditPosts(
              client,
              topic.id,
              policy,
              start,
              end,
              Number(topic.post_budget) > 0 ? 200 : 0,
            );
            const posts: SelectedSocialPost[] = await selectTopicPosts(
              client,
              topic.id,
              policy,
              start,
              end,
              Number(topic.post_budget),
            );
            posts.push(...redditPosts);
            const postCandidates: SelectedSocialPost[] =
              topic.post_budget > 0
                ? await selectTopicPosts(
                    client,
                    topic.id,
                    policy,
                    start,
                    end,
                    200,
                    'semantic-candidates',
                  )
                : [];
            postCandidates.push(...redditPosts);
            const postSelection = await editTopicPosts(
              this.editorial,
              {
                id: String(topic.id),
                name: String(topic.name),
                description: String(topic.description),
                guidance: `${topic.include_guidance}\nExclude: ${topic.exclude_guidance}`,
              },
              postCandidates,
              posts,
              Number(topic.post_budget),
              runId,
            );
            const bluesky = await selectEditionBlueskyPosts(
              client,
              this.editorial,
              {
                topic: {
                  id: String(topic.id),
                  name: String(topic.name),
                  description: String(topic.description),
                  guidance: `${topic.include_guidance}\nExclude: ${topic.exclude_guidance}`,
                },
                policy,
                start,
                end,
                budget: Number(topic.post_budget),
                selectedPosts: postSelection.posts,
                runId,
              },
            );
            if (bluesky.posts.length > postSelection.posts.length) {
              postSelection.postEditorial.reason += ` Bluesky additions were separately AI edited (${bluesky.model}); the preceding selection details describe X/Reddit.`;
            }
            postSelection.posts = bluesky.posts;
            postSelection.posts = await linkCitingStories(
              client,
              postSelection.posts,
              stories,
            );
            await topicStage(topic.id, 'ready');
            return {
              ...postSelection,
              editorial,
              qualityRejections,
              relevancePolicy: policy,
              relevanceRejectedCount,
              id: topic.id,
              name: topic.name,
              candidateCount: candidates.length,
              stories,
            };
          });
          progress.stage = 'publishing';
          await report();
          const snapshot: DigestPreview = {
            id: runId,
            createdAt: new Date().toISOString(),
            windowStart: start.toISOString(),
            windowEnd: end.toISOString(),
            method: 'editorial-v1',
            topics: selections,
          };
          await tx.insert(digestPreviews).values({
            id: snapshot.id,
            profileId,
            createdAt: snapshot.createdAt,
            windowStart: start.toISOString(),
            windowEnd: end.toISOString(),
            snapshot,
            scheduledKey: scheduledKey ?? null,
          });
          return snapshot;
        },
        { isolationLevel: 'repeatable read' },
      );
    } catch (error) {
      throw error instanceof DrizzleQueryError && error.cause
        ? error.cause
        : error;
    } finally {
      try {
        if (scheduledKey)
          await session
            .select({
              unlock: sql`pg_advisory_unlock(hashtextextended(${scheduledKey},0))`,
            })
            .from(sql`(values (1)) as singleton(value)`);
      } finally {
        client.release();
      }
    }
  }
  async onModuleDestroy() {
    await this.db.end();
  }
}
