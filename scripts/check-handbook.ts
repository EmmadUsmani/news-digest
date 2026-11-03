// Read-only check of the owner handbook and DB explorer metadata, against the
// running services. Usage:
//   pnpm exec tsx scripts/check-handbook.ts            # every page
//   pnpm exec tsx scripts/check-handbook.ts data-model # pages whose path matches
// Fails on Mermaid render errors, broken handbook links, schema-meta warnings
// or unassigned tables. Saves a PNG per diagram (dark mode, as the owner reads
// it) to /tmp/handbook-diagrams/ so changed diagrams can be inspected for
// crossings and overlapping labels.
import { mkdirSync, rmSync } from 'node:fs';

import { chromium } from 'playwright';

const base = process.env.APP_URL ?? 'http://localhost:8000';
const out = '/tmp/handbook-diagrams';
const filter = process.argv[2];

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
  const tree = (await (await fetch(`${base}/docs/api/tree`)).json()) as Tree;
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

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 4000 },
      colorScheme: 'dark',
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

  const schema = (await (await fetch(`${base}/db/api/schema`)).json()) as {
    tables: { name: string; group: string }[];
    warnings: string[];
  };
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
