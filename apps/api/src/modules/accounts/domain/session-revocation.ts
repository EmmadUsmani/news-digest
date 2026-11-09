export abstract class SessionRevocationRepository {
  // In one transaction, lock and recheck the issuer's active session, its
  // original admin eligibility, current allowlist and age < seven days.
  // Delete the target's sessions and audit the authenticated issuer and stored
  // target email. Audit failure must roll back deletion. Missing/unauthorized
  // issuers and unknown targets return null without writing anything.
  abstract revokeWithAudit(input: {
    issuerTokenHash: string;
    targetUserId: string;
    adminEmails: readonly string[];
    now: Date;
  }): Promise<{ revoked: number } | null>;
}
