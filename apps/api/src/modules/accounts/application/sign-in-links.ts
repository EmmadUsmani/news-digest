import type { ReaderIdentityRepository } from '../domain/identity';
import type { RecipientCoordination } from '../domain/recipient-coordination';
import type { SessionTokens } from '../domain/session';
import type { SignInLinkRepository } from '../domain/sign-in-link';
import { normalizeEmail } from './login-codes';
import type { ReaderSessions } from './sessions';

const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const DAY_MS = 86_400_000;

// Prepared only: no routes or runtime registration yet.
// The eventual HTTP adapter must apply the account request boundary to POSTs
// and display a confirmation button on GET without calling this service.
export class SignInLinks {
  constructor(
    private readonly repository: SignInLinkRepository,
    private readonly tokens: SessionTokens,
    private readonly identities: ReaderIdentityRepository,
    private readonly sessions: Pick<
      ReaderSessions,
      'authenticate' | 'issueVerifiedIdentity'
    >,
    private readonly recipients: RecipientCoordination,
  ) {}

  async issue(adminToken: string, recipient: string, now: Date) {
    if (!TOKEN.test(adminToken)) return null;
    const email = normalizeEmail(recipient);
    if (!email) return null;
    return this.recipients.run(email, async () => {
      // Recheck the issuer after waiting: revocation or an admin-policy change
      // must prevent a queued invitation from being written.
      const admin = await this.sessions.authenticate(adminToken, now);
      if (!admin?.isAdmin) return null;
      const token = this.tokens.generate();
      const expiresAt = new Date(now.getTime() + DAY_MS);
      await this.repository.issueWithAudit(
        {
          email,
          tokenHash: this.tokens.hash(token),
          createdAt: now,
          expiresAt,
        },
        admin.userId,
      );
      // Return only after both the audit and hashed link are durably written.
      // The eventual URL carries this secret in its fragment, not its query.
      return { token, expiresAt };
    });
  }

  async redeem(method: string, token: string, now: Date) {
    if (method !== 'POST' || !TOKEN.test(token)) return null;
    const hash = this.tokens.hash(token);
    const email = await this.repository.findRecipient(hash, now);
    if (!email) return null;
    return this.recipients.run(email, async () => {
      // Lookup only selects the lock. Deletion or another redemption while
      // waiting must prevent identity/session creation.
      if ((await this.repository.consume(hash, now)) !== email) return null;
      const userId = await this.identities.findOrCreateVerified(email, now);
      // A failed identity/session write leaves the link consumed: fail closed.
      return this.sessions.issueVerifiedIdentity(userId, email, now);
    });
  }
}
