import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { networkInterfaces, tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { Pool } from 'pg';
import { DockerComposeEnvironment, Wait } from 'testcontainers';

void test('prepared aggregate database publishes only loopback on an isolated network', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const env = {
    ...process.env,
    GRAFANA_EXPORT_OWNER_PASSWORD: 'synthetic-listener-password',
    GRAFANA_EXPORT_LISTEN_PORT: '0',
  };
  const config = JSON.parse(
    execFileSync(
      'docker',
      [
        'compose',
        '-f',
        'ops/observability/grafana/prepared/compose.yaml',
        'config',
        '--format',
        'json',
      ],
      { env, encoding: 'utf8' },
    ),
  );
  assert.equal(config.services['export-db'].ports[0].host_ip, '127.0.0.1');
  assert.equal(config.networks['export-only'].driver, 'bridge');
  // Exercise the prepared service without creating a persistent volume.
  delete config.services['export-db'].volumes;
  config.services['export-db'].tmpfs = ['/var/lib/postgresql/data'];
  config.services['export-db'].restart = 'no';
  delete config.volumes;
  delete config.name;
  const dir = mkdtempSync(join(tmpdir(), 'grafana-listener-'));
  writeFileSync(join(dir, 'compose.json'), JSON.stringify(config));
  let environment;
  try {
    environment = await new DockerComposeEnvironment(dir, 'compose.json')
      .withWaitStrategy('export-db-1', Wait.forHealthCheck())
      .up();
    const container = environment.getContainer('export-db-1');
    const inspect = JSON.parse(
      execFileSync('docker', ['inspect', container.getId()], {
        encoding: 'utf8',
      }),
    )[0];
    const bindings = inspect.NetworkSettings.Ports['5432/tcp'];
    assert.equal(bindings.length, 1);
    assert.equal(bindings[0].HostIp, '127.0.0.1');
    assert.equal(Object.keys(inspect.NetworkSettings.Networks).length, 1);
    const network = Object.values(inspect.NetworkSettings.Networks)[0] as {
      NetworkID: string;
    };
    const networkInfo = JSON.parse(
      execFileSync('docker', ['network', 'inspect', network.NetworkID], {
        encoding: 'utf8',
      }),
    )[0];
    assert.equal(networkInfo.Driver, 'bridge');
    assert.deepEqual(Object.keys(networkInfo.Containers), [container.getId()]);
    const port = Number(bindings[0].HostPort);
    const owner = new Pool({
      host: '127.0.0.1',
      port,
      database: 'grafana_export',
      user: 'export_owner',
      password: env.GRAFANA_EXPORT_OWNER_PASSWORD,
      connectionTimeoutMillis: 2000,
    });
    try {
      assert.equal(
        (await owner.query('SELECT current_database() AS name')).rows[0].name,
        'grafana_export',
      );
    } finally {
      await owner.end();
    }
    const addresses = Object.values(networkInterfaces())
      .flat()
      .filter(
        (address) => address && address.family === 'IPv4' && !address.internal,
      );
    assert.ok(addresses.length > 0, 'VM non-loopback interface required');
    for (const address of addresses) {
      await new Promise<void>((resolve, reject) => {
        const socket = createConnection({ host: address!.address, port });
        socket.setTimeout(1000);
        socket.once('connect', () => {
          socket.destroy();
          reject(new Error('Export port reachable on non-loopback interface'));
        });
        socket.once('error', () => {
          socket.destroy();
          resolve();
        });
        socket.once('timeout', () => {
          socket.destroy();
          resolve();
        });
      });
    }
  } finally {
    await environment?.down();
    rmSync(dir, { recursive: true, force: true });
  }
});
