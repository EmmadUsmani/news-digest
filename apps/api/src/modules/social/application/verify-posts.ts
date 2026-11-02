import type { SocialCollectionRepository } from '../domain/collection.port';
import type { PostVerificationPort } from '../domain/posts';

// Both hourly collection and pre-edition search use the same bounded, no-burst
// verification policy. Repository candidates enforce the persisted cooldown.
export async function verifyPosts(
  repository: Pick<
    SocialCollectionRepository,
    'verificationUrl' | 'store' | 'checked'
  >,
  embeds: PostVerificationPort,
  candidates: string[],
) {
  const result = { verified: 0, verificationErrors: 0 };
  for (const id of [...new Set(candidates)].slice(0, 10)) {
    let post;
    try {
      post = await embeds.verify(id, await repository.verificationUrl(id));
    } catch {
      await repository.checked(id, 'Official embed unavailable or invalid');
      result.verificationErrors++;
      break;
    }
    await repository.store(post);
    await repository.checked(id, null);
    result.verified++;
  }
  return result;
}
