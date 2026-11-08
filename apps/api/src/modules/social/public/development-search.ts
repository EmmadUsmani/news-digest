import type { XSearchPort, XSearchRequest } from '../domain/x-search.port';

type SearchResult = Awaited<ReturnType<XSearchPort['search']>>;
interface DevelopmentSearchRuntime {
  search(
    request: XSearchRequest,
    attemptId: string,
  ): Promise<
    | { status: 'disabled' | 'replay' }
    | { status: 'budget-refused'; mustReport: boolean }
    | { status: 'complete'; value: SearchResult; mustReport: boolean }
  >;
}

/** Per-test-edition search port. Serialize topics so a stopped pool cannot
 * admit another queued call. Results remain local: no production discovery
 * repository, cache, ledger or retry path is used here.
 */
export function developmentSearch(
  runtime: DevelopmentSearchRuntime,
  editionId: string,
): XSearchPort {
  if (!editionId.trim()) throw new Error('Missing development edition ID');
  let sequence = 0;
  let stopped = false;
  let pending: Promise<unknown> = Promise.resolve();
  return {
    search(request) {
      const attemptId = `${editionId}:search:${++sequence}`;
      const result = pending.then(async () => {
        if (stopped) throw new Error('Development X search stopped');
        try {
          const outcome = await runtime.search(request, attemptId);
          if (outcome.status !== 'complete')
            throw new Error('Development X search stopped: ' + outcome.status);
          if (outcome.mustReport)
            throw new Error('Development X search stopped: report required');
          if (outcome.value.execution === 'unconfirmed')
            throw new Error('Development X search stopped: unconfirmed');
          return outcome.value;
        } catch (error) {
          stopped = true;
          throw error;
        }
      });
      // Keep the queue usable after rejection; the stop latch rejects followers
      // without sending another request, preserving the original caller's error.
      pending = result.catch(() => undefined);
      return result;
    },
  };
}
