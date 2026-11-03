import { createServer } from 'node:http';

import { collectDefaultMetrics, Registry } from 'prom-client';

import { logger } from './logging';

// A separate loopback listener prevents public API routes from exposing metrics.
// Labels are fixed at startup; no content, URLs or request IDs enter the registry.
export function startRuntimeMetrics(service: 'api' | 'worker', port: number) {
  const registry = new Registry();
  registry.setDefaultLabels({ service });
  collectDefaultMetrics({ register: registry, prefix: 'news_digest_' });
  const server = createServer((request, response) => {
    if (request.url !== '/metrics' || request.method !== 'GET') {
      response.writeHead(404).end();
      return;
    }
    void registry.metrics().then(
      (body) => {
        response.writeHead(200, { 'Content-Type': registry.contentType });
        response.end(body);
      },
      () => response.writeHead(503).end(),
    );
  });
  server.on('error', (err) => {
    logger.error({ err, service }, 'Runtime metrics listener failed');
  });
  server.listen(port, '127.0.0.1');
  server.unref();
  return { server, registry };
}
