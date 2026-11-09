import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import { contentSources } from '../../../libs/db/schema';

// Preparation only. Select configured catalog fields explicitly; HTTP projects
// URLs to origins. The caller owns the pool and no legacy profile is needed.
export class PublicSourcesReader {
  constructor(private readonly pool: Pool) {}

  read() {
    return drizzle(this.pool)
      .select({
        id: contentSources.id,
        name: contentSources.name,
        url: contentSources.url,
      })
      .from(contentSources)
      .orderBy(contentSources.name, contentSources.id);
  }
}
