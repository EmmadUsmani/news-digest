import assert from 'node:assert/strict';
import test from 'node:test';

import {
  articleLinkCounts,
  countArticleLink,
} from '../../../scripts/lib/article-link-audit';

void test('article link inventory counts overlapping risks without retaining stored values', () => {
  const secret = 'private-subscription-marker';
  const counts = articleLinkCounts();
  for (const value of [
    `https://publisher.com/${secret}`,
    `https://publisher.com/story?token=${secret}#${secret}`,
    `https://user:${secret}@publisher.com/story?key=${secret}`,
    `http://publisher.com/${secret}`,
    `https://127.0.0.1/${secret}`,
    `https://publisher.com:8443/${secret}`,
    `https://publisher.internal/${secret}`,
    `javascript:${secret}`,
    `not a URL ${secret}`,
    { url: secret },
    null,
  ])
    countArticleLink(counts, value);
  assert.deepEqual(counts, {
    total: 11,
    malformed: 3,
    publicHttps: 2,
    rejectedByPublicUrlPolicy: 6,
    credentials: 1,
    query: 2,
    fragment: 1,
  });
  assert.equal(JSON.stringify(counts).includes(secret), false);
});

void test('empty inventory and escaped query/fragment delimiters do not invent URL components', () => {
  const counts = articleLinkCounts();
  assert.equal(counts.total, 0);
  countArticleLink(
    counts,
    'https://publisher.com/path%3Ftoken%3Dvalue%23value',
  );
  assert.deepEqual(counts, {
    total: 1,
    malformed: 0,
    publicHttps: 1,
    rejectedByPublicUrlPolicy: 0,
    credentials: 0,
    query: 0,
    fragment: 0,
  });
});
