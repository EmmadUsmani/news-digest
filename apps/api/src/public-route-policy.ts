// Phase 4 preparation only: not installed by main. Admin reads and internal
// tools stay restricted until their response/privacy audits are complete.
export type RouteClass = 'public-read' | 'user' | 'admin';

type Rule = readonly [method: string, path: RegExp, access: RouteClass];
const id = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const rules: readonly Rule[] = [
  ['GET', /^\/(?:saved|editions)?$/, 'public-read'],
  ['GET', new RegExp(`^/editions/${id}$`), 'public-read'],
  ['GET', /^\/healthz$/, 'public-read'],
  ['GET', /^\/api\/settings\/schedule$/, 'public-read'],
  ['GET', /^\/privacy$/, 'public-read'],
  ['GET', /^\/api\/editions(?:\/latest)?$/, 'public-read'],
  ['GET', new RegExp(`^/api/editions/${id}$`), 'public-read'],
  ['GET', /^\/account\/(?:login|sign-in)$/, 'public-read'],
  // Session discovery is deliberately anonymous-capable; its handler returns
  // only the caller's session and applies private/no-store response headers.
  ['GET', /^\/api\/account\/session$/, 'public-read'],
  // Anonymous credential exchanges still require origin/body/client admission.
  ['POST', /^\/api\/account\/(?:code|redeem|link-redeem)$/, 'public-read'],
  ['POST', /^\/api\/account\/(?:sync|delete|logout|logout-all)$/, 'user'],
  ['POST', /^\/api\/account\/(?:links|sessions\/revoke)$/, 'admin'],
  ['GET', /^\/api\/admin\/topics$/, 'public-read'],
  ['GET', /^\/api\/admin\/topics\/sources$/, 'public-read'],
  ['POST', /^\/api\/admin\/topics$/, 'admin'],
  ['PUT', /^\/api\/admin\/topics\/order$/, 'admin'],
  [
    'PUT',
    /^\/api\/admin\/topics\/sources\/[a-zA-Z0-9_-]{1,200}\/enabled$/,
    'admin',
  ],
  ['POST', new RegExp(`^/api/admin/topics/${id}/(?:queries|feeds)$`), 'admin'],
  ['PUT', new RegExp(`^/api/admin/topics/${id}(?:/sources)?$`), 'admin'],
  ['DELETE', new RegExp(`^/api/admin/topics/${id}$`), 'admin'],
  ['GET', /^\/api\/admin\/profile$/, 'admin'],
  ['PUT', /^\/api\/admin\/profile\/schedule$/, 'admin'],
  // Count-only response audited; detailed operational status stays restricted.
  ['GET', /^\/api\/admin\/status\/alerts$/, 'public-read'],
  ['GET', /^\/api\/admin\/status$/, 'admin'],
  ['GET', /^\/api\/admin\/content(?:\/sources)?$/, 'public-read'],
  ['GET', /^\/api\/admin\/content\/window$/, 'admin'],
  ['GET', /^\/api\/admin\/digest-previews(?:\/latest)?$/, 'admin'],
  ['GET', new RegExp(`^/api/admin/digest-previews/${id}(?:/cost)?$`), 'admin'],
  [
    'GET',
    new RegExp(`^/api/admin/digest-previews/jobs/(?:[0-9]{1,20}|${id})$`),
    'admin',
  ],
  ['POST', /^\/api\/admin\/digest-previews(?:\/tests|\/jobs)?$/, 'admin'],
];

// No prefix grants or URL normalization: reject ambiguous paths before a
// downstream router can decode, collapse, or case-fold them differently.
export function classifyPublicRoute(
  method: string,
  target: string,
  staticRoutes: ReadonlySet<string> = new Set(),
): RouteClass | null {
  const path = target.split('?')[0];
  if (
    !path.startsWith('/') ||
    /[%\\#\s]/.test(path) ||
    path.includes('//') ||
    path.split('/').some((part) => part === '.' || part === '..')
  )
    return null;
  if ((method === 'GET' || method === 'HEAD') && staticRoutes.has(path))
    return 'public-read';
  return (
    rules.find(
      ([verb, pattern]) =>
        (method === verb || (method === 'HEAD' && verb === 'GET')) &&
        pattern.test(path),
    )?.[2] ?? null
  );
}
