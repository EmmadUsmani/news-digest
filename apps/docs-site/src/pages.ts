import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

// Handbook layout (see docs/handbook/README.md):
//   README.md                 home page
//   NN-section/README.md      section landing page; its H1 is the section title
//   NN-section/NN-page.md     pages, ordered by file name
export interface Page {
  path: string; // relative to the handbook root, always with '/'
  title: string;
}
export interface Section {
  dir: string;
  title: string;
  index: Page | null;
  pages: Page[];
}
export interface Tree {
  home: Page | null;
  sections: Section[];
}

export function titleOf(markdown: string, fallback: string) {
  const match = /^#\s+(.+?)\s*#*\s*$/m.exec(markdown);
  return match ? match[1] : fallback;
}
function humanize(name: string) {
  const words = name
    .replace(/\.md$/, '')
    .replace(/^\d+[-_]/, '')
    .replace(/[-_]+/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
async function page(root: string, path: string): Promise<Page> {
  const text = await readFile(join(root, path), 'utf8');
  return { path, title: titleOf(text, humanize(path.split('/').pop()!)) };
}

export async function listTree(root: string): Promise<Tree> {
  const entries = await readdir(root, { withFileTypes: true });
  const byName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, 'en', { numeric: true });
  const home = entries.some((e) => e.isFile() && e.name === 'README.md')
    ? await page(root, 'README.md')
    : null;
  const sections: Section[] = [];
  for (const dir of entries.filter((e) => e.isDirectory()).sort(byName)) {
    if (dir.name.startsWith('.') || dir.name.startsWith('_')) continue;
    const files = (await readdir(join(root, dir.name), { withFileTypes: true }))
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .sort(byName);
    const index = files.some((f) => f.name === 'README.md')
      ? await page(root, `${dir.name}/README.md`)
      : null;
    const pages = await Promise.all(
      files
        .filter((f) => f.name !== 'README.md')
        .map((f) => page(root, `${dir.name}/${f.name}`)),
    );
    sections.push({
      dir: dir.name,
      title: index?.title ?? humanize(dir.name),
      index,
      pages,
    });
  }
  // Loose top-level pages (other than README) form a final "More" section.
  const loose = entries
    .filter(
      (e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md',
    )
    .sort(byName);
  if (loose.length)
    sections.push({
      dir: '',
      title: 'More',
      index: null,
      pages: await Promise.all(loose.map((f) => page(root, f.name))),
    });
  return { home, sections };
}

/** Every page in reading order (home, then each section), with its Markdown. */
export async function readAll(root: string) {
  const { home, sections } = await listTree(root);
  const pages = [
    ...(home ? [home] : []),
    ...sections.flatMap((s) => [...(s.index ? [s.index] : []), ...s.pages]),
  ];
  return Promise.all(
    pages.map(async (p) => ({
      ...p,
      markdown: await readFile(join(root, p.path), 'utf8'),
    })),
  );
}

/** Resolve a request path safely inside root; null if it escapes or is not allowed. */
export function safePath(
  root: string,
  requested: string,
  extensions: string[],
) {
  const base = resolve(root);
  const full = resolve(base, requested.replace(/^\/+/, ''));
  const rel = relative(base, full);
  if (!rel || rel.startsWith('..') || rel.split(sep).includes('..'))
    return null;
  if (!extensions.some((ext) => full.toLowerCase().endsWith(ext))) return null;
  return full;
}
