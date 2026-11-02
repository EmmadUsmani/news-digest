// Explicit free check: one request per configured public river; no inference or X access.
import { SharedHttpClient } from '../src/libs/ports/http.client';
import { RiverDiscovery } from '../src/modules/social/adapters/river-discovery';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';

async function main() {
  const repository = new PostgresSocialRepository();
  const adapter = new RiverDiscovery(new SharedHttpClient());
  try {
    for (const source of await repository.discoverySources()) {
      try {
        const links = await adapter.collect(source.url);
        await repository.discovered(source.id, links);
        console.log(
          JSON.stringify({ source: source.id, citations: links.length }),
        );
      } catch {
        await repository.discoveryFailed(source.id);
        console.log(
          JSON.stringify({ source: source.id, error: 'Discovery failed' }),
        );
        process.exitCode = 1;
      }
    }
  } finally {
    await repository.db.end();
  }
}
void main().catch(() => {
  console.error('River harvesting failed');
  process.exitCode = 1;
});
