import type { ContentRepository, SourcePort } from './domain/ports';
export async function ingest(
  repository: ContentRepository,
  adapters: Record<'feed' | 'hn', SourcePort>,
  sourceId: string,
) {
  const source = (await repository.sources()).find((s) => s.id === sourceId);
  if (!source) return;
  try {
    const items = await adapters[source.kind].collect(source);
    if (!items.length) throw new Error('Source returned no usable dated items');
    await repository.store(source, items);
    return { source: source.id, items: items.length };
  } catch (error) {
    // Persist only controlled adapter messages; never response bodies or credentials.
    const message =
      error instanceof Error &&
      /^(HTTP \d+|Empty response|Response exceeds 3 MB|Invalid XML feed|Unsupported feed document|Invalid Hacker News list|Source returned no usable dated items)$/.test(
        error.message,
      )
        ? error.message
        : 'Source collection failed';
    await repository.failed(source, message);
    throw new Error(message);
  }
}
