import {
  type DigestPreview,
  type PreviewHistory,
  type RelevancePolicy,
  relevancePolicySchema,
  type SelectedPost,
  type SelectedSocialPost,
} from '@digest/contracts';
import {
  Injectable,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  and,
  asc,
  desc,
  DrizzleQueryError,
  eq,
  isNotNull,
  ne,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { prepareDevelopmentLlmRuntime } from '../../../development-llm-runtime';
import { prepareDevelopmentXRuntime } from '../../../development-x-runtime';
import { developmentXSelection } from '../../../development-x-selection';
import { database } from '../../../libs/db/connections';
import {
  digestPreviews,
  topics as topicTable,
  xSearchTopicSettings,
} from '../../../libs/db/schema';
import { developmentEditorialServices } from '../../curation/public/development-editorial';
import { readEditionCost } from '../../curation/public/edition-cost';
import { editorialServices } from '../../curation/public/editorial';
import { withEditionRun } from '../../curation/public/scheduled-context';
import { selectEditionBlueskyPosts } from '../../social/public/bluesky-edition';
import { linkCitingStories } from '../../social/public/citing-stories';
import { editTopicPosts } from '../../social/public/editorial-selection';
import {
  selectTopicPosts,
  selectTopicRedditPosts,
} from '../../social/public/selection';
import {
  announceDigest,
  LogDigestNotifications,
} from '../adapters/digest-notifications';
import { observeEdition } from '../adapters/edition-logging';
import { editorEvidence } from '../application/editor-evidence';
import { groupShortlist } from '../application/group-shortlist';
import { parallelTopics } from '../application/parallel-topics';
import {
  politicsStories,
  politicsTopicIds,
} from '../application/politics-stories';
import { articleTriageInput } from '../domain/article-triage-input';
import { DigestNotifications } from '../domain/digest-published';
import { newEditionPublication } from '../domain/edition-publication';
import {
  editorialShortlist,
  scoredFallback,
} from '../domain/editorial-shortlist';
import {
  type EditionProgress,
  PreviewRepository,
  type ReportEditionProgress,
} from '../domain/preview.repository';
import { qualityRejection } from '../domain/quality';
import { rank } from '../domain/rank';
import { assessRelevance } from '../domain/relevance';
import { loadArticleCandidates } from './article-candidates';
/** Explicit, per-test-edition discovery only. Both pools come from one shared
 * discovery so fallback and editorial selection cannot trigger separate calls. */
export type DevelopmentPostSelection = (input: {
  topicId: string;
  name: string;
  guidance: string;
  policy: RelevancePolicy;
  start: Date;
  end: Date;
  budget: number;
}) => Promise<{ posts: SelectedPost[]; candidates: SelectedPost[] }>;
const profileId = '00000000-0000-4000-8000-000000000001';
@Injectable()
export class PostgresPreviewRepository
  extends PreviewRepository
  implements OnModuleDestroy
{
  constructor(
    private readonly notifications: DigestNotifications = new LogDigestNotifications(),
  ) {
    super();
  }
  readonly db = database();
  private readonly orm = drizzle(this.db);
  readonly editorial = editorialServices(this.db);
  private publicationFilter(publishedOnly: boolean) {
    return publishedOnly
      ? and(
          isNotNull(digestPreviews.publishedAt),
          ne(digestPreviews.kind, 'test'),
        )
      : undefined;
  }
  cost(id: string) {
    return readEditionCost(this.db, id);
  }
  async latest(publishedOnly = false): Promise<DigestPreview | null> {
    const [row] = await this.orm
      .select({ snapshot: digestPreviews.snapshot })
      .from(digestPreviews)
      .where(
        and(
          process.env.SYSTEM_OWNERSHIP === '1'
            ? undefined
            : eq(digestPreviews.profileId, profileId),
          this.publicationFilter(publishedOnly),
        ),
      )
      .orderBy(desc(digestPreviews.createdAt), desc(digestPreviews.id))
      .limit(1);
    return (row?.snapshot as DigestPreview | undefined) ?? null;
  }
  async find(id: string, publishedOnly = false): Promise<DigestPreview | null> {
    const [row] = await this.orm
      .select({ snapshot: digestPreviews.snapshot })
      .from(digestPreviews)
      .where(
        and(
          process.env.SYSTEM_OWNERSHIP === '1'
            ? undefined
            : eq(digestPreviews.profileId, profileId),
          eq(digestPreviews.id, id),
          this.publicationFilter(publishedOnly),
        ),
      );
    return (row?.snapshot as DigestPreview | undefined) ?? null;
  }
  async findByGenerationKey(key: string): Promise<{ id: string } | null> {
    const [row] = await this.orm
      .select({ id: digestPreviews.id })
      .from(digestPreviews)
      .where(
        and(
          process.env.SYSTEM_OWNERSHIP === '1'
            ? undefined
            : eq(digestPreviews.profileId, profileId),
          eq(digestPreviews.scheduledKey, key),
        ),
      );
    return row ?? null;
  }
  async history(
    offset: number,
    publishedOnly = false,
  ): Promise<PreviewHistory> {
    const rows = await this.orm
      .select({
        id: digestPreviews.id,
        createdAt: digestPreviews.createdAt,
        windowStart: digestPreviews.windowStart,
        windowEnd: digestPreviews.windowEnd,
        snapshot: digestPreviews.snapshot,
        method: sql<
          PreviewHistory['entries'][number]['method']
        >`${digestPreviews.snapshot}->>'method'`,
      })
      .from(digestPreviews)
      .where(
        and(
          process.env.SYSTEM_OWNERSHIP === '1'
            ? undefined
            : eq(digestPreviews.profileId, profileId),
          this.publicationFilter(publishedOnly),
        ),
      )
      .orderBy(desc(digestPreviews.createdAt), desc(digestPreviews.id))
      .limit(21)
      .offset(offset);
    return {
      entries: rows.slice(0, 20).map(({ snapshot, ...row }) => ({
        ...row,
        topicModes: (snapshot as DigestPreview).topics.map((topic) => ({
          id: topic.id,
          name: topic.name,
          stories: topic.editorial?.mode ?? null,
          posts: topic.postEditorial?.mode ?? null,
        })),
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
        async (report) => {
          const edition = await this.generateEdition(
            start,
            end,
            runId,
            scheduledKey,
            report,
          );
          if (edition.id === runId)
            await announceDigest(this.notifications, {
              type: 'DigestPublished',
              editionId: edition.id,
              profileId,
              publishedAt: edition.createdAt,
              windowStart: edition.windowStart,
              windowEnd: edition.windowEnd,
            });
          return edition;
        },
        reportProgress,
      ),
    );
  }
  // Admin tests bypass production context, metrics and notifications. An
  // explicit per-edition factory may supply isolated development editors;
  // AI is opt-in; the default stays free regardless of production credentials.
  readonly developmentRuntime = () =>
    prepareDevelopmentLlmRuntime({ db: this.db });

  readonly developmentXRuntime = () =>
    prepareDevelopmentXRuntime({ db: this.db });

  generateTest(
    start: Date,
    end: Date,
    aiEditing = false,
    paidXSearch = false,
    development?: (
      editionId: string,
    ) => ReturnType<typeof developmentEditorialServices>,
    developmentPosts?: (editionId: string) => DevelopmentPostSelection,
  ): Promise<DigestPreview> {
    const editionId = crypto.randomUUID();
    if (aiEditing) {
      const runtime = this.developmentRuntime();
      if (!runtime)
        throw new ServiceUnavailableException(
          'Development AI editing is disabled',
        );
      development = (id) => developmentEditorialServices(runtime, id);
    }
    if (paidXSearch) {
      const runtime = this.developmentXRuntime();
      developmentPosts = (id) =>
        developmentXSelection(runtime, id, async (topicId) => {
          const [settings] = await this.orm
            .select()
            .from(xSearchTopicSettings)
            .where(eq(xSearchTopicSettings.topicId, topicId));
          return settings ?? null;
        });
    }
    return this.generateEdition(
      start,
      end,
      editionId,
      undefined,
      undefined,
      true,
      development?.(editionId),
      developmentPosts?.(editionId),
    );
  }
  private async generateEdition(
    start: Date,
    end: Date,
    runId: string,
    scheduledKey?: string,
    reportProgress?: ReportEditionProgress,
    testEdition = false,
    development?: ReturnType<typeof developmentEditorialServices>,
    developmentPosts?: DevelopmentPostSelection,
  ): Promise<DigestPreview> {
    const editorialServices = testEdition
      ? (development ?? null)
      : this.editorial;
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
                process.env.SYSTEM_OWNERSHIP === '1'
                  ? undefined
                  : eq(topicTable.profileId, profileId),
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
          const politics = topics.filter((topic) =>
            politicsTopicIds.includes(topic.id),
          );
          const preparePair = async () => {
            if (!editorialServices) return null;
            const pools = await Promise.all(
              politics.map(async (settings) => ({
                settings,
                candidates: await loadArticleCandidates(
                  client,
                  settings.id,
                  start,
                  end,
                ),
              })),
            );
            const result = await politicsStories(
              pools,
              editorialServices.triage,
              editorialServices.grouping,
              new Date(start),
              new Date(end),
              runId,
            );
            return result;
          };
          let pairedPromise: ReturnType<typeof preparePair> | undefined;
          const selections = await parallelTopics(topics, async (topic) => {
            const paired =
              politics.length === 2 && politicsTopicIds.includes(topic.id)
                ? await (pairedPromise ??= preparePair())
                : null;
            const ownershipUnavailable =
              politics.length === 2 &&
              politicsTopicIds.includes(topic.id) &&
              !paired;
            // Limit candidate work per topic, selecting the most recent 200 in the exact window.
            const candidates =
              paired && politicsTopicIds.includes(topic.id)
                ? paired.candidates
                : await loadArticleCandidates(client, topic.id, start, end);
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
            let stories: DigestPreview['topics'][number]['stories'] =
              ownershipUnavailable
                ? []
                : rank(eligible, start, end, topic.story_budget).map(
                    (story) => ({
                      ...story,
                      reasons: [
                        ...story.reasons,
                        assessRelevance(story, policy).reason,
                      ],
                    }),
                  );
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
              reason: ownershipUnavailable
                ? 'Stories withheld: exclusive World/U.S. ownership unavailable within caps.'
                : topic.story_budget === 0
                  ? 'Non-AI ranking: topic story budget is zero.'
                  : 'Non-AI ranking: editorial service unavailable.',
            };
            if (
              editorialServices &&
              topic.story_budget > 0 &&
              !ownershipUnavailable
            ) {
              const { topic: context, candidates: triageCandidates } =
                articleTriageInput(topic, candidates);
              const triage =
                paired?.scores.get(topic.id) ??
                (await editorialServices.triage.score(
                  context,
                  triageCandidates,
                  runId,
                ));
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
                  undefined,
                  40,
                );
                await topicStage(topic.id, 'editing');
                const matches = paired?.ranked.has(topic.id)
                  ? undefined
                  : await groupShortlist(
                      editorialServices.grouping,
                      topic.id,
                      shortlist,
                      runId,
                    );
                const ranked =
                  paired?.ranked.get(topic.id) ??
                  rank(shortlist, start, end, 10, matches);
                const evidence = editorEvidence(
                  ranked,
                  candidates,
                  topic.name.trim().toLowerCase() === 'tech',
                );
                const result = await editorialServices.editor.edit(
                  context,
                  evidence.candidates,
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
                      evidence: evidence.cited(edit.evidenceIds),
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
                } else {
                  stories = paired?.ranked.has(topic.id)
                    ? paired.ranked.get(topic.id)!.slice(0, topic.story_budget)
                    : scoredFallback(
                        shortlist,
                        start,
                        end,
                        topic.story_budget,
                        matches,
                      );
                  relevanceRejectedCount = candidates.filter(
                    (c) =>
                      !qualityRejection(c) &&
                      !shortlist.some((s) => s.id === c.id),
                  ).length;
                  editorial.reason =
                    'Unedited source excerpts in complete triage importance order: editor unavailable or validation exhausted.';
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
            const isolatedPosts =
              testEdition && developmentPosts && topic.post_budget > 0
                ? await developmentPosts({
                    topicId: topic.id,
                    name: topic.name,
                    guidance: `${topic.include_guidance}\nExclude: ${topic.exclude_guidance}`,
                    policy,
                    start: new Date(start),
                    end: new Date(end),
                    budget: Number(topic.post_budget),
                  })
                : undefined;
            const posts: SelectedSocialPost[] = isolatedPosts
              ? structuredClone(isolatedPosts.posts)
              : await selectTopicPosts(
                  client,
                  topic.id,
                  policy,
                  start,
                  end,
                  Number(topic.post_budget),
                );
            posts.push(...redditPosts);
            const postCandidates: SelectedSocialPost[] = isolatedPosts
              ? structuredClone(isolatedPosts.candidates)
              : topic.post_budget > 0
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
              editorialServices,
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
              editorialServices,
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
                coveredStories:
                  topic.name.trim().toLowerCase() === 'tech'
                    ? stories.slice(0, 10).map(({ title, summary }) => ({
                        title,
                        summary: summary ?? '',
                      }))
                    : undefined,
                runId,
              },
            );
            if (bluesky.evidence.postsPicked > 0) {
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
              blueskySelection: bluesky.evidence,
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
            ...newEditionPublication(
              testEdition ? 'test' : scheduledKey ? 'scheduled' : 'manual',
              scheduledKey ?? null,
              new Date(snapshot.createdAt),
            ),
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
