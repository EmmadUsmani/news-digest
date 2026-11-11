// Raw operational data is for fresh admins only. Keep the upstream API
// allowlist shared by request admission and the public-mode proxy.
const queryPaths = new Set([
  '/metrics/api/v1/query',
  '/metrics/api/v1/query_range',
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
  if (method !== 'GET' || /[#\\\s]/.test(target)) return false;
  return queryPaths.has(target.split('?')[0]);
}
