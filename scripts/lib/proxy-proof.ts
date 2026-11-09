import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';

import { proxyClient } from '../../apps/api/src/modules/accounts/adapters/proxy-client';

const prefixes = ['192.0.2.123', '198.51.100.9, 203.0.113.7', 'forged'];

// Temporary diagnostic only: no application storage, identity headers or logs.
export function proxyProof(report: (receipt: unknown) => void) {
  const path = `/probe-${randomBytes(24).toString('hex')}`;
  let baseline: { peer: string; client: string } | undefined;
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
    for (const [index, prefix] of [null, ...${JSON.stringify(prefixes)}].entries()) {
      const response = await fetch(location.pathname + '/' + index, {
        cache: 'no-store', redirect: 'error',
        headers: prefix === null ? {} : {'X-Forwarded-For': prefix}
      });
      if (!response.ok) throw new Error('Check refused; restart probe and retry.');
    }
    result.textContent = 'Forwarding checks passed. Receipt is on the VM terminal. Accounts remain disabled.';
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
    const valid =
      client !== null &&
      typeof forwarded === 'string' &&
      (step === 0
        ? !forwarded.includes(',')
        : baseline?.peer === peer &&
          baseline.client === client &&
          forwarded.slice(0, forwarded.lastIndexOf(',')).trim() ===
            prefixes[step - 1]);
    if (!valid) {
      finished = true;
      baseline = undefined;
      report({ status: 'failed', step });
      return send(409);
    }
    if (step === 0) baseline = { peer, client };
    step++;
    if (step === prefixes.length + 1) {
      finished = true;
      baseline = undefined;
      report({
        status: 'observed',
        immediatePeer: peer,
        forgedPrefixes: prefixes.length,
        finalClientUnchanged: true,
        trustConfigurationChanged: false,
      });
    }
    return send(204);
  });
  return { server, path };
}
