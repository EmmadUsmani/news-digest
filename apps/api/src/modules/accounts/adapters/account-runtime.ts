import { createHmac } from 'node:crypto';

import type { Redis } from 'ioredis';

import { AdminSessionRevocation } from '../application/admin-session-revocation';
import { DeleteAccount } from '../application/delete-account';
import { LoginCodes } from '../application/login-codes';
import { LoginExchange } from '../application/login-exchange';
import { ReaderSessions } from '../application/sessions';
import { SignInLinks } from '../application/sign-in-links';
import { SignupPolicy } from '../application/signup-policy';
import type {
  AccountDeletionCleanup,
  AccountDeletionRepository,
} from '../domain/account-deletion';
import type { ReaderIdentityRepository } from '../domain/identity';
import type { LoginCodeRepository } from '../domain/login-code';
import type { ReaderSyncRepository } from '../domain/reader-sync';
import type { RecipientCoordination } from '../domain/recipient-coordination';
import type { SessionRepository } from '../domain/session';
import type { SessionRevocationRepository } from '../domain/session-revocation';
import type { SignInLinkRepository } from '../domain/sign-in-link';
import { AccountHandlers } from './account-handlers';
import { AccountRequestBoundary } from './account-request';
import { FileLoginCodeDelivery } from './file-login-code-delivery';
import { CryptoLoginCodeSecrets } from './login-code-secrets';
import { RedisLoginCodeAdmission } from './redis-login-code-admission';
import { RedisPreferenceAdmission } from './redis-preference-admission';
import { CryptoSessionTokens } from './session-tokens';

type Dependencies = {
  deletion: AccountDeletionRepository;
  sync: ReaderSyncRepository;
  recipients: RecipientCoordination;
  identities: ReaderIdentityRepository;
  codes: LoginCodeRepository;
  sessions: SessionRepository;
  links: SignInLinkRepository;
  revocation: SessionRevocationRepository;
  cache: Pick<Redis, 'eval'>;
  existingIdentity: (email: string) => Promise<boolean>;
};

// Account composition is installed only behind the default-off account gate.
// A lazy dependency factory keeps the disabled path free of DB/Redis resources.
export function prepareAccountHandlers(
  env: Readonly<Record<string, string | undefined>>,
  dependencies: (cleanup: AccountDeletionCleanup) => Dependencies,
): AccountHandlers | null {
  const enabled = env.ACCOUNTS_ENABLED ?? '0';
  if (enabled !== '0' && enabled !== '1')
    throw new Error('Invalid accounts enable flag');
  if (enabled === '0') return null;

  const boundary = new AccountRequestBoundary(env.ACCOUNT_ORIGIN ?? '');
  const key = env.ACCOUNT_SECRET_KEY ?? '';
  if (!/^[a-fA-F0-9]{64}$/.test(key))
    throw new Error('Account secret requires 32 hex-encoded bytes');
  const admins = (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (
    admins.some(
      (email) =>
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254,
    )
  )
    throw new Error('Invalid account admin allowlist');
  const adminEmails = new Set(admins);
  // Validate policy and mailbox before creating external-system dependencies.
  const mode = env.SIGNUP_MODE ?? 'off';
  new SignupPolicy(mode, 'stand-in', () => Promise.resolve(false), adminEmails);
  const delivery = new FileLoginCodeDelivery(env.ACCOUNT_MAILBOX_PATH ?? '');
  const ports = dependencies(delivery);
  const policy = new SignupPolicy(
    mode,
    'stand-in',
    ports.existingIdentity,
    adminEmails,
  );
  const derive = (purpose: string) =>
    createHmac('sha256', Buffer.from(key, 'hex')).update(purpose).digest();
  const codes = new LoginCodes(
    ports.codes,
    new CryptoLoginCodeSecrets(derive('login-code-v1')),
    delivery,
    new RedisLoginCodeAdmission(
      ports.cache,
      derive('login-admission-v1').toString('hex'),
      (email) => policy.eligible(email),
    ),
    ports.recipients,
  );
  const sessions = new ReaderSessions(
    ports.sessions,
    new CryptoSessionTokens(),
    adminEmails,
  );
  return new AccountHandlers(
    boundary,
    codes,
    new LoginExchange(codes, ports.identities, sessions),
    sessions,
    new SignInLinks(
      ports.links,
      new CryptoSessionTokens(),
      ports.identities,
      sessions,
      ports.recipients,
      (email) => policy.eligibleForLink(email),
    ),
    new DeleteAccount(ports.deletion, new CryptoSessionTokens()),
    ports.sync,
    new AdminSessionRevocation(
      ports.revocation,
      new CryptoSessionTokens(),
      adminEmails,
    ),
    new RedisPreferenceAdmission(
      ports.cache,
      derive('preference-admission-v1').toString('hex'),
    ),
  );
}
