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
    (method === 'GET' && metadataPaths.has(target))
  );
}
