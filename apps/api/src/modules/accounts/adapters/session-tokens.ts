import { createHash, randomBytes } from 'node:crypto';

import { SessionTokens } from '../domain/session';

export class CryptoSessionTokens extends SessionTokens {
  generate(): string {
    return randomBytes(32).toString('base64url');
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
