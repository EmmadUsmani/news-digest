import { prepareAccessStack } from './access-stack';
import { prepareAccountPublicWriteRouter } from './account-router';

type WriteOptions = Parameters<typeof prepareAccountPublicWriteRouter>[0];
type StackOptions = Parameters<typeof prepareAccessStack>[0];

// Prepared for application ownership; mount middleware before body parsers.
// Accounts and the ordinary admission recorder remain caller-owned.
export async function prepareAccessRuntime(
  options: WriteOptions & {
    accountTransport: StackOptions['accounts'];
    legacyAccess: StackOptions['legacyAccess'];
  },
) {
  // Validate transport before acquiring storage, even if handlers exist.
  if (options.enabled && !options.accountTransport)
    throw new Error('Public access requires account transport');
  const writes = await prepareAccountPublicWriteRouter(options);
  try {
    const middleware = prepareAccessStack({
      publicMode: options.enabled,
      accounts: options.accountTransport,
      publicAccess: () => writes.middleware,
      legacyAccess: options.legacyAccess,
    });
    return { middleware, close: writes.close };
  } catch (error) {
    try {
      await writes.close();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        'Access startup and cleanup failed',
      );
    }
    throw error;
  }
}
