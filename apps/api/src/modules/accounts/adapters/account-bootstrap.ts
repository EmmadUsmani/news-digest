import { accountHttp } from './account-http';
import { prepareAccountHandlers } from './account-runtime';
import { proxyClient } from './proxy-client';

// Prepared for main registration after Phase 1 acceptance. No deployment peer
// is trusted by default; configure only addresses verified at the live proxy.
export function prepareAccountHttp(
  env: Readonly<Record<string, string | undefined>>,
  dependencies: Parameters<typeof prepareAccountHandlers>[1],
) {
  const enabled = env.ACCOUNTS_ENABLED ?? '0';
  if (enabled === '0') return null;
  if (enabled !== '1') throw new Error('Invalid accounts enable flag');
  const peers = (env.ACCOUNT_TRUSTED_PROXY_PEERS ?? '')
    .split(',')
    .map((peer) => peer.trim());
  if (peers.some((peer) => !peer))
    throw new Error('Verified account proxy peers required');
  // Validate trust before opening database, Redis or mailbox dependencies.
  const client = proxyClient(peers);
  const handlers = prepareAccountHandlers(env, dependencies)!;
  return accountHttp({ enabled: true, handlers, client });
}
