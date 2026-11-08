export interface ReaderSession {
  id: string;
  userId: string;
  email: string;
  tokenHash: string;
  adminEligible: boolean;
  createdAt: Date;
  cookieRenewedAt: Date;
}

export abstract class SessionRepository {
  abstract create(input: {
    userId: string;
    tokenHash: string;
    adminEligible: boolean;
    now: Date;
  }): Promise<ReaderSession>;
  abstract findByTokenHash(hash: string): Promise<ReaderSession | null>;
  // Atomically update only if cookie_renewed_at <= cutoff. Return false if
  // another visit already renewed it, or the session has been revoked.
  abstract claimCookieRenewal(
    id: string,
    cutoff: Date,
    now: Date,
  ): Promise<boolean>;
  abstract deleteByTokenHash(hash: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}

export abstract class SessionTokens {
  abstract generate(): string;
  abstract hash(token: string): string;
}
