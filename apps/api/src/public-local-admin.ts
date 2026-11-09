import { timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

// Preparation only. The documented proxy appends forwarded headers; even a
// loopback proxy peer must never turn a remote request into a local script.
export function directLocalAdmin(
  request: IncomingMessage,
  expected: string | undefined,
): boolean {
  const peer = request.socket.remoteAddress;
  if (
    !expected ||
    !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer ?? '') ||
    Object.keys(request.headers).some(
      (name) => name === 'forwarded' || name.startsWith('x-forwarded-'),
    )
  )
    return false;
  // Reject duplicate credentials rather than accepting Node's joined value.
  const count = request.rawHeaders.filter(
    (_value, index) =>
      index % 2 === 0 &&
      request.rawHeaders[index].toLowerCase() === 'admin_local_token',
  ).length;
  const supplied = request.headers.admin_local_token;
  if (count !== 1 || typeof supplied !== 'string') return false;
  const actual = Buffer.from(supplied);
  const configured = Buffer.from(expected);
  return (
    actual.length === configured.length && timingSafeEqual(actual, configured)
  );
}
