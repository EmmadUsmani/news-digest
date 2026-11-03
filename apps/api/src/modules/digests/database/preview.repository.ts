import {
  type DigestPreview,
  type PreviewHistory,
  relevancePolicySchema,
  type SelectedSocialPost,
} from '@digest/contracts';
import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { database } from '../../../libs/db/connections';
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
import { editionEventMatcher } from '../adapters/event-grouping';
import { parallelTopics } from '../application/parallel-topics';
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
  readonly editorial = editorialServices(this.db);
  async latest(): Promise<DigestPreview | null> {
    return (
      (
        await this.db.query(
          'SELECT snapshot FROM digest_previews WHERE profile_id=$1 ORDER BY created_at DESC,id DESC LIMIT 1',
          [profileId],
        )
      ).rows[0]?.snapshot ?? null
    );
  }
  async find(id: string): Promise<DigestPreview | null> {
    return (
      (
        await this.db.query(
          'SELECT snapshot FROM digest_previews WHERE profile_id=$1 AND id=$2',
          [profileId, id],
        )
      ).rows[0]?.snapshot ?? null
    );
  }
  async history(offset: number): Promise<PreviewHistory> {
    const rows = (
      await this.db.query(
        `SELECT id,created_at AS "createdAt",window_start AS "windowStart",window_end AS "windowEnd",snapshot->>'method' AS method FROM digest_previews WHERE profile_id=$1 ORDER BY created_at DESC,id DESC LIMIT 21 OFFSET $2`,
        [profileId, offset],
      )
    ).rows;
    return {
      entries: rows.slice(0, 20).map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        windowStart: row.windowStart.toISOString(),
        windowEnd: row.windowEnd.toISOString(),
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
    try {
      // Lock before opening the snapshot so a retry sees the committed prior run.
      if (scheduledKey)
        await client.query('SELECT pg_advisory_lock(hashtextextended($1,0))', [
          scheduledKey,
        ]);
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
      if (scheduledKey) {
        const prior = (
          await client.query(
            'SELECT snapshot FROM digest_previews WHERE scheduled_key=$1',
            [scheduledKey],
          )
        ).rows[0];
        if (prior) {
          await client.query('COMMIT');
          return prior.snapshot;
        }
      }
      const topics = (
        await client.query(
          'SELECT id,name,description,include_guidance,exclude_guidance,story_budget,post_budget,relevance_policy FROM topics WHERE profile_id=$1 AND enabled ORDER BY position,id',
          [profileId],
        )
      ).rows;
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
        progress.topics.find((topic) => topic.id === String(id))!.stage = stage;
        await report();
      };
      await report();
      const matches = editionEventMatcher();
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
          matches,
        ).map((story) => ({
          ...story,
          reasons: [...story.reasons, assessRelevance(story, policy).reason],
        }));
        let relevanceRejectedCount = candidates.filter(
          (c) => !qualityRejection(c) && !assessRelevance(c, policy).eligible,
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
          const context = {
            id: String(topic.id),
            name: String(topic.name),
            description: String(topic.description),
            guidance: `${topic.include_guidance}\nExclude: ${topic.exclude_guidance}\nRequired phrases: ${policy.includeAny.join(', ')}\nExcluded phrases: ${policy.excludeAny.join(', ')}`,
          };
          const triage = await this.editorial.triage.score(
            context,
            candidates,
            runId,
          );
          editorial.triage = triage.scores;
          editorial.unscoredIds = triage.unscoredIds;
          editorial.reason =
            'Non-AI ranking: incomplete triage or editor unavailable within caps.';
          // Partial semantic coverage must never silently displace unscored news.
          if (triage.unscoredIds.length === 0) {
            const { shortlist, ranked } = editorialShortlist(
              candidates,
              triage.scores,
              policy,
              start,
              end,
              matches,
            );
            await topicStage(topic.id, 'editing');
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
                  !qualityRejection(c) && !shortlist.some((s) => s.id === c.id),
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
      await client.query(
        'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot,scheduled_key) VALUES($1,$2,$3,$4,$5,$6,$7)',
        [
          snapshot.id,
          profileId,
          snapshot.createdAt,
          start,
          end,
          snapshot,
          scheduledKey ?? null,
        ],
      );
      await client.query('COMMIT');
      return snapshot;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      try {
        if (scheduledKey)
          await client.query(
            'SELECT pg_advisory_unlock(hashtextextended($1,0))',
            [scheduledKey],
          );
      } finally {
        client.release();
      }
    }
  }
  async onModuleDestroy() {
    await this.db.end();
  }
}
