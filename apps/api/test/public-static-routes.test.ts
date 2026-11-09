import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { classifyPublicRoute } from '../src/public-route-policy';
import { publicStaticRoutes } from '../src/public-static-routes';

void test('public static admission snapshots only deployed scripts/styles, refusing aliases and writes', () => {
  const root = mkdtempSync(join(tmpdir(), 'public-build-'));
  try {
    mkdirSync(join(root, 'assets'));
    for (const name of [
      'theme.js',
      'assets/index-aB_12.js',
      'assets/index-aB_12.css',
      'assets/inter-latin-12.woff2',
      'assets/index.js.map',
      'assets/private.json',
      'assets/fallback.html',
      'assets/.hidden.js',
    ])
      writeFileSync(join(root, name), 'fixture');
    mkdirSync(join(root, 'assets/nested.js'));
    symlinkSync(join(root, 'theme.js'), join(root, 'assets/link.js'));
    const routes = publicStaticRoutes(root);
    assert.deepEqual([...routes].sort(), [
      '/assets/index-aB_12.css',
      '/assets/index-aB_12.js',
      '/assets/inter-latin-12.woff2',
      '/theme.js',
    ]);
    for (const path of routes) {
      for (const method of ['GET', 'HEAD'])
        assert.equal(
          classifyPublicRoute(method, `${path}?v=1`, routes),
          'public-read',
        );
      for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS'])
        assert.equal(classifyPublicRoute(method, path, routes), null);
    }
    writeFileSync(join(root, 'assets/later.js'), 'fixture');
    for (const path of [
      '/assets/later.js',
      '/assets/unknown.js',
      '/assets/index.js.map',
      '/assets/link.js',
      '/assets/private.json',
      '/assets/',
      '/assets/../theme.js',
      '/assets/%69ndex-aB_12.js',
      '/theme.js/extra',
      '/theme.js#fragment',
      '/assets//index-aB_12.js',
    ])
      assert.equal(classifyPublicRoute('GET', path, routes), null, path);
    assert.equal(publicStaticRoutes(join(root, 'missing')).size, 0);
    rmSync(join(root, 'theme.js'));
    symlinkSync(join(root, 'assets/index-aB_12.js'), join(root, 'theme.js'));
    assert.equal(publicStaticRoutes(root).has('/theme.js'), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
