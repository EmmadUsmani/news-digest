import type { LoginCodes } from '../application/login-codes';
import type { LoginExchange } from '../application/login-exchange';
import type { ReaderSessions } from '../application/sessions';
import type { AccountRequestBoundary } from './account-request';

type Request = {
  origin: unknown;
  contentType: unknown;
  body: unknown;
  cookie: unknown;
};

// Prepared transport orchestration; intentionally unregistered. The eventual
// HTTP adapter must supply a client key from a verified proxy boundary.
export class AccountHandlers {
  constructor(
    private readonly boundary: AccountRequestBoundary,
    private readonly codes: Pick<LoginCodes, 'request'>,
    private readonly exchange: Pick<LoginExchange, 'redeem'>,
    private readonly sessions: Pick<
      ReaderSessions,
      'authenticate' | 'signOut' | 'signOutAllDevices'
    >,
  ) {}

  async requestCode(request: Request, client: string, now: Date) {
    const payload = this.payload(request, false);
    if (!payload) return { status: 400, body: { error: 'Invalid request' } };
    await this.codes.request(payload.email, client, now);
    return { status: 202, body: { accepted: true } };
  }

  async redeemCode(request: Request, client: string, now: Date) {
    const payload = this.payload(request, true);
    if (!payload || payload.code === null)
      return { status: 400, body: { error: 'Invalid request' } };
    const result = await this.exchange.redeem(
      payload.email,
      payload.code,
      client,
      now,
    );
    return result
      ? { status: 204, cookie: result.cookie }
      : { status: 401, body: { error: 'Invalid or expired code' } };
  }

  async current(cookie: unknown, now: Date) {
    const token = this.boundary.sessionToken(cookie);
    const session = token ? await this.sessions.authenticate(token, now) : null;
    return {
      status: 200,
      // Session identifiers and bearer tokens never enter the JSON response.
      body: session
        ? { signedIn: true, isAdmin: session.isAdmin }
        : { signedIn: false, isAdmin: false },
      cookie: session?.cookie ?? null,
    };
  }

  async signOut(request: Request, allDevices: boolean, now: Date) {
    if (!this.boundary.acceptsWrite(request.origin, request.contentType))
      return { status: 400, body: { error: 'Invalid request' } };
    const token = this.boundary.sessionToken(request.cookie);
    if (!token) return { status: 401 };
    if (allDevices) {
      const session = await this.sessions.authenticate(token, now);
      if (!session) return { status: 401 };
      return {
        status: 204,
        cookie: await this.sessions.signOutAllDevices(session.userId),
      };
    }
    return { status: 204, cookie: await this.sessions.signOut(token) };
  }

  private payload(request: Request, redeem: boolean) {
    return this.boundary.acceptsWrite(request.origin, request.contentType)
      ? this.boundary.loginPayload(request.body, redeem)
      : null;
  }
}
