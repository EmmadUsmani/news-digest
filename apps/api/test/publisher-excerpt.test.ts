import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { HackerNewsAdapter } from '../src/modules/ingestion/adapters/hn.adapter';
import { publisherExcerpt } from '../src/modules/ingestion/adapters/publisher-excerpt';

const reporting =
  'The researchers released a new model and published the evaluation results alongside its training code.';
const html = `<nav><p>${'Navigation '.repeat(10)}</p></nav><article><header><p>${'Subscribe '.repeat(10)}</p></header><script><p>${reporting}</p></script><p>${reporting}</p><p>Second paragraph explains the measured results &amp; limitations of this released model.</p></article>`;
void test('publisher excerpt selects bounded article reporting and excludes page chrome', () => {
  assert.equal(
    publisherExcerpt(html),
    `${reporting} Second paragraph explains the measured results & limitations of this released model.`,
  );
  assert.equal(publisherExcerpt(`<main><p>${reporting}</p></main>`), '');
  assert.ok(
    publisherExcerpt(`<article><p>${reporting.repeat(30)}</p></article>`)
      .length <= 1500,
  );
});
void test('HN publisher enrichment preserves submission text and tolerates publisher failures', async () => {
  for (const mode of ['article', 'blocked', 'submission']) {
    const calls: string[] = [];
    const adapter = new HackerNewsAdapter({
      get: async (url) => {
        calls.push(url);
        if (url.endsWith('topstories.json')) return '[1]';
        if (url.endsWith('/1.json'))
          return JSON.stringify({
            type: 'story',
            title: 'Model release',
            url: 'https://example.com/model',
            time: 1700000000,
            text: mode === 'submission' ? reporting : undefined,
          });
        if (mode === 'blocked') throw new Error('HTTP 403');
        return html;
      },
    });
    const items = await adapter.collect({
      id: 'hn',
      topicId: null,
      name: 'HN',
      kind: 'hn',
      url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
    });
    assert.equal(items.length, 1);
    assert.equal(
      items[0].excerpt,
      mode === 'blocked'
        ? ''
        : mode === 'submission'
          ? reporting
          : publisherExcerpt(html),
    );
    assert.equal(calls.length, mode === 'submission' ? 2 : 3);
  }
});

void test('recorded Java4Shell publisher paragraphs retain reporting detail', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-java4shell.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /^After we disclosed PHP2Shell/);
  assert.match(excerpt, /Java/);
  assert.ok(excerpt.length > 500 && excerpt.length <= 1500);
});
