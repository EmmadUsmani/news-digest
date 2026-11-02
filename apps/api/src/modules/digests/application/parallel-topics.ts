// Keep topic order and drain in-flight work before the caller can roll back
// and release the shared snapshot transaction. Stop starting topics on failure.
export async function parallelTopics<T, R>(
  topics: readonly T[],
  generate: (topic: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(topics.length);
  let next = 0;
  let failed = false;
  let failure: unknown;
  await Promise.all(
    Array.from({ length: Math.min(4, topics.length) }, async () => {
      while (!failed && next < topics.length) {
        const index = next++;
        try {
          results[index] = await generate(topics[index]);
        } catch (error) {
          if (!failed) failure = error;
          failed = true;
        }
      }
    }),
  );
  if (failed) throw failure;
  return results;
}
