// Read-only check of the owner handbook and DB explorer metadata, against the
// running services. Usage:
//   pnpm exec tsx scripts/check-handbook.ts            # every page
//   pnpm exec tsx scripts/check-handbook.ts data-model # pages whose path matches
// Fails on Mermaid render errors, broken handbook links, pages (or README.md)
// over 100 lines outside code blocks, schema-meta warnings or unassigned
// tables. Saves a PNG per diagram (dark mode, as the owner reads it) to
// /tmp/handbook-diagrams/ so changed diagrams can be inspected for crossings
// and overlapping labels.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';

import { chromium } from 'playwright';

import type { SchemaModel } from '../apps/schema-explorer/src/model';
import { buildPublicModel } from '../apps/schema-explorer/src/public-model';
import { localAdminFetch } from './lib/local-admin-fetch';
import { readPrivateSchemaCatalog } from './lib/schema-catalog';

const base = 'http://127.0.0.1:8000';
if (
  process.env.APP_URL &&
  !['http://localhost:8000', base].includes(process.env.APP_URL)
)
  throw new Error('Handbook verification requires the local app on port 8000');

async function readTool(path: string) {
  const response = await localAdminFetch(`${base}${path}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok)
    throw new Error(`Tool read failed: HTTP ${response.status}`);
  return response;
}
const out = '/tmp/handbook-diagrams';
const filter = process.argv[2];
// Owner docs stay short: lines outside code blocks (diagrams, commands).
const maxProseLines = 100;
const proseLines = (file: string) =>
  readFileSync(file, 'utf8')
    .trimEnd()
    .split('\n')
    .reduce(
      (acc, line) =>
        line.startsWith('```')
          ? { ...acc, code: !acc.code }
          : { ...acc, n: acc.n + (acc.code ? 0 : 1) },
      { code: false, n: 0 },
    ).n;

interface TreePage {
  path: string;
  title: string;
}
interface Tree {
  home: TreePage | null;
  sections: { index: TreePage | null; pages: TreePage[] }[];
}

async function main() {
  const problems: string[] = [];
  const tree = (await (await readTool('/docs/api/tree')).json()) as Tree;
  const pages = [
    ...(tree.home ? [tree.home] : []),
    ...tree.sections.flatMap((s) => [
      ...(s.index ? [s.index] : []),
      ...s.pages,
    ]),
  ];
  const known = new Set(pages.map((p) => p.path));
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  for (const file of [
    'README.md',
    ...pages.map((p) => `docs/handbook/${p.path}`),
  ]) {
    const n = proseLines(file);
    if (n > maxProseLines)
      problems.push(
        `${file}: ${n} lines outside code blocks (max ${maxProseLines}); cut or split it`,
      );
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 4000 },
      colorScheme: 'dark',
    });
    page.on('request', (request) => {
      if ('admin_local_token' in request.headers())
        problems.push('Local credential entered a browser request');
      if (!['GET', 'HEAD'].includes(request.method()))
        problems.push(`Unexpected browser method: ${request.method()}`);
    });
    // Fetch tool pages/assets in Node: credentials never enter the browser.
    await page.route(`${base}/**`, async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() !== 'GET' || !url.pathname.startsWith('/docs/'))
        throw new Error('Unexpected handbook browser request');
      const response = await readTool(url.pathname + url.search);
      await route.fulfill({
        status: response.status,
        contentType:
          response.headers.get('content-type') ?? 'application/octet-stream',
        body: Buffer.from(await response.arrayBuffer()),
      });
    });
    page.on('pageerror', (error) =>
      problems.push(`page error: ${error.message}`),
    );
    let diagrams = 0;
    for (const p of pages) {
      if (filter && !p.path.includes(filter)) continue;
      const route = p.path.replace(/README\.md$/, '').replace(/\.md$/, '');
      await page.goto(`${base}/docs/#/${route}`);
      await page.reload();
      await page.waitForSelector('article h1');
      await page.waitForTimeout(2000);
      await page.addStyleTag({ content: '.top{display:none!important}' });
      const result = await page.evaluate(() => {
        const blocks = [...document.querySelectorAll('pre.mermaid')];
        return {
          total: blocks.length,
          failed: blocks.filter(
            (b) =>
              !b.querySelector('svg') ||
              b.querySelector('svg[aria-roledescription=error]') ||
              /Syntax error in text/.test(b.textContent ?? ''),
          ).length,
          links: [...document.querySelectorAll('article a[href^="#/"]')].map(
            (a) => a.getAttribute('href') ?? '',
          ),
        };
      });
      diagrams += result.total;
      if (result.failed)
        problems.push(
          `${p.path}: ${result.failed} diagram(s) failed to render`,
        );
      for (const href of result.links) {
        const target = href.slice(2);
        const file =
          target === '' || target.endsWith('/')
            ? `${target}README.md`
            : `${target}.md`;
        if (!known.has(file)) problems.push(`${p.path}: broken link ${href}`);
      }
      const blocks = await page.$$('.diagram');
      for (const [i, block] of blocks.entries())
        await block.screenshot({
          path: `${out}/${p.path.replace(/\//g, '_').replace(/\.md$/, '')}-${i + 1}.png`,
        });
    }
    console.log(
      `handbook: ${pages.length} pages, ${diagrams} diagrams checked`,
    );
  } finally {
    await browser.close();
  }

  const schema = await readPrivateSchemaCatalog();
  const served = (await (
    await readTool('/db/api/schema')
  ).json()) as SchemaModel;
  assert.deepEqual(buildPublicModel(served), buildPublicModel(schema));
  for (const warning of schema.warnings)
    problems.push(`schema-meta: ${warning}`);
  const unassigned = schema.tables.filter((t) => t.group === '_unassigned');
  if (unassigned.length)
    problems.push(
      `schema-meta: unassigned tables: ${unassigned.map((t) => t.name).join(', ')}`,
    );
  console.log(`schema explorer: ${schema.tables.length} tables`);

  if (problems.length) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  } else console.log(`OK. Diagram images: ${out}/`);
}

void main();
