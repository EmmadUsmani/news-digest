export interface SignInLink {
  email: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export abstract class SignInLinkRepository {
  // Insert the link and its issuance audit in one transaction. Audit records
  // identify the authenticated issuer; neither row stores the bearer token.
  abstract issueWithAudit(
    link: SignInLink,
    issuerUserId: string,
  ): Promise<void>;
  // Atomically consume once, only when createdAt <= now < expiresAt. Return
  // the stored recipient, never an identity supplied by the redeeming client.
  abstract consume(tokenHash: string, now: Date): Promise<string | null>;
}
