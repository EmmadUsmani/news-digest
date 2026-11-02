// Explicit free check: up to eight recent opted-in publisher pages; no inference/X fetch.
import { SharedHttpClient } from '../src/libs/ports/http.client';
import { RiverDiscovery } from '../src/modules/social/adapters/river-discovery';
import { collectArticleLinks } from '../src/modules/social/application/collect-article-links';
import { PostgresArticleDiscoveryRepository } from '../src/modules/social/database/article-discovery.repository';

async function main() {
  const repository = new PostgresArticleDiscoveryRepository();
  try {
    console.log(
      JSON.stringify(
        await collectArticleLinks(
          repository,
          new RiverDiscovery(new SharedHttpClient()),
        ),
      ),
    );
  } finally {
    await repository.db.end();
  }
}
void main().catch(() => {
  console.error('Publisher link harvesting failed');
  process.exitCode = 1;
});
