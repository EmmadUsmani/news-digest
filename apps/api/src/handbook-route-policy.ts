// Only the viewer and its read-only handbook API. The service further checks
// page names against its Markdown inventory; arbitrary files are never served.
export function isPublicHandbookTarget(
  method: string,
  target: string,
): boolean {
  if (!['GET', 'HEAD'].includes(method)) return false;
  if (
    [
      '/docs',
      '/docs/',
      '/docs/app.js',
      '/docs/style.css',
      '/docs/api/tree',
      '/docs/api/pages',
    ].includes(target)
  )
    return true;
  return /^\/docs\/api\/page\?path=(?:[a-zA-Z0-9_-]+(?:%2F|\/))*[a-zA-Z0-9_-]+\.md$/.test(
    target,
  );
}
