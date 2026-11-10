// PREPARED ONLY: no service or schedule installs this one-shot exporter.
import { Pool, type PoolConfig } from 'pg';

import { produceExport } from '../../../ops/observability/grafana/prepared/produce-export';
import { refreshExport } from '../../../ops/observability/grafana/prepared/refresh-export';

export function exportConnections(env: NodeJS.ProcessEnv): {
  source: PoolConfig;
  target: PoolConfig;
} {
  const connection = (prefix: string): PoolConfig => {
    const required = (name: string) => {
      const value = env[`${prefix}_${name}`];
      if (!value) throw new Error(`Missing ${prefix}_${name}`);
      return value;
    };
    // Only literal IPv4 loopback is supported. No remote plaintext, DNS,
    // connection URLs, PG* defaults or credential-bearing query parameters.
    if (required('HOST') !== '127.0.0.1')
      throw new Error('Export connections require literal IPv4 loopback');
    const portText = required('PORT');
    const port = Number(portText);
    if (!/^\d+$/.test(portText) || port < 1 || port > 65535)
      throw new Error('Invalid export connection port');
    return {
      host: '127.0.0.1',
      port,
      database: required('DATABASE'),
      user: required('USER'),
      password: required('PASSWORD'),
      ssl: false,
      max: 1,
      connectionTimeoutMillis: 3000,
      statement_timeout: 5000,
      lock_timeout: 500,
      idle_in_transaction_session_timeout: 10000,
      application_name: 'news-digest-aggregate-export',
      options:
        prefix === 'GRAFANA_EXPORT_SOURCE'
          ? '-c default_transaction_read_only=on'
          : '-c default_transaction_read_only=off',
    };
  };
  const source = connection('GRAFANA_EXPORT_SOURCE');
  const target = connection('GRAFANA_EXPORT_TARGET');
  if (source.port === target.port)
    throw new Error('Export target must use a separate instance port');
  if (target.user !== 'grafana_export_writer')
    throw new Error('Export target requires restricted writer role');
  return { source, target };
}

export async function exportOnce(env: NodeJS.ProcessEnv, now = new Date()) {
  const config = exportConnections(env);
  const source = new Pool(config.source);
  const target = new Pool(config.target);
  try {
    const snapshot = await produceExport(source, now);
    await refreshExport(target, snapshot, now);
  } finally {
    await Promise.all([source.end(), target.end()]);
  }
}

if (require.main === module) {
  if (process.argv.slice(2).join(' ') !== '--run-once') {
    console.error('Prepared exporter requires --run-once');
    process.exitCode = 1;
  } else {
    void exportOnce(process.env).then(
      () => console.log('Aggregate export completed'),
      () => {
        // Driver errors can include hosts, users and server-provided details.
        console.error('Aggregate export failed');
        process.exitCode = 1;
      },
    );
  }
}
