import { redis } from '../../../libs/db/connections';
import { PostgresAccountDeletionRepository } from '../database/account-deletion.repository';
import { PostgresReaderIdentityRepository } from '../database/identity.repository';
import { PostgresLoginCodeRepository } from '../database/login-code.repository';
import { PostgresReaderSyncRepository } from '../database/reader-sync.repository';
import { PostgresRecipientCoordination } from '../database/recipient-coordination';
import { PostgresSessionRepository } from '../database/session.repository';
import { PostgresSignInLinkRepository } from '../database/sign-in-link.repository';
import { prepareAccountHttp } from './account-bootstrap';

// Prepared for main registration; no resources open until configuration passes.
export function prepareStoredAccountHttp(
  env: Readonly<Record<string, string | undefined>>,
) {
  const disposers: (() => Promise<unknown>)[] = [];
  const middleware = prepareAccountHttp(env, (cleanup) => {
    const own = <T extends { onModuleDestroy(): Promise<void> }>(
      value: T,
    ): T => {
      disposers.push(() => value.onModuleDestroy());
      return value;
    };
    const recipients = own(new PostgresRecipientCoordination());
    const identities = own(new PostgresReaderIdentityRepository());
    const cache = redis();
    disposers.push(() => cache.quit());
    return {
      recipients,
      identities,
      cache,
      codes: own(new PostgresLoginCodeRepository()),
      sessions: own(new PostgresSessionRepository()),
      links: own(new PostgresSignInLinkRepository()),
      sync: own(new PostgresReaderSyncRepository()),
      deletion: own(new PostgresAccountDeletionRepository(cleanup, recipients)),
      existingIdentity: (email) => identities.exists(email),
    };
  });
  let closing: Promise<void> | undefined;
  return {
    middleware,
    close: () =>
      (closing ??= (async () => {
        const results = await Promise.allSettled(
          disposers.map((dispose) => dispose()),
        );
        const errors = results.filter((result) => result.status === 'rejected');
        if (errors.length)
          throw new AggregateError(
            errors.map((result): unknown => result.reason),
            'Account storage shutdown failed',
          );
      })()),
  };
}
