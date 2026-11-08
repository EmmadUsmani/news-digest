import type { ReaderIdentityRepository } from '../domain/identity';
import type { RecipientCoordination } from '../domain/recipient-coordination';
import { type LoginCodes, normalizeEmail } from './login-codes';
import type { ReaderSessions } from './sessions';

// Prepared only: no HTTP route or runtime module registers this exchange.
export class LoginExchange {
  constructor(
    private readonly codes: Pick<LoginCodes, 'redeem'>,
    private readonly identities: ReaderIdentityRepository,
    private readonly sessions: Pick<ReaderSessions, 'issueVerifiedIdentity'>,
    private readonly recipients: RecipientCoordination,
  ) {}

  async redeem(email: string, code: string, client: string, now: Date) {
    const recipient = normalizeEmail(email);
    if (!recipient) return null;
    return this.recipients.run(recipient, async () => {
      const verifiedEmail = await this.codes.redeem(email, code, client, now);
      if (!verifiedEmail) return null;
      const userId = await this.identities.findOrCreateVerified(
        verifiedEmail,
        now,
      );
      // Use only the identity proven by the consumed challenge, never caller IDs
      // or caller-supplied admin eligibility. Failures require a fresh code.
      return this.sessions.issueVerifiedIdentity(userId, verifiedEmail, now);
    });
  }
}
