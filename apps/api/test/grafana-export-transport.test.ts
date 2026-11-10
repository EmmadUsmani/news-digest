import assert from 'node:assert/strict';
import { test } from 'node:test';

import { exportConnections } from '../scripts/export-grafana';

export function transportEnvironment(): NodeJS.ProcessEnv {
  return {
    GRAFANA_EXPORT_SOURCE_HOST: '127.0.0.1',
    GRAFANA_EXPORT_SOURCE_PORT: '5432',
    GRAFANA_EXPORT_SOURCE_DATABASE: 'application',
    GRAFANA_EXPORT_SOURCE_USER: 'trusted_producer',
    GRAFANA_EXPORT_SOURCE_PASSWORD: 'synthetic-source-password',
    GRAFANA_EXPORT_TARGET_HOST: '127.0.0.1',
    GRAFANA_EXPORT_TARGET_PORT: '5433',
    GRAFANA_EXPORT_TARGET_DATABASE: 'aggregate',
    GRAFANA_EXPORT_TARGET_USER: 'grafana_export_writer',
    GRAFANA_EXPORT_TARGET_PASSWORD: 'synthetic-target-password',
  };
}

void test('prepared export transport refuses remote hosts, shared ports and missing credentials', () => {
  const env = transportEnvironment();
  const config = exportConnections(env);
  assert.equal(config.source.options, '-c default_transaction_read_only=on');
  assert.equal(config.target.max, 1);
  assert.equal(config.target.statement_timeout, 5000);
  for (const [key, value] of [
    ['GRAFANA_EXPORT_TARGET_HOST', 'example.test'],
    ['GRAFANA_EXPORT_SOURCE_HOST', 'localhost'],
    ['GRAFANA_EXPORT_TARGET_PORT', '5432'],
    ['GRAFANA_EXPORT_TARGET_PORT', '0'],
    ['GRAFANA_EXPORT_TARGET_PORT', '65536'],
    ['GRAFANA_EXPORT_TARGET_PORT', '5433?sslmode=disable'],
    ['GRAFANA_EXPORT_TARGET_USER', 'postgres'],
    ['GRAFANA_EXPORT_SOURCE_PASSWORD', ''],
    ['GRAFANA_EXPORT_TARGET_PASSWORD', ''],
  ]) {
    assert.throws(() => exportConnections({ ...env, [key]: value }));
  }
  for (const key of Object.keys(env)) {
    const missing = { ...env };
    delete missing[key];
    assert.throws(() => exportConnections(missing));
  }
});
