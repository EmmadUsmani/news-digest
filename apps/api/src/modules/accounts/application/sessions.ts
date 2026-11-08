import type { SessionRepository, SessionTokens } from '../domain/session';

const DAY_MS = 86_400_000;
const ADMIN_FRESHNESS_MS = 7 * DAY_MS;
const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;

export class ReaderSessions {
  constructor(
    private readonly repository: SessionRepository,
    private readonly tokens: SessionTokens,
    private readonly adminEmails: ReadonlySet<string>,
  ) {}

  // Only the future verified code/link exchange may call this method. Never
  // accept the identity or admin eligibility directly from a request body.
  async issueVerifiedIdentity(userId: string, email: string, now: Date) {
    const token = this.tokens.generate();
    const session = await this.repository.create({
      userId,
      tokenHash: this.tokens.hash(token),
      adminEligible: this.adminEmails.has(email),
      now,
    });
    return { sessionId: session.id, cookie: sessionCookie(token) };
  }

  async authenticate(token: string, now: Date) {
    if (!TOKEN_FORMAT.test(token)) return null;
    const session = await this.repository.findByTokenHash(
      this.tokens.hash(token),
    );
    if (!session || session.createdAt.getTime() > now.getTime()) return null;
    const age = now.getTime() - session.createdAt.getTime();
    const shouldRenew =
      now.getTime() - session.cookieRenewedAt.getTime() >= DAY_MS;
    const renewed =
      shouldRenew &&
      (await this.repository.claimCookieRenewal(
        session.id,
        new Date(now.getTime() - DAY_MS),
        now,
      ));
    return {
      userId: session.userId,
      sessionId: session.id,
      isAdmin:
        session.adminEligible &&
        age < ADMIN_FRESHNESS_MS &&
        this.adminEmails.has(session.email),
      cookie: renewed ? sessionCookie(token) : null,
    };
  }

  async signOut(token: string) {
    if (TOKEN_FORMAT.test(token))
      await this.repository.deleteByTokenHash(this.tokens.hash(token));
    return clearSessionCookie();
  }

  async signOutAllDevices(userId: string) {
    await this.repository.deleteByUserId(userId);
    return clearSessionCookie();
  }
}

function sessionCookie(token: string) {
  return `__Host-reader_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE_SECONDS}`;
}

function clearSessionCookie() {
  return '__Host-reader_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}
