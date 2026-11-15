import {
  existsSync,
  lstatSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { resolve } from 'node:path';

// Refresh exact routes after an atomic release switch; never allow an asset prefix.
let cached: { signature: string; routes: ReadonlySet<string> } | undefined;
export function publicStaticRoutes(
  root = resolve(__dirname, '../../web/dist'),
): ReadonlySet<string> {
  let signature: string;
  try {
    const theme = existsSync(resolve(root, 'theme.js'))
      ? lstatSync(resolve(root, 'theme.js'), { bigint: true })
      : undefined;
    signature = `${realpathSync(root)}:${statSync(root, { bigint: true }).mtimeNs}:${statSync(resolve(root, 'assets'), { bigint: true }).mtimeNs}:${theme?.ino}:${theme?.mode}`;
    if (cached?.signature === signature) return cached.routes;
  } catch {
    return new Set();
  }
  const routes = new Set<string>();
  try {
    if (
      existsSync(resolve(root, 'theme.js')) &&
      lstatSync(resolve(root, 'theme.js')).isFile()
    )
      routes.add('/theme.js');
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
  cached = { signature, routes };
  return routes;
}
