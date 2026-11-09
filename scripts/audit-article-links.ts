// Full stored canonical-link inventory. No URL values leave this process.
// GET pages sample only a topic/window; use a read-only snapshot for completeness.
import { database } from '../apps/api/src/libs/db/connections';
import { logger } from '../apps/api/src/libs/observability/logging';
import { inventoryArticleLinks } from './lib/article-link-inventory';

async function main() {
  logger.level = 'silent';
  const db = database();
  try {
    const counts = await inventoryArticleLinks(db);
    console.log(
      JSON.stringify({
        checkedAt: new Date().toISOString(),
        scope: 'all-stored-canonical-article-links',
        counts,
        publicationDecision: 'not-established',
      }),
    );
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error(
    'Article link inventory failed; no stored values were reported',
  );
  process.exitCode = 1;
});
