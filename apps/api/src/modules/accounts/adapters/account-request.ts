// Prepared transport checks only; no runtime route registers this boundary.
export class AccountRequestBoundary {
  private readonly origin: string;

  constructor(origin: string) {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || url.origin !== origin)
      throw new Error('Account origin must be an HTTPS origin');
    this.origin = origin;
  }

  signInLink(token: string): string {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token))
      throw new Error('Invalid link token');
    return `${this.origin}/account/sign-in#${token}`;
  }

  acceptsWrite(origin: unknown, contentType: unknown): boolean {
    return (
      origin === this.origin &&
      typeof contentType === 'string' &&
      /^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(contentType)
    );
  }

  loginPayload(body: unknown, redeem: boolean) {
    if (body === null || typeof body !== 'object' || Array.isArray(body))
      return null;
    const fields = Object.keys(body);
    const value = body as Record<string, unknown>;
    const expected = redeem ? ['email', 'code'] : ['email'];
    if (
      fields.length !== expected.length ||
      !expected.every((key) => Object.hasOwn(value, key)) ||
      typeof value.email !== 'string' ||
      value.email.length > 254 ||
      (redeem && (typeof value.code !== 'string' || value.code.length > 64))
    )
      return null;
    // Let the code service count malformed guesses against its attempt limit.
    return { email: value.email, code: redeem ? (value.code as string) : null };
  }

  sessionToken(cookie: unknown): string | null {
    if (typeof cookie !== 'string' || cookie.length > 8192) return null;
    const values = cookie
      .split(';')
      .map((part) => part.trim())
      .filter((part) => part.split('=', 1)[0] === '__Host-reader_session');
    if (values.length !== 1) return null;
    const token = values[0].slice('__Host-reader_session='.length);
    return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
  }
}
