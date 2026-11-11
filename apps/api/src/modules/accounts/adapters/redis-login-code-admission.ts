import { createHmac } from 'node:crypto';

import type { Redis } from 'ioredis';

import { LoginCodeAdmission } from '../domain/login-code';

// A recipient allowance belongs to one client, never to strangers naming them.
// Increment both dimensions on every attempt, even if the other is blocked.
// One script prevents concurrent processes from exceeding either allowance.
const ADMIT = `
local email = redis.call('INCR', KEYS[1])
if email == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[3]) end
local client = redis.call('INCR', KEYS[2])
if client == 1 then redis.call('PEXPIRE', KEYS[2], ARGV[3]) end
if email <= tonumber(ARGV[1]) and client <= tonumber(ARGV[2]) then return 1 end
return 0
`;

export class RedisLoginCodeAdmission extends LoginCodeAdmission {
  constructor(
    private readonly cache: Pick<Redis, 'eval'>,
    private readonly privacyKey: string,
    private readonly isEligible: (email: string) => Promise<boolean>,
    private readonly limits = {
      email: 10,
      client: 50,
      windowMs: 600_000,
    },
  ) {
    super();
    if (Buffer.byteLength(privacyKey) < 32)
      throw new Error(
        'Login admission requires a private key of at least 32 bytes',
      );
    if (
      ![limits.email, limits.client, limits.windowMs].every(
        (value) => Number.isSafeInteger(value) && value > 0,
      )
    )
      throw new Error('Login admission limits must be positive integers');
  }

  async allow(email: string, clientAddress: string): Promise<boolean> {
    if (!clientAddress.trim()) return false;
    try {
      return (
        (await this.cache.eval(
          ADMIT,
          2,
          this.key('email', `${email.trim().toLowerCase()}\0${clientAddress}`),
          this.key('client', clientAddress),
          this.limits.email,
          this.limits.client,
          this.limits.windowMs,
        )) === 1
      );
    } catch {
      // Redis failure must never bypass throttling or expose backend errors.
      return false;
    }
  }

  eligible(email: string): Promise<boolean> {
    return this.isEligible(email);
  }

  private key(dimension: string, value: string): string {
    const digest = createHmac('sha256', this.privacyKey)
      .update(`${dimension}\0${value}`)
      .digest('hex');
    return `accounts:login:${dimension}:${digest}`;
  }
}
