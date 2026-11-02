import type {
  RiverDiscoveryPort,
  SocialCollectionRepository,
} from '../domain/collection.port';
import type { PostVerificationPort } from '../domain/posts';

export async function collectSocial(
  repository: SocialCollectionRepository,
  rivers: RiverDiscoveryPort,
  embeds: PostVerificationPort,
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
  await repository.refreshMissingTimes();
  // At most ten official requests per hourly pass, with persisted one-day cooldown.
  for (const id of await repository.candidates(10)) {
    let post;
    try {
      post = await embeds.verify(id, await repository.verificationUrl(id));
    } catch {
      await repository.checked(id, 'Official embed unavailable or invalid');
      result.verificationErrors++;
      // Stop at the first unavailable/invalid response. No automatic retry burst.
      break;
    }
    await repository.store(post);
    await repository.checked(id, null);
    result.verified++;
  }
  return result;
}
