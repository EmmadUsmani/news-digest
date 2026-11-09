import type { AdminSessionRevocation } from '../application/admin-session-revocation';
import type { DeleteAccount } from '../application/delete-account';
import type { LoginCodes } from '../application/login-codes';
import type { LoginExchange } from '../application/login-exchange';
import type { ReaderSessions } from '../application/sessions';
import { clearSessionCookie } from '../application/sessions';
import type { SignInLinks } from '../application/sign-in-links';
import {
  mergeReaderSync,
  type ReaderSyncRepository,
} from '../domain/reader-sync';
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
    private readonly links?: Pick<SignInLinks, 'issue' | 'redeem'>,
    private readonly deletion?: Pick<DeleteAccount, 'execute'>,
    private readonly sync?: ReaderSyncRepository,
    private readonly revocation?: Pick<AdminSessionRevocation, 'revoke'>,
  ) {}

  acceptsWrite(origin: unknown, contentType: unknown): boolean {
    return this.boundary.acceptsWrite(origin, contentType);
  }

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

  async issueLink(request: Request, now: Date) {
    if (!this.links) return { status: 404 };
    const payload = this.payload(request, false);
    if (!payload) return { status: 400, body: { error: 'Invalid request' } };
    const token = this.boundary.sessionToken(request.cookie);
    if (!token) return { status: 401 };
    const result = await this.links.issue(token, payload.email, now);
    return result
      ? {
          status: 201,
          body: {
            token: result.token,
            url: this.boundary.signInLink(result.token),
            expiresAt: result.expiresAt.toISOString(),
          },
        }
      : { status: 403 };
  }

  async revokeSessions(request: Request, now: Date) {
    if (!this.revocation) return { status: 404 };
    if (!this.boundary.acceptsWrite(request.origin, request.contentType))
      return { status: 400 };
    const body = request.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).length !== 1 ||
      !Object.hasOwn(body, 'userId') ||
      typeof (body as { userId: unknown }).userId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        (body as { userId: string }).userId,
      )
    )
      return { status: 400 };
    const token = this.boundary.sessionToken(request.cookie);
    if (!token) return { status: 401 };
    // The service/storage checks admin freshness atomically with the audit.
    const result = await this.revocation.revoke(
      token,
      (body as { userId: string }).userId,
      now,
    );
    return result ? { status: 200, body: result } : { status: 403 };
  }

  async redeemLink(request: Request, now: Date) {
    if (!this.links) return { status: 404 };
    if (!this.boundary.acceptsWrite(request.origin, request.contentType))
      return { status: 400, body: { error: 'Invalid request' } };
    const body = request.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).length !== 1 ||
      !Object.hasOwn(body, 'token') ||
      typeof (body as { token: unknown }).token !== 'string' ||
      !/^[A-Za-z0-9_-]{43}$/.test((body as { token: string }).token)
    )
      return { status: 400, body: { error: 'Invalid request' } };
    const result = await this.links.redeem(
      'POST',
      (body as { token: string }).token,
      now,
    );
    return result
      ? { status: 204, cookie: result.cookie }
      : { status: 401, body: { error: 'Invalid or expired link' } };
  }

  async deleteAccount(request: Request) {
    if (!this.deletion) return { status: 404 };
    if (!this.boundary.acceptsWrite(request.origin, request.contentType))
      return { status: 400, body: { error: 'Invalid request' } };
    const body = request.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).length !== 1 ||
      !Object.hasOwn(body, 'confirmation') ||
      (body as { confirmation: unknown }).confirmation !== 'DELETE'
    )
      return { status: 400, body: { error: 'Invalid request' } };
    const token = this.boundary.sessionToken(request.cookie);
    if (!token || !(await this.deletion.execute(token))) return { status: 401 };
    return { status: 204, cookie: clearSessionCookie() };
  }

  async syncReader(request: Request, now: Date) {
    if (!this.sync) return { status: 404 };
    if (!this.boundary.acceptsWrite(request.origin, request.contentType))
      return { status: 400 };
    const token = this.boundary.sessionToken(request.cookie);
    const session = token ? await this.sessions.authenticate(token, now) : null;
    if (!session) return { status: 401 };
    let changes;
    try {
      changes = mergeReaderSync(
        { version: 1, hiddenTopics: {}, bookmarks: {} },
        request.body,
      );
    } catch {
      return { status: 400 };
    }
    // Identity is derived exclusively from the authenticated cookie. The
    // repository serializes merges with other devices and identity deletion.
    const state = await this.sync.merge(session.userId, changes);
    return { status: 200, body: state, cookie: session.cookie };
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
