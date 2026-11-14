import assert from 'node:assert/strict';
import { test } from 'node:test';

import { scoredFallback } from '../src/modules/digests/domain/editorial-shortlist';
import { rankFallback } from '../src/modules/digests/domain/rank';
import { reportingExcerpt } from '../src/modules/digests/domain/reporting-excerpt';

void test('legacy headline descriptions are excluded only with exact Google News publisher evidence', () => {
  const item = {
    url: 'https://news.google.com/rss/articles/legacy',
    title: 'FAA ground stop raises questions - WBAL-TV',
    excerpt: 'FAA ground stop raises questions WBAL-TV',
    publisher: { name: 'WBAL-TV' },
  };
  assert.equal(reportingExcerpt(item), '');
  for (const change of [
    { url: 'https://example.org/rss/articles/legacy' },
    { url: 'https://news.google.com/report/legacy' },
    { url: 'invalid' },
    { publisher: null },
    { publisher: { name: 'Other publisher' } },
    { title: 'FAA ground stop raises questions' },
    { excerpt: item.excerpt + ' Controllers resumed takeoffs.' },
    { excerpt: 'Controllers resumed takeoffs.' },
  ]) {
    const control = { ...item, ...change };
    assert.equal(reportingExcerpt(control), control.excerpt);
  }
});

void test('recorded URL-only HN excerpts cannot consume reporting fallback slots', () => {
  // Exact stored excerpts from the Nov 14 prospective Tech capture (2259).
  const excerpts = [
    'https://www.fly.faa.gov/adv/adv_otherdis?adv_date=11132026&a... https://www.fly.faa.gov/adv/adv_otherdis?adv_date=11142026&a... https://www.nytimes.com/live/2026/11/13/us/ground-stop-natio...',
    'https://www.nytimes.com/live/2026/11/13/us/ground-stop-natio...',
  ];
  const start = new Date('2026-11-13T15:00:00Z');
  const end = new Date('2026-11-14T15:00:00Z');
  for (const excerpt of excerpts) {
    const item = {
      id: 'urls',
      title: 'FAA Issues National Ground Stop',
      excerpt,
      url: 'https://news.ycombinator.com/item?id=1',
      publishedAt: '2026-11-14T01:00:00Z',
      sources: ['Hacker News'],
      points: 1000,
    };
    assert.equal(reportingExcerpt(item), '');
    assert.equal(reportingExcerpt({ ...item, excerpt: ` \n${excerpt}\t` }), '');
    const loaded = { ...item, excerpt: reportingExcerpt(item) };
    const report = {
      ...item,
      id: 'report',
      url: 'https://example.org/report',
      excerpt: 'Controllers resumed departures. https://example.org/details',
      points: 0,
    };
    assert.equal(reportingExcerpt(report), report.excerpt);
    for (const select of [rankFallback, scoredFallback]) {
      assert.deepEqual(select([loaded], start, end, 1), []);
      assert.deepEqual(
        select([loaded, report], start, end, 1).map(({ id }) => id),
        ['report'],
      );
    }
  }
  for (const excerpt of [
    'Details: https://example.org/report',
    'https://example.org/report Controllers resumed departures.',
    'http is a protocol',
  ]) {
    assert.equal(
      reportingExcerpt({
        url: 'https://example.org',
        title: 'Report',
        excerpt,
      }),
      excerpt,
    );
  }
});
