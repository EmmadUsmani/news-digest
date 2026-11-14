import assert from 'node:assert/strict';
import { test } from 'node:test';

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
