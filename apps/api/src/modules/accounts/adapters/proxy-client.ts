import type { IncomingMessage } from 'node:http';
import { isIP } from 'node:net';

function address(value: string): string | null {
  if (value.includes('%')) return null;
  if (isIP(value) === 4) return value;
  if (isIP(value) !== 6) return null;
  const canonical = new URL(`http://[${value}]/`).hostname.slice(1, -1);
  // IPv4 and IPv4-mapped IPv6 must share the same admission bucket.
  const mapped = /^::ffff:([a-f0-9]+):([a-f0-9]+)$/.exec(canonical);
  if (!mapped) return canonical;
  const high = Number.parseInt(mapped[1], 16);
  const low = Number.parseInt(mapped[2], 16);
  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
}

// Prepared only. Deployment must verify and explicitly supply immediate proxy
// peers before registration. Never infer trust from a forwarded header.
// exe.dev documents appending the observed client to X-Forwarded-For:
// https://exe.dev/docs/proxy.md
export function proxyClient(trustedPeers: readonly string[]) {
  const peers = new Set(
    trustedPeers.map((peer) => {
      const normalized = address(peer);
      if (!normalized) throw new Error('Invalid trusted proxy address');
      return normalized;
    }),
  );
  return (request: IncomingMessage): string | null => {
    const peer = address(request.socket.remoteAddress ?? '');
    if (!peer || !peers.has(peer)) return null;
    // Reject duplicate header fields rather than depending on Node's joining.
    let fields = 0;
    for (let i = 0; i < request.rawHeaders.length; i += 2)
      if (request.rawHeaders[i].toLowerCase() === 'x-forwarded-for') fields++;
    const forwarded = request.headers['x-forwarded-for'];
    if (
      fields !== 1 ||
      typeof forwarded !== 'string' ||
      forwarded.length > 2048
    )
      return null;
    // Prior entries are visitor-controlled. Only the final appended IP counts.
    return address(forwarded.slice(forwarded.lastIndexOf(',') + 1).trim());
  };
}
