// Explicit free live check: at most ten official oEmbed requests; no inference.
// Stop on transport failures; the shared client respects Retry-After.
import { SharedHttpClient } from '../src/libs/ports/http.client';
import { XOfficialEmbed } from '../src/modules/social/adapters/x-oembed';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';

async function main() {
  const repository = new PostgresSocialRepository();
  const adapter = new XOfficialEmbed(new SharedHttpClient());
  let verified = 0;
  let failed = 0;
  try {
    for (const id of await repository.candidates(10)) {
      let post;
      try {
        post = await adapter.verify(id, await repository.verificationUrl(id));
      } catch (error) {
        await repository.checked(id, 'Official embed unavailable or invalid');
        failed++;
        if (
          error instanceof Error &&
          /^(HTTP \d+|Empty response|Response exceeds 2 MB)$/.test(
            error.message,
          )
        ) {
          console.log(JSON.stringify({ stopped: error.message }));
          break;
        }
        continue;
      }
      await repository.store(post);
      await repository.checked(id, null);
      verified++;
    }
    console.log(JSON.stringify({ verified, failed }));
  } finally {
    await repository.db.end();
  }
}
void main().catch(() => {
  console.error('Embed verification failed');
  process.exitCode = 1;
});
