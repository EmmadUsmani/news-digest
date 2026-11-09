import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import test from 'node:test';

import type { PublicAccessPrincipal } from '../src/public-access';
import { publicSourceHttp } from '../src/public-write/source-http';
import { publicTopicHttp } from '../src/public-write/topic-http';
import { publicTopicOrderHttp } from '../src/public-write/topic-order-http';

for (const kind of ['source', 'topic', 'order'] as const) {
  void test(
    `${kind} writes do not mutate after disconnect during authentication`,
    { timeout: 5000 },
    async () => {
      let release!: (principal: PublicAccessPrincipal) => void;
      let entered!: () => void;
      const authenticating = new Promise<void>((resolve) => {
        entered = resolve;
      });
      let closed!: () => void;
      const disconnected = new Promise<void>((resolve) => {
        closed = resolve;
      });
      let writes = 0;
      const principal = {
        freshAdmin: true,
        auditActor: { localScript: true as const },
      };
      const options = {
        enabled: true,
        origin: 'https://reader.example',
        authenticate: () => {
          entered();
          return new Promise<PublicAccessPrincipal>((resolve) => {
            release = resolve;
          });
        },
      };
      const writer = {
        async setEnabled() {
          writes++;
          return { outcome: 'unchanged' as const, id: 'test', enabled: false };
        },
        async reorder() {
          writes++;
          return { outcome: 'unchanged' as const };
        },
      };
      const middleware =
        kind === 'source'
          ? publicSourceHttp({ ...options, writer })
          : kind === 'topic'
            ? publicTopicHttp({ ...options, writer })
            : publicTopicOrderHttp({ ...options, writer });
      const server = createServer((req, res) => {
        res.on('close', closed);
        middleware(req, res, () => {
          res.writeHead(404).end();
        });
      });
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve),
      );
      try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');
        const id = '22222222-2222-4222-8222-222222222222';
        const path =
          kind === 'source'
            ? '/api/admin/topics/sources/test/enabled'
            : kind === 'topic'
              ? `/api/admin/topics/${id}`
              : '/api/admin/topics/order';
        const body =
          kind === 'order'
            ? JSON.stringify({ ids: [id] })
            : '{"enabled":false}';
        const client = request({
          host: '127.0.0.1',
          port: address.port,
          path,
          method: 'PUT',
          headers: {
            origin: options.origin,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(body),
          },
        });
        client.on('error', () => {});
        client.end(body);
        await authenticating;
        client.destroy();
        await disconnected;
        release(principal);
        await new Promise<void>((resolve) => setImmediate(resolve));
        assert.equal(writes, 0);
        // A fresh connection still completes the normal authenticated mutation.
        const nextAuthentication = new Promise<void>((resolve) => {
          entered = resolve;
        });
        const result = fetch(`http://127.0.0.1:${address.port}${path}`, {
          method: 'PUT',
          headers: {
            origin: options.origin,
            'content-type': 'application/json',
          },
          body,
        });
        await nextAuthentication;
        release(principal);
        assert.equal((await result).status, 200);
        assert.equal(writes, 1);
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
      }
    },
  );
}
