import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

const fixture = 'apps/api/test/fixtures/verge-installer-2026-11-14.xml';
const welcome = /<p class="wp-block-paragraph">Hi, friends![\s\S]*?<\/p>/;

void test('recorded Installer excerpt retains recommendations without its opening archive promotion', async () => {
  const xml = await readFile(fixture, 'utf8');
  const [item] = parseFeed(xml);
  const withoutWelcome = xml.replace(welcome, '');
  assert.notEqual(withoutWelcome, xml);
  assert.deepEqual(item, parseFeed(withoutWelcome)[0]);
  assert.equal(item.title, 'A gadget to make your dumb house smarter');
  assert.equal(item.author, 'David Pierce');
  assert.equal(item.publishedAt, '2026-11-14T13:00:00.000Z');
  assert.match(item.imageUrl ?? '', /Installer-152\.jpg/);
  assert.match(item.excerpt, /^This week, I've been reading about school apps/);
  assert.match(item.excerpt, /GTA VI/);
  assert.match(item.excerpt, /Claude Duet/);
  assert.match(item.excerpt, /third-party iPhone keyboar …$/);
  assert.doesNotMatch(
    item.excerpt,
    /Hi, friends|old editions|homepage|full story/,
  );
  assert(
    item.excerpt.length < 600,
    'All supplied recommendations fit editor evidence',
  );
  // An archive-link control keeps the navigation: its 600-character editor view
  // loses the later recommendations, although they exist in the feed body.
  const [control] = parseFeed(
    xml.replace(
      'href="https://www.theverge.com/installer-newsletter"',
      'href="https://example.com/archive"',
    ),
  );
  assert.doesNotMatch(control.excerpt.slice(0, 600), /third-party iPhone/);
  assert.equal(control.excerpt.length, 650);
  assert.equal(item.excerpt.length, 394);
  assert.deepEqual({ ...item, excerpt: '' }, { ...control, excerpt: '' });
});

void test('Installer welcome removal requires the recorded opening, publisher, archive link and wording', async () => {
  const xml = await readFile(fixture, 'utf8');
  for (const changed of [
    xml.replaceAll('www.theverge.com', 'example.com'),
    xml.replace(
      'href="https://www.theverge.com/installer-newsletter"',
      'href="https://example.com/archive"',
    ),
    xml.replaceAll(
      'and also you can read all the old editions',
      'and also the company announced new editions',
    ),
    xml.replace(
      welcome,
      (paragraph) => `<p>Earlier reporting.</p>${paragraph}`,
    ),
    xml.replaceAll('homepage</a>.)', 'homepage</a>.) New product reporting.'),
  ]) {
    assert.notEqual(changed, xml);
    const [item] = parseFeed(changed);
    assert.match(item.excerpt, /Hi, friends!/);
    assert.match(item.excerpt, /school apps/);
  }
});
