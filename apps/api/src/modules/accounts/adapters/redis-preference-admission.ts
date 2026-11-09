import { createHmac } from 'node:crypto';

import type { Redis } from 'ioredis';

const ADMIT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[2]) end
if count <= tonumber(ARGV[1]) then return 1 end
return 0
`;

// Prepared only: supply the authenticated user ID, never body or header identity.
export class RedisPreferenceAdmission {
  constructor(
    private readonly cache: Pick<Redis, 'eval'>,
    private readonly privacyKey: string,
    private readonly limits = { requests: 30, windowMs: 60_000 },
  ) {
    if (Buffer.byteLength(privacyKey) < 32)
      throw new Error(
        'Preference admission requires a private key of at least 32 bytes',
      );
    if (
      ![limits.requests, limits.windowMs].every(
        (value) => Number.isSafeInteger(value) && value > 0,
      )
    )
      throw new Error('Preference admission limits must be positive integers');
  }

  async allow(userId: string): Promise<boolean> {
    if (!userId.trim() || userId.length > 256) return false;
    const digest = createHmac('sha256', this.privacyKey)
      .update(`reader-preferences\0${userId}`)
      .digest('hex');
    try {
      return (
        (await this.cache.eval(
          ADMIT,
          1,
          `accounts:preferences:user:${digest}`,
          this.limits.requests,
          this.limits.windowMs,
        )) === 1
      );
    } catch {
      return false;
    }
  }
}
