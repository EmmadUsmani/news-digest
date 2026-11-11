// Raw operational data is for fresh admins only. Keep the upstream API
// allowlist shared by request admission and the public-mode proxy.
const queryPaths = new Set([
  '/metrics/api/v1/query',
  '/metrics/api/v1/query_range',
  '/metrics/prometheus/api/v1/query',
  '/metrics/prometheus/api/v1/query_range',
  '/logs/select/logsql/query',
  '/logs/select/logsql/hits',
  '/logs/select/logsql/stats_query',
  '/logs/select/logsql/stats_query_range',
  '/logs/select/logsql/field_names',
  '/logs/select/logsql/field_values',
  '/logs/select/logsql/stream_field_names',
  '/logs/select/logsql/stream_field_values',
  '/logs/select/logsql/query_time_range',
]);

export function isAdminTelemetryQuery(method: string, target: string): boolean {
  if (!['GET', 'POST'].includes(method) || /[#\\\s]/.test(target)) return false;
  return queryPaths.has(target.split('?')[0]);
}

// Exact reviewed native metadata only; tenant identifiers require fresh admins.
const metadataPaths = new Set([
  '/metrics/prometheus/vmui/config.json',
  '/metrics/prometheus/vmui/custom-dashboards',
  '/metrics/prometheus/vmui/timezone',
  '/metrics/vmui/dashboards/perJobUsage.json',
  '/logs/select/buildinfo',
  '/logs/select/tenant_ids',
]);

export function isAdminTelemetryRead(method: string, target: string): boolean {
  return (
    isAdminTelemetryQuery(method, target) ||
    isAdminTelemetryAsset(method, target) ||
    (method === 'GET' && metadataPaths.has(target))
  );
}

// Exact installed asset inventory reviewed in iteration 1789; no prefix grants.
const assetPaths = new Set([
  '/metrics/vmui/',
  '/metrics/vmui/assets/index-BIgfk_tx.css',
  '/metrics/vmui/assets/index-DqVYYV1R.js',
  '/metrics/vmui/assets/rolldown-runtime-B0Z9INg1.js',
  '/metrics/vmui/assets/vendor-CnsZ1jie.css',
  '/metrics/vmui/assets/vendor-U2Dx9M-W.js',
  '/metrics/vmui/dashboards/index.js',
  '/logs/select/vmui/',
  '/logs/select/vmui/assets/index-lFbxh1s7.js',
  '/logs/select/vmui/assets/index-TSMEX6Db.css',
  '/logs/select/vmui/assets/rolldown-runtime-CNC7AqOf.js',
  '/logs/select/vmui/assets/vendor-Bl8Hxami.js',
  '/logs/select/vmui/assets/vendor-CnsZ1jie.css',
]);

export function isAdminTelemetryAsset(method: string, target: string): boolean {
  return method === 'GET' && assetPaths.has(target);
}

export const telemetryContentSecurityPolicy =
  "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'self'; form-action 'none'; worker-src 'none'";
