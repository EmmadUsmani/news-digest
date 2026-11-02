import type { ArticleDiscoveryRepository } from '../domain/article-discovery.port';
import type {
  RiverDiscoveryPort,
  SocialCollectionRepository,
} from '../domain/collection.port';
import type { PostVerificationPort } from '../domain/posts';
import { collectArticleLinks } from './collect-article-links';
import { verifyPosts } from './verify-posts';

export async function collectSocial(
  repository: SocialCollectionRepository,
  rivers: RiverDiscoveryPort,
  embeds: PostVerificationPort,
  articles: ArticleDiscoveryRepository,
) {
  const result = {
    sources: 0,
    citations: 0,
    discoveryErrors: 0,
    verified: 0,
    verificationErrors: 0,
  };
  for (const source of await repository.discoverySources()) {
    let links;
    try {
      links = await rivers.collect(source.url);
    } catch {
      await repository.discoveryFailed(source.id);
      result.discoveryErrors++;
      continue;
    }
    await repository.discovered(source.id, links);
    result.sources++;
    result.citations += links.length;
  }
  // Harvest before verification so newly cited posts can be checked in this pass.
  const articleDiscovery = await collectArticleLinks(articles, rivers);
  await repository.refreshMissingTimes();
  const verification = await verifyPosts(
    repository,
    embeds,
    await repository.candidates(10),
  );
  result.verified = verification.verified;
  result.verificationErrors = verification.verificationErrors;
  return { ...result, articleDiscovery };
}
