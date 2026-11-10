import { redis } from '../libs/db/connections';
import { proxyClient } from '../modules/accounts/adapters/proxy-client';
import { RedisApiAdmission } from './redis-api-admission';

// Prepared for the public runtime. The caller owns close() on startup failure
// and shutdown. Private rollback must not validate public config or open Redis.
export function prepareConfiguredApiAdmission(
  env: Readonly<Record<string, string | undefined>>,
  connect: () => Pick<ReturnType<typeof redis>, 'eval' | 'quit'> = redis,
) {
  const mode = env.PUBLIC_MODE ?? '0';
  if (mode === '0') return null;
  if (mode !== '1') throw new Error('Invalid public access enable flag');
  const peers = (env.ACCOUNT_TRUSTED_PROXY_PEERS ?? '')
    .split(',')
    .map((peer) => peer.trim());
  if (peers.some((peer) => !peer))
    throw new Error('Verified public API proxy peers required');
  const client = proxyClient(peers);
  const key = env.ACCOUNT_SECRET_KEY ?? '';
  if (!/^[a-f0-9]{64}$/i.test(key))
    throw new Error('Public API secret requires 32 hex-encoded bytes');
  // Validate everything before acquisition; share the account key, with the
  // limiter's separate HMAC namespace keeping its Redis identities independent.
  const cache = connect();
  const limiter = new RedisApiAdmission(cache, key);
  let closing: Promise<unknown> | undefined;
  return {
    client,
    admission: () => limiter,
    close: () => (closing ??= Promise.resolve().then(() => cache.quit())),
  };
}
