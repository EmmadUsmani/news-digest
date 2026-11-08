import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

import { LoginCodeSecrets } from '../domain/login-code';

export class CryptoLoginCodeSecrets extends LoginCodeSecrets {
  constructor(private readonly key: Buffer) {
    super();
    if (key.length < 32) throw new Error('Login code key requires 32 bytes');
    this.key = Buffer.from(key);
  }

  generate(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  hash(email: string, code: string): string {
    // A separately configured key prevents offline enumeration of six digits
    // from a database copy. Bind the digest to its intended email identity.
    return createHmac('sha256', this.key)
      .update(JSON.stringify([email, code]))
      .digest('hex');
  }

  matches(expected: string, actual: string): boolean {
    if (!/^[a-f0-9]{64}$/.test(expected) || !/^[a-f0-9]{64}$/.test(actual))
      return false;
    return timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(actual, 'hex'),
    );
  }
}
