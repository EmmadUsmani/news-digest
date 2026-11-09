import type { database } from '../../apps/api/src/libs/db/connections';
import { articleLinkCounts, countArticleLink } from './article-link-audit';

export async function inventoryArticleLinks(pool: ReturnType<typeof database>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    try {
      await client.query("SET LOCAL statement_timeout = '15s'");
      await client.query(
        'DECLARE article_links NO SCROLL CURSOR FOR SELECT canonical_url FROM content_items ORDER BY id',
      );
      const counts = articleLinkCounts();
      for (;;) {
        const { rows } = await client.query<{ canonical_url: unknown }>(
          'FETCH FORWARD 1000 FROM article_links',
        );
        if (!rows.length) return counts;
        for (const row of rows) countArticleLink(counts, row.canonical_url);
      }
    } finally {
      await client.query('ROLLBACK');
    }
  } finally {
    client.release();
  }
}
