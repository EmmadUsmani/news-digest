import type { ArticleDiscoveryRepository } from '../domain/article-discovery.port';
import type { RiverDiscoveryPort } from '../domain/collection.port';

// Explicit bounded pass, not recursive crawling. A failed host stops for this pass.
export async function collectArticleLinks(
  repository: ArticleDiscoveryRepository,
  pages: RiverDiscoveryPort,
) {
  const result = { checked: 0, citations: 0, errors: 0 };
  const blocked = new Set<string>();
  for (const article of (await repository.candidates()).slice(0, 8)) {
    let url: URL;
    try {
      url = new URL(article.url);
    } catch {
      continue;
    }
    if (
      url.protocol !== 'https:' ||
      url.hostname !== article.host ||
      url.username ||
      url.password ||
      url.port ||
      blocked.has(article.host)
    )
      continue;
    let links;
    try {
      links = await pages.collect(article.url);
    } catch {
      blocked.add(article.host);
      await repository.record(article, null);
      result.errors++;
      continue;
    }
    await repository.record(article, links);
    result.checked++;
    result.citations += links.length;
  }
  return result;
}
