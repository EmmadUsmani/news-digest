// Raw operational data is for fresh admins only. Keep the upstream API
// allowlist shared by request admission and the public-mode proxy.
const queryPaths = new Set([
  '/metrics/api/v1/query',
  '/metrics/api/v1/query_range',
  '/logs/select/logsql/query',
]);

export function isAdminTelemetryQuery(method: string, target: string): boolean {
  if (method !== 'GET' || /[#\\\s]/.test(target)) return false;
  return queryPaths.has(target.split('?')[0]);
}
