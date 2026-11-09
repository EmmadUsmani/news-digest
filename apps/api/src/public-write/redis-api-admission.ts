import { createHmac } from 'node:crypto';

import type { Redis } from 'ioredis';

const ADMIT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[2]) end
if count <= tonumber(ARGV[1]) then return 1 end
return 0
`;

// Prepared only: the caller must supply the verified visitor identity. Never
// pass a raw forwarded header or a shared proxy address as the client key.
export class RedisApiAdmission {
  constructor(
    private readonly cache: Pick<Redis, 'eval'>,
    private readonly privacyKey: string,
    private readonly limits = { requests: 120, windowMs: 60_000 },
  ) {
    if (Buffer.byteLength(privacyKey) < 32)
      throw new Error(
        'API admission requires a private key of at least 32 bytes',
      );
    if (
      ![limits.requests, limits.windowMs].every(
        (value) => Number.isSafeInteger(value) && value > 0,
      )
    )
      throw new Error('API admission limits must be positive integers');
  }

  async allow(client: string): Promise<boolean> {
    if (!client.trim() || client.length > 256) return false;
    const digest = createHmac('sha256', this.privacyKey)
      .update(`public-api\0${client}`)
      .digest('hex');
    try {
      return (
        (await this.cache.eval(
          ADMIT,
          1,
          `public:api:client:${digest}`,
          this.limits.requests,
          this.limits.windowMs,
        )) === 1
      );
    } catch {
      return false;
    }
  }
}
