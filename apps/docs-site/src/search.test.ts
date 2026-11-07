import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';

import {
  rankPages,
  rankSections,
  sectionsOf,
  snippet,
} from '../public/search.js';
import { readAll } from './pages.ts';

const page = (markdown: string, title = 'Backups') => ({
  path: '01-app/10-backups.md',
  title,
  markdown,
});

void test('splits at h1–h4 with the anchors the viewer gives headings', () => {
  const sections = sectionsOf(
    page(
      [
        '# Backups',
        'Intro text.',
        '## Restore a `scratch` copy',
        'Use [the script](x.md) **now**.',
        '```bash',
        '# not a heading',
        'pnpm restore',
        '```',
        '```mermaid',
        'flowchart LR',
        '```',
        '## Restore a scratch copy',
        '##### Deep',
        'body',
      ].join('\n'),
    ),
  );
  assert.deepEqual(
    sections.map((s) => [s.heading, s.anchor]),
    [
      ['Backups', 'backups'],
      ['Restore a scratch copy', 'restore-a-scratch-copy'],
      ['Restore a scratch copy', 'restore-a-scratch-copy-'],
    ],
  );
  assert.equal(
    sections[1].text,
    'Use the script now. # not a heading pnpm restore',
  );
  assert.equal(sections[2].text, '##### Deep body');
});

void test('every word must start a word, in any order', () => {
  const sections = sectionsOf(
    page('# Backups\n## Rebuild\nRestore the latest backup from B2.'),
  );
  const top = (q: string) => rankSections(sections, q)[0]?.section.heading;
  assert.equal(top('backup restore'), 'Rebuild');
  assert.equal(top('b2'), 'Rebuild');
  assert.equal(top('RESTORE'), 'Rebuild');
  assert.equal(top('estore'), undefined);
  assert.equal(top('restore grafana'), undefined);
  assert.deepEqual(rankSections(sections, '   '), []);
});

void test('headings outrank body text, and accents are ignored', () => {
  const sections = sectionsOf(
    page('# Ops\n## Alerts\nCafé budget.\n## Budgets\nNothing else.', 'Ops'),
  );
  assert.deepEqual(
    rankSections(sections, 'budget').map((h) => h.section.heading),
    ['Budgets', 'Alerts'],
  );
  assert.equal(rankSections(sections, 'cafe')[0].section.heading, 'Alerts');
});

void test('pages match on title words', () => {
  const pages = [{ title: 'AI & budgets' }, { title: 'Data model' }];
  assert.deepEqual(rankPages(pages, 'bud'), [pages[0]]);
  assert.deepEqual(rankPages(pages, 'model data'), [pages[1]]);
});

void test('snippets mark matched words without HTML', () => {
  const parts = snippet('Restore the <b>latest</b> backup from B2.', 'backup');
  assert.deepEqual(
    parts.filter((p) => p.match).map((p) => p.text),
    ['backup'],
  );
  assert.equal(
    parts.map((p) => p.text).join(''),
    'Restore the <b>latest</b> backup from B2.',
  );
  const long = snippet(
    `${'word '.repeat(40)}needle ${'tail '.repeat(40)}`,
    'needle',
  );
  assert.equal(long[0].text, '…');
  assert.equal(long.at(-1)?.text, '…');
});

// Guards ranking against the real handbook: each query's best section.
void test('fixed searches find the right handbook section', async () => {
  const handbook = resolve(import.meta.dirname, '../../../docs/handbook');
  const sections = (await readAll(handbook)).flatMap(sectionsOf);
  const best = (q: string) => {
    const s = rankSections(sections, q)[0]?.section;
    return s && `${s.pageTitle} › ${s.heading}`;
  };
  assert.match(best('restore backup') ?? '', /^Database and VM backups › /);
  assert.match(best('budget cap') ?? '', /^AI & budgets › /);
  assert.match(best('x search cost') ?? '', /^Social posts › How X posts/);
  assert.match(best('bluesky') ?? '', /^Social posts › How Bluesky/);
  assert.equal(best('zzqx nothing'), undefined);
});
