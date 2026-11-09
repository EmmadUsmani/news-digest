import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { isIP } from 'node:net';

import { proxyClient } from '../../apps/api/src/modules/accounts/adapters/proxy-client';

const prefixes = ['192.0.2.123', '198.51.100.9, 203.0.113.7', 'forged'];

export type ProxyReceipt = {
  status: 'running' | 'observed' | 'failed';
  steps: {
    step: number;
    forwardedFields: number;
    forwardedEntries: number;
    finalEntryIsIp: boolean;
    appendedEntries: {
      category: 'loopback' | 'private' | 'public' | 'unknown';
      matchesBaseline: boolean | null;
    }[];
    immediatePeer: 'loopback' | 'private' | 'public' | 'unknown';
    presentHeaders: string[];
    forwardingValid: boolean;
    email?: 'absent' | 'replaced' | 'forged';
  }[];
  trustConfigurationChanged: false;
};

function peerKind(
  peer: string,
): ProxyReceipt['steps'][number]['immediatePeer'] {
  const value = peer.replace(/^::ffff:/, '');
  if (!isIP(value)) return 'unknown';
  if (value === '::1' || value.startsWith('127.')) return 'loopback';
  if (
    /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.)/.test(value) ||
    (isIP(value) === 6 && /^(f[cd]|fe[89ab])/i.test(value))
  )
    return 'private';
  return 'public';
}

// Temporary diagnostic: retain only shape, never addresses or identity values.
export function proxyProof(report: (receipt: ProxyReceipt) => void) {
  const path = `/probe-${randomBytes(24).toString('hex')}`;
  let baseline: { peer: string; client: string } | undefined;
  let appendedBaseline: string[] | undefined;
  const steps: ProxyReceipt['steps'] = [];
  let step = 0;
  let finished = false;
  const nonce = randomBytes(24).toString('hex');
  const server = createServer((request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader(
      'Content-Security-Policy',
      `default-src 'none'; script-src 'nonce-${nonce}'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'`,
    );
    const send = (status: number, body = '') => {
      response.statusCode = status;
      response.end(body);
    };
    if (request.url === path && request.method === 'GET') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      return send(
        200,
        `<!doctype html><meta charset="utf-8"><title>Private proxy check</title>
<h1>Private proxy check</h1><p>Checks forwarding behavior only. Does not enable accounts.</p>
<button id="run">Run check once</button><pre id="result"></pre>
<script nonce="${nonce}">
document.getElementById('run').onclick = async function () {
  this.disabled = true;
  const result = document.getElementById('result');
  try {
    for (const [index, prefix] of [null, ...${JSON.stringify(prefixes)}, null].entries()) {
      const response = await fetch(location.pathname + '/' + index, {
        cache: 'no-store', redirect: 'error',
        headers: index === 4 ? {'X-ExeDev-Email': 'forged@example.invalid'} : prefix === null ? {} : {'X-Forwarded-For': prefix}
      });
      if (!response.ok) throw new Error('Check refused; restart probe and retry.');
      const receipt = await response.json();
      result.textContent = JSON.stringify(receipt, null, 2);
    }
    result.textContent += '\\nChecks complete. Receipt saved on VM. Accounts remain disabled.';
  } catch { result.textContent = 'Check failed. No trust configuration changed.'; }
};
</script>`,
      );
    }
    if (
      finished ||
      request.method !== 'GET' ||
      request.url !== `${path}/${step}`
    )
      return send(404);
    const peer = request.socket.remoteAddress ?? '';
    const client = peer ? proxyClient([peer])(request) : null;
    const forwarded = request.headers['x-forwarded-for'];
    const fields = request.rawHeaders.filter(
      (_, index) =>
        index % 2 === 0 &&
        request.rawHeaders[index].toLowerCase() === 'x-forwarded-for',
    ).length;
    const entries = typeof forwarded === 'string' ? forwarded.split(',') : [];
    const last = entries.at(-1)?.trim() ?? '';
    // Compare positions independently of the legacy trust check. Never persist
    // these transient values: receipts contain only categories and equality.
    const appended = entries.slice(-2).map((entry) => entry.trim());
    if (step === 0 && fields === 1 && entries.length === 2)
      appendedBaseline = appended;
    const expectedEntries = step === 0 || step === 4 ? 2 : step === 2 ? 4 : 3;
    const appendedEntries = appended.map((entry, index) => ({
      category: peerKind(entry),
      matchesBaseline:
        appendedBaseline && fields === 1 && entries.length === expectedEntries
          ? entry === appendedBaseline[index]
          : null,
    }));
    const valid =
      client !== null &&
      typeof forwarded === 'string' &&
      (step === 0
        ? entries.length === 1
        : baseline?.peer === peer &&
          baseline.client === client &&
          (step === 4
            ? entries.length === 1
            : forwarded.slice(0, forwarded.lastIndexOf(',')).trim() ===
              prefixes[step - 1]));
    const email = request.headers['x-exedev-email'];
    const emailResult =
      email === undefined
        ? 'absent'
        : (Array.isArray(email) ? email : email.split(',')).some(
              (value) => value.trim() === 'forged@example.invalid',
            )
          ? 'forged'
          : 'replaced';
    steps.push({
      step,
      forwardedFields: fields,
      forwardedEntries: entries.length,
      finalEntryIsIp: isIP(last) !== 0,
      appendedEntries,
      immediatePeer: peerKind(peer),
      presentHeaders: [
        ...new Set(
          request.rawHeaders
            .filter((_, index) => index % 2 === 0)
            .map((name) => name.toLowerCase())
            .filter(
              (name) =>
                name === 'x-forwarded-proto' ||
                name === 'x-forwarded-host' ||
                name.startsWith('x-exedev-'),
            ),
        ),
      ].sort(),
      forwardingValid: valid,
      ...(step === 4 ? { email: emailResult } : {}),
    });
    if (step === 0 && valid) baseline = { peer, client: client };
    step++;
    finished = step === 5;
    const receipt: ProxyReceipt = {
      status: !finished
        ? 'running'
        : steps.every((value) => value.forwardingValid) &&
            emailResult !== 'forged'
          ? 'observed'
          : 'failed',
      steps: [...steps],
      trustConfigurationChanged: false,
    };
    report(receipt);
    if (finished) {
      baseline = undefined;
      appendedBaseline = undefined;
    }
    response.setHeader('Content-Type', 'application/json');
    return send(200, JSON.stringify(receipt));
  });
  return { server, path };
}
