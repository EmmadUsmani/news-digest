import type { SessionTokens } from '../domain/session';
import type { SessionRevocationRepository } from '../domain/session-revocation';

// Prepared only. No HTTP route or runtime registration enables this operation.
export class AdminSessionRevocation {
  constructor(
    private readonly repository: SessionRevocationRepository,
    private readonly tokens: SessionTokens,
    private readonly adminEmails: ReadonlySet<string>,
  ) {}

  async revoke(token: string, targetUserId: string, now: Date) {
    if (
      !/^[A-Za-z0-9_-]{43}$/.test(token) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        targetUserId,
      ) ||
      !Number.isFinite(now.getTime())
    )
      return null;
    return this.repository.revokeWithAudit({
      issuerTokenHash: this.tokens.hash(token),
      targetUserId,
      adminEmails: [...this.adminEmails],
      now,
    });
  }
}
