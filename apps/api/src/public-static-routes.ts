import { lstatSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Snapshot the deployed build once per access middleware. Never grant an assets
// prefix: maps, HTML fallbacks, unexpected files and future formats stay denied.
export function publicStaticRoutes(
  root = resolve(__dirname, '../../web/dist'),
): ReadonlySet<string> {
  const routes = new Set<string>();
  try {
    if (lstatSync(resolve(root, 'theme.js')).isFile()) routes.add('/theme.js');
    if (!lstatSync(resolve(root, 'assets')).isDirectory()) return routes;
    for (const entry of readdirSync(resolve(root, 'assets'), {
      withFileTypes: true,
    })) {
      if (
        entry.isFile() &&
        /^[a-zA-Z0-9_-]+\.(?:js|css|woff2)$/.test(entry.name)
      )
        routes.add(`/assets/${entry.name}`);
    }
  } catch {
    // Missing/incomplete builds fail closed; no directory or SPA fallback grant.
  }
  return routes;
}
