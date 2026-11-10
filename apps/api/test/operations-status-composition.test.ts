import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { NestFactory } from '@nestjs/core';

import { MonitoringAlerts } from '../src/modules/operations/adapters/monitoring-alerts';
import { OperationsStatus } from '../src/modules/operations/adapters/operations.status';
import { OperationsModule } from '../src/modules/operations/operations.module';

void test('operations selects one status transport and preserves alerts in both modes', async () => {
  const raw = {
    checkedAt: '2026-11-10T14:00:00.000Z',
    sources: [],
    queues: [],
    developmentSpend: 'private-ledger',
  };
  for (const publicMode of ['0', '1']) {
    let failure = false;
    let reads = 0;
    const module = OperationsModule.prepare({
      PUBLIC_MODE: publicMode,
      SYSTEM_OWNERSHIP: '1',
      READER_PUBLISHED_ONLY: '1',
    });
    // Replace external adapters before Nest constructs them: no live DB/Redis.
    module.providers = module.providers!.map((provider) => {
      if (provider === OperationsStatus)
        return {
          provide: OperationsStatus,
          useValue: {
            async read() {
              reads++;
              if (failure) throw new Error('private-ledger');
              return raw;
            },
          },
        };
      if (provider === MonitoringAlerts)
        return {
          provide: MonitoringAlerts,
          useValue: {
            async read() {
              return { firing: 0 };
            },
          },
        };
      return provider;
    });
    const app = await NestFactory.create(module, { logger: false });
    try {
      await app.listen(0, '127.0.0.1');
      const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/api/admin/status`;
      const response = await fetch(base);
      assert.equal(response.status, 200);
      assert.deepEqual(
        await response.json(),
        publicMode === '1'
          ? { checkedAt: raw.checkedAt, sources: [], queues: [] }
          : raw,
      );
      assert.equal(reads, 1);
      assert.equal(
        response.headers.get('cache-control'),
        publicMode === '1' ? 'no-store' : null,
      );
      const head = await fetch(base, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
      assert.deepEqual(await (await fetch(`${base}/alerts`)).json(), {
        firing: 0,
      });
      for (const method of ['POST', 'PUT', 'DELETE'])
        assert.equal((await fetch(base, { method })).status, 404);
      if (publicMode === '1') {
        failure = true;
        const failed = await fetch(base);
        assert.equal(failed.status, 503);
        assert.equal((await failed.text()).includes('private-ledger'), false);
      }
    } finally {
      await app.close();
    }
  }
});

void test('operations rejects invalid public prerequisites before constructing adapters', () => {
  for (const env of [
    { PUBLIC_MODE: 'yes' },
    { PUBLIC_MODE: '1' },
    { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1' },
  ])
    assert.throws(() => OperationsModule.prepare(env));
});
