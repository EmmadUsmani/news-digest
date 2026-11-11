import type { ReaderIdentityRepository } from '../domain/identity';
import type { LoginCodes } from './login-codes';
import type { ReaderSessions } from './sessions';

export class LoginExchange {
  constructor(
    private readonly codes: Pick<LoginCodes, 'redeemAndThen'>,
    private readonly identities: ReaderIdentityRepository,
    private readonly sessions: Pick<ReaderSessions, 'issueVerifiedIdentity'>,
  ) {}

  async redeem(email: string, code: string, client: string, now: Date) {
    return this.codes.redeemAndThen(
      email,
      code,
      client,
      now,
      async (verifiedEmail) => {
        const userId = await this.identities.findOrCreateVerified(
          verifiedEmail,
          now,
        );
        // Use only the identity proven by the consumed challenge, never caller IDs
        // or caller-supplied admin eligibility. Failures require a fresh code.
        return this.sessions.issueVerifiedIdentity(
          userId,
          verifiedEmail,
          now,
          'mailbox-code',
        );
      },
    );
  }
}
