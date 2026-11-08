import type { ReaderIdentityRepository } from '../domain/identity';
import type { SessionTokens } from '../domain/session';
import type { SignInLinkRepository } from '../domain/sign-in-link';
import type { ReaderSessions } from './sessions';

const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const DAY_MS = 86_400_000;

// Prepared only: no routes, runtime registration or database adapter yet.
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
  ) {}

  async issue(adminToken: string, recipient: string, now: Date) {
    if (!TOKEN.test(adminToken)) return null;
    const admin = await this.sessions.authenticate(adminToken, now);
    if (!admin?.isAdmin) return null;
    const email = recipient.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return null;
    const token = this.tokens.generate();
    const expiresAt = new Date(now.getTime() + DAY_MS);
    await this.repository.issueWithAudit(
      { email, tokenHash: this.tokens.hash(token), createdAt: now, expiresAt },
      admin.userId,
    );
    // Return only after the audit and hashed link are durably written. The
    // eventual URL should carry this secret in its fragment, not its query.
    return { token, expiresAt };
  }

  async redeem(method: string, token: string, now: Date) {
    if (method !== 'POST' || !TOKEN.test(token)) return null;
    const email = await this.repository.consume(this.tokens.hash(token), now);
    if (!email) return null;
    const userId = await this.identities.findOrCreateVerified(email, now);
    // A failed identity/session write leaves the link consumed: fail closed.
    return this.sessions.issueVerifiedIdentity(userId, email, now);
  }
}
