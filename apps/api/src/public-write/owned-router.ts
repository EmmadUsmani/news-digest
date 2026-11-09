import type { Pool } from 'pg';

import { prepareStoredPublicWriteRouter } from './storage-router';

type StoredOptions = Parameters<typeof prepareStoredPublicWriteRouter>[0];

// Uninstalled preparation for a Nest-owned runtime. Authorization resources
// remain caller-owned; this runtime owns only the source and topic writers' shared pool.
export async function prepareOwnedPublicWriteRouter(options: StoredOptions) {
  let pool: Pool | undefined;
  let closing: Promise<void> | undefined;
  const close = () => (closing ??= pool ? pool.end() : Promise.resolve());
  try {
    const middleware = prepareStoredPublicWriteRouter({
      ...options,
      pool: () => (pool ??= options.pool()),
    });
    return { middleware, close };
  } catch (error) {
    // Source or authorization construction may fail after acquiring storage.
    // Never leave that connection pool alive after failed startup.
    try {
      await close();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        'Public write startup and cleanup failed',
      );
    }
    throw error;
  }
}
