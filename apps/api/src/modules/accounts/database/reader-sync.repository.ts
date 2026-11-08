import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { bookmarks, userHiddenTopics, users } from '../../../libs/db/schema';
import {
  mergeReaderSync,
  type ReaderBookmarkCopy,
  ReaderSyncRepository,
  type ReaderSyncState,
} from '../domain/reader-sync';

// Prepared only: no runtime or HTTP route registers this adapter.
@Injectable()
export class PostgresReaderSyncRepository
  extends ReaderSyncRepository
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  async merge(userId: string, incoming: unknown): Promise<ReaderSyncState> {
    // Validate and copy before waiting, so caller mutations cannot change work.
    const changes = mergeReaderSync(
      { version: 1, hiddenTopics: {}, bookmarks: {} },
      incoming,
    );
    return this.db.transaction(async (tx) => {
      // Lock a row that exists even before the reader's first sync. This also
      // serializes account deletion; a deleted identity cannot be recreated.
      const [owner] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .for('update');
      if (!owner) throw new Error('Reader identity unavailable');
      const topics = await tx
        .select()
        .from(userHiddenTopics)
        .where(eq(userHiddenTopics.userId, userId));
      const saved = await tx
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.userId, userId));
      const current: ReaderSyncState = {
        version: 1,
        hiddenTopics: Object.fromEntries(
          topics.map((row) => [
            row.topicId,
            {
              hidden: row.hidden,
              updatedAt: new Date(row.updatedAt).getTime(),
            },
          ]),
        ),
        bookmarks: Object.fromEntries(
          saved.map((row) => [
            row.itemKey,
            {
              copy: row.copy as ReaderBookmarkCopy | null,
              updatedAt: new Date(row.updatedAt).getTime(),
            },
          ]),
        ),
      };
      const merged = mergeReaderSync(current, changes);
      // Replace only this reader's bounded state inside the same transaction.
      await tx
        .delete(userHiddenTopics)
        .where(eq(userHiddenTopics.userId, userId));
      await tx.delete(bookmarks).where(eq(bookmarks.userId, userId));
      const topicRows = Object.entries(merged.hiddenTopics).map(
        ([topicId, change]) => ({
          userId,
          topicId,
          hidden: change.hidden,
          updatedAt: new Date(change.updatedAt).toISOString(),
        }),
      );
      const bookmarkRows = Object.entries(merged.bookmarks).map(
        ([itemKey, change]) => ({
          userId,
          itemKey,
          copy: change.copy,
          updatedAt: new Date(change.updatedAt).toISOString(),
        }),
      );
      if (topicRows.length) await tx.insert(userHiddenTopics).values(topicRows);
      if (bookmarkRows.length) await tx.insert(bookmarks).values(bookmarkRows);
      return merged;
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
