import type { ReaderIdentityRepository } from '../domain/identity';
import type { LoginCodes } from './login-codes';
import type { ReaderSessions } from './sessions';

// Prepared only: no HTTP route or runtime module registers this exchange.
export class LoginExchange {
  constructor(
    private readonly codes: LoginCodes,
    private readonly identities: ReaderIdentityRepository,
    private readonly sessions: ReaderSessions,
  ) {}

  async redeem(email: string, code: string, client: string, now: Date) {
    const verifiedEmail = await this.codes.redeem(email, code, client, now);
    if (!verifiedEmail) return null;
    const userId = await this.identities.findOrCreateVerified(
      verifiedEmail,
      now,
    );
    // Use only the identity proven by the consumed challenge, never caller IDs
    // or caller-supplied admin eligibility. Failures require a fresh code.
    return this.sessions.issueVerifiedIdentity(userId, verifiedEmail, now);
  }
}
