import { and, eq, isNotNull, isNull, lte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { digestPreviews, weeklyPublications } from '../../../libs/db/schema';
import { editorialServices } from '../../curation/public/editorial';
import {
  generateWeeklyReview,
  type WeeklyPublication,
  type WeeklyPublicationStore,
} from '../application/generate-weekly-review';
import { WeeklyReviewEditor } from '../application/weekly-review-editor';
import { weeklyReviewInput } from '../domain/weekly-review-input';

/** Dedicated storage keeps weekly snapshots out of every daily latest/history query. */
export class PostgresWeeklyPublicationStore implements WeeklyPublicationStore {
  readonly db = database();
  private readonly orm = drizzle(this.db);
  constructor(
    private readonly inputs: Pick<WeeklyPublicationStore, 'weeklyReviewInput'>,
    private readonly editorial: (
      db: typeof this.db,
    ) => Pick<
      NonNullable<ReturnType<typeof editorialServices>>,
      'weeklyLlm' | 'weeklyModel'
    > | null = editorialServices,
  ) {}

  /** Production entry point; editor construction stays lazy so prerequisites,
   * quiet topics and saved retries never need credentials or provider calls. */
  generate(request: Parameters<typeof generateWeeklyReview>[2]) {
    return generateWeeklyReview(
      this,
      {
        edit: async (topic, input, runId) => {
          const services = this.editorial(this.db);
          if (!services) return null;
          return new WeeklyReviewEditor(
            services.weeklyLlm,
            services.weeklyModel,
          ).edit(topic, input, runId);
        },
      },
      request,
    );
  }

  weeklyReviewInput(target: Parameters<typeof weeklyReviewInput>[1]) {
    return this.inputs.weeklyReviewInput(target);
  }

  async find(generationKey: string): Promise<WeeklyPublication | null> {
    const [row] = await this.orm
      .select({ snapshot: weeklyPublications.snapshot })
      .from(weeklyPublications)
      .where(eq(weeklyPublications.generationKey, generationKey))
      .limit(1);
    return (row?.snapshot as WeeklyPublication | undefined) ?? null;
  }

  async sundayDailyPublished(
    target: Parameters<WeeklyPublicationStore['sundayDailyPublished']>[0],
  ) {
    const bounds = weeklyReviewInput([], { ...target, topicId: '' });
    const dailyEnd = new Date(
      Date.parse(bounds.windowEnd) - 2 * 60 * 60 * 1000,
    ).toISOString();
    const [row] = await this.orm
      .select({ id: digestPreviews.id })
      .from(digestPreviews)
      .where(
        and(
          target.profileId === null
            ? isNull(digestPreviews.profileId)
            : eq(digestPreviews.profileId, target.profileId),
          eq(digestPreviews.kind, 'scheduled'),
          eq(digestPreviews.windowEnd, dailyEnd),
          isNotNull(digestPreviews.publishedAt),
          lte(digestPreviews.publishedAt, bounds.windowEnd),
        ),
      )
      .limit(1);
    return !!row;
  }

  async publish(
    generationKey: string,
    snapshot: WeeklyPublication,
  ): Promise<WeeklyPublication> {
    await this.orm
      .insert(weeklyPublications)
      .values({
        id: snapshot.id,
        generationKey,
        profileId: snapshot.profileId,
        windowStart: snapshot.windowStart,
        windowEnd: snapshot.windowEnd,
        snapshot,
      })
      .onConflictDoNothing({ target: weeklyPublications.generationKey });
    const saved = await this.find(generationKey);
    if (!saved) throw new Error('Weekly publication not saved');
    return saved;
  }
}
