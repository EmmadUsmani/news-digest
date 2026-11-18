import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { HackerNewsAdapter } from '../src/modules/ingestion/adapters/hn.adapter';
import { publisherExcerpt } from '../src/modules/ingestion/adapters/publisher-excerpt';

const reporting =
  'The researchers released a new model and published the evaluation results alongside its training code.';
const html = `<nav><p>${'Navigation '.repeat(10)}</p></nav><article><header><p>${'Subscribe '.repeat(10)}</p></header><script><p>${reporting}</p></script><p>${reporting}</p><p>Second paragraph explains the measured results &amp; limitations of this released model.</p></article>`;
void test('recorded release lists provide evidence without repository chrome or bare links', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-jquery-release.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /^Support an alternative completeCallback API/);
  assert.match(excerpt, /querySelectorAll/);
  assert.match(excerpt, /Use createElementNS to support XML documents/);
  assert.doesNotMatch(
    excerpt,
    /Outside navigation|Unrelated repository|https:/,
  );
  assert.ok(excerpt.length > 300 && excerpt.length <= 1500);
  for (const changed of [
    html.replace('data-test-selector="body-content"', ''),
    html.replace('markdown-body', 'other-body'),
  ]) {
    assert.doesNotMatch(
      publisherExcerpt(changed),
      /completeCallback|querySelectorAll|createElementNS/,
    );
  }
});
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

void test('main reporting requires a page heading and excludes surrounding chrome', () => {
  const main = `<p>${'Outside promotion '.repeat(6)}</p><main><p>${'Opening promotion '.repeat(6)}</p><h1>Inference release</h1><nav><p>${'Navigation '.repeat(10)}</p></nav><p>${reporting}</p><footer><p>${'Footer promotion '.repeat(6)}</p></footer></main>`;
  assert.equal(publisherExcerpt(main), reporting);
  assert.equal(
    publisherExcerpt(
      `<h1>Outside heading</h1><main><p>${reporting}</p></main>`,
    ),
    '',
  );
  assert.equal(
    publisherExcerpt(`<main><h1>Page</h1></main><p>${reporting}</p>`),
    '',
  );
  assert.equal(
    publisherExcerpt(
      `<main><h1>Page</h1><p>${reporting}</p></main><article><p>${reporting} Article wins.</p></article>`,
    ),
    `${reporting} Article wins.`,
  );
});

void test('recorded Cerebras main reporting retains architecture and capacity detail', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-cerebras.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /^We’ve deployed Cerebras/);
  assert.match(excerpt, /GPUs handle prompt processing/);
  assert.match(excerpt, /five times more tokens per megawatt/);
  assert.ok(excerpt.length > 500 && excerpt.length <= 1500);
});

void test('a release page containing only a link is not reporting evidence', () => {
  const url =
    'https://blog.jquery.com/2026/11/17/jquery-4-1-0-and-3-8-0-released-passing-the-torch/';
  assert.equal(
    publisherExcerpt(
      `<main><h1>Release</h1><p><a href="${url}">${url}</a></p></main>`,
    ),
    '',
  );
});

void test('recorded MediaWiki reporting excludes donation tables and retains shutdown detail', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-archiveteam.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /^Apple Discussions\s*, also known as/);
  assert.match(excerpt, /2026-11-20/);
  assert.match(excerpt, /no longer accept new posts/);
  assert.doesNotMatch(excerpt, /donation|warrior|infrastructure|\[1\]/i);
  assert.ok(excerpt.length > 500 && excerpt.length <= 1500);
});

void test('MediaWiki extraction bounds nested content and matches class tokens', () => {
  const prose = `<div id="mw-content-text"><div class="mw-content-ltr mw-parser-output"><table><tr><td><p>${'Donate '.repeat(20)}</p><table><tr><td>Nested table</td></tr></table></td></tr></table><div><p>${reporting}<sup>[1]</sup></p></div></div></div>`;
  assert.equal(
    publisherExcerpt(`${prose}<p>${'Outside '.repeat(20)}</p>`),
    reporting,
  );
  assert.equal(
    publisherExcerpt(`<div class="mw-parser-output"><p>${reporting}</p></div>`),
    '',
  );
  assert.equal(
    publisherExcerpt(
      prose.replace('mw-parser-output', 'mw-parser-output-fake'),
    ),
    '',
  );
  assert.equal(
    publisherExcerpt(
      `<article><p>${reporting} Article wins.</p></article>${prose}`,
    ),
    `${reporting} Article wins.`,
  );
});

void test('recorded arXiv abstract wins over main footer paragraphs', async () => {
  const abstract = await readFile(
    'apps/api/test/fixtures/hn-publisher-arxiv.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(
    `<main><h1>Paper</h1>${abstract}<p>${'Submission and subscription help '.repeat(8)}</p></main>`,
  );
  assert.match(excerpt, /^More than 13,000 satellites/);
  assert.match(excerpt, /98% of modeled satellites within one week/);
  assert.doesNotMatch(excerpt, /Abstract:|subscription|Submission/);
  assert.ok(excerpt.length > 1000 && excerpt.length <= 1500);
});

void test('recorded research project abstract retains model evaluation detail', async () => {
  const abstract = await readFile(
    'apps/api/test/fixtures/hn-publisher-lattice.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(
    `<nav><p>${reporting}</p></nav>${abstract}<section><p>${'Outside promotion '.repeat(10)}</p></section>`,
  );
  assert.match(excerpt, /^Language models typically/);
  assert.match(excerpt, /15.41 to 14.40/);
  assert.doesNotMatch(excerpt, /Outside promotion|Abstract/);
  assert.ok(excerpt.length > 1000 && excerpt.length <= 1500);
});

void test('abstract extraction requires an explicit container and preserves article precedence', () => {
  assert.equal(publisherExcerpt(`<blockquote>${reporting}</blockquote>`), '');
  assert.equal(
    publisherExcerpt(
      `<section id="abstract-notes"><p>${reporting}</p></section>`,
    ),
    '',
  );
  assert.equal(
    publisherExcerpt(`<section id="abstract"><p>Abstract</p></section>`),
    '',
  );
  assert.equal(
    publisherExcerpt(
      `<blockquote class="not-abstract">${reporting}</blockquote>`,
    ),
    '',
  );
  assert.equal(
    publisherExcerpt(
      `<section id="abstract"><p>${reporting}</p></section><article><p>${reporting} Article wins.</p></article>`,
    ),
    `${reporting} Article wins.`,
  );
  assert.ok(
    publisherExcerpt(
      `<blockquote class="mathjax abstract">${reporting.repeat(30)}</blockquote>`,
    ).length <= 1500,
  );
});

void test('microformat content stays within its exact class container', () => {
  assert.equal(
    publisherExcerpt(
      `<div class="blog-entry e-content"><div><p>${reporting}</p></div></div><p>${'Outside copy '.repeat(10)}</p>`,
    ),
    reporting,
  );
  assert.equal(
    publisherExcerpt(`<div class="not-e-content"><p>${reporting}</p></div>`),
    '',
  );
  assert.equal(
    publisherExcerpt(`<div class="e-content"><p>Short</p></div>`),
    '',
  );
  assert.equal(
    publisherExcerpt(
      `<div class="e-content"><nav><p>${reporting}</p></nav><p>${reporting} Body.</p></div><article><p>${reporting} Article.</p></article>`,
    ),
    `${reporting} Article.`,
  );
});

void test('recorded Purism microformat retains announcement reporting', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-purism.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /^Powered by open-source software/);
  assert.match(excerpt, /RISC-V/);
  assert.ok(excerpt.length > 500 && excerpt.length <= 1500);
});

void test('recorded article template retains verification evidence without related posts', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-verification.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /^On the Claude Code team/);
  assert.match(excerpt, /improved task success by up to 10 points/);
  assert.doesNotMatch(excerpt, /Related posts promotion/);
  assert.equal(excerpt.length, 1500);
});

void test('template prose requires article scope, heading and exact body markers', () => {
  const body = `<div class="extra prose" id="body"><section><p>${reporting}</p></section></div>`;
  const template = `<div data-tpl="article"><h1>Report</h1>${body}<section><p>${'Related posts promotion. '.repeat(6)}</p></section></div>`;
  assert.equal(publisherExcerpt(template), reporting);
  for (const changed of [
    template.replace('data-tpl="article"', 'data-tpl="index"'),
    template.replace('<h1>Report</h1>', ''),
    template.replace('id="body"', 'id="sidebar"'),
    template.replace('extra prose', 'prose-preview'),
  ]) {
    assert.equal(publisherExcerpt(changed), '');
  }
  assert.equal(
    publisherExcerpt(`<div data-tpl="article"><h1>Report</h1></div>${body}`),
    '',
  );
  assert.equal(
    publisherExcerpt(
      `${template}<article><p>${reporting} Article wins.</p></article>`,
    ),
    `${reporting} Article wins.`,
  );
});

void test('recorded Apple main landmark retains permission guidance', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-apple-permissions.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /^Starting in macOS 27.3/);
  assert.match(excerpt, /backup apps, disk cleaners/);
  assert.ok(excerpt.length > 500 && excerpt.length <= 1500);
});

void test('main landmark requires its own heading and excludes surrounding prose', () => {
  assert.equal(
    publisherExcerpt(
      `<p>${reporting}</p><div role="main"><p>${reporting}</p></div><h1>Outside</h1>`,
    ),
    '',
  );
  assert.equal(
    publisherExcerpt(
      `<div role="main-extra"><h1>Page</h1><p>${reporting}</p></div>`,
    ),
    '',
  );
  assert.equal(
    publisherExcerpt(
      `<p>${'Outside '.repeat(20)}</p><div role="main"><p>${'Opening '.repeat(20)}</p><h1>Page</h1><div><p>${reporting}</p></div><footer><p>${reporting}</p></footer></div><p>${reporting}</p>`,
    ),
    reporting,
  );
  assert.equal(
    publisherExcerpt(
      `<div role="main"><h1>Page</h1><p>${'Other '.repeat(20)}</p></div><article><p>${reporting}</p></article>`,
    ),
    reporting,
  );
});

void test('main article headings survive header chrome removal', () => {
  const chrome =
    'Subscribe to our newsletter for updates and exclusive offers every week.';
  assert.equal(
    publisherExcerpt(
      `<header><h1>Site name</h1></header><main><header><p>${chrome}</p><h1>Article title</h1><p>${chrome}</p></header><p>${reporting}</p><footer><p>${chrome}</p></footer></main>`,
    ),
    reporting,
  );
  assert.equal(
    publisherExcerpt(
      `<header><h1>Site name</h1></header><main><header><h2>Section</h2><p>${chrome}</p></header><p>${reporting}</p></main>`,
    ),
    '',
  );
});

void test('recorded publisher headers retain identity and notification reporting', async () => {
  for (const [name, opening] of [
    ['identity', /Life was simpler on Active Directory/],
    ['notifications', /^Every notification system starts the same way/],
  ] as const) {
    const html = await readFile(
      `apps/api/test/fixtures/hn-publisher-${name}-header.html`,
      'utf8',
    );
    const excerpt = publisherExcerpt(html);
    assert.match(excerpt, opening);
    assert.ok(excerpt.length >= 100 && excerpt.length <= 1500);
    assert.doesNotMatch(excerpt, /<h1|<header/);
  }
});

void test('WordPress article bodies recover Lean reporting without comments', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-lean.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /interpret claims/);
  assert.match(excerpt, /722 mathematics papers/);
  assert.doesNotMatch(excerpt, /Comment text/);
  assert.equal(
    publisherExcerpt(html.replace('class="hentry"', 'class="archive"')),
    '',
  );
  assert.equal(
    publisherExcerpt(html.replace('class="entry-title"', 'class="other"')),
    '',
  );
});

void test('matching header titles identify main reporting without admitting untitled pages', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-astra-testing.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /^When we looked at/);
  assert.match(excerpt, /holdout/);
  assert.ok(excerpt.length >= 1400 && excerpt.length <= 1500);
  assert.doesNotMatch(excerpt, /Patreon|Subscribe/);
  assert.equal(
    publisherExcerpt(
      html.replace(
        '<title>Test/verification technique effectiveness with Astra</title>',
        '<title>Other page</title>',
      ),
    ),
    '',
  );
  assert.equal(publisherExcerpt(html.replace(/<title>.*?<\/title>/, '')), '');
  assert.equal(
    publisherExcerpt(
      `<title>Site name</title><header><strong>Other title</strong></header><main><p>${reporting}</p></main>`,
    ),
    '',
  );
  assert.equal(
    publisherExcerpt(
      `<title>Research &amp; testing</title><header><strong>Research &amp; testing</strong></header><main><p>${reporting}</p></main><p>${'Outside '.repeat(15)}</p>`,
    ),
    reporting,
  );
});

void test('legacy WordPress bookmark headings scope entry prose without metadata or comments', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/hn-publisher-legacy-wordpress.html',
    'utf8',
  );
  const excerpt = publisherExcerpt(html);
  assert.match(excerpt, /^Nvidia’s board announced/);
  assert.match(excerpt, /business model transitions/);
  assert.doesNotMatch(excerpt, /Metadata|Comment text/);
  assert.equal(
    publisherExcerpt(html.replace('class="hentry"', 'class="archive"')),
    '',
  );
  assert.equal(
    publisherExcerpt(html.replace('rel="bookmark"', 'rel="other"')),
    '',
  );
  assert.equal(
    publisherExcerpt(html.replace('class="entry"', 'class="other"')),
    '',
  );
});

void test('lower-level main titles require document-title agreement', () => {
  const title = 'Show HN -&gt; a ton of automated email pitches';
  for (const level of [2, 3]) {
    const page = `<title>${title} - Publisher</title><nav><p>${reporting}</p></nav><main><p>Opening chrome should never become reporting even when it is long enough.</p><h${level}>${title}</h${level}><p>${reporting}</p></main><footer><p>${reporting}</p></footer>`;
    assert.equal(publisherExcerpt(page), reporting);
    assert.equal(
      publisherExcerpt(
        page.replace(
          `<title>${title} - Publisher</title>`,
          '<title>Unrelated directory</title>',
        ),
      ),
      '',
    );
    assert.equal(
      publisherExcerpt(page.replace(`<title>${title} - Publisher</title>`, '')),
      '',
    );
  }
});

void test('recorded publisher h3 main page recovers the launch-pitch account', async () => {
  const page = await readFile(
    new URL('./fixtures/publisher-pitches-2026-11-18.html', import.meta.url),
    'utf8',
  );
  const excerpt = publisherExcerpt(page);
  assert.ok(excerpt.startsWith('I posted Airdash on Show HN last week.'));
  assert.ok(
    excerpt.includes('Seven of the 17 are launch boards and directories'),
  );
  assert.ok(!excerpt.includes('Peter Van Dijck · Nov 16'));
});

void test('AsciiDoc guides retain document prose without table of contents or footer', () => {
  const document = `<meta name="generator" content="AsciiDoc 10.2.1">
    <title>Disk encryption on NetBSD - achieving secrecy</title>
    <div id="header"><h1>Disk encryption on NetBSD - achieving secrecy</h1>
    <div id="toc"><p>${'Contents navigation '.repeat(8)}</p></div></div>
    <div id="content"><div class="sect1"><h2>Threat models</h2>
    <div class="sectionbody"><div class="paragraph"><p>${reporting}</p></div></div></div></div>
    <div id="footer"><p>${'Generated footer '.repeat(8)}</p></div>`;
  assert.equal(publisherExcerpt(document), reporting);
  for (const changed of [
    document.replace('AsciiDoc 10.2.1', 'Unrelated generator'),
    document.replace(
      '<h1>Disk encryption on NetBSD - achieving secrecy</h1>',
      '<h1>Other document</h1>',
    ),
    document.replace('id="content"', 'id="other"'),
  ])
    assert.equal(publisherExcerpt(changed), '');
});

void test('Discourse announcement excludes replies and their embedded article previews', () => {
  const announcement =
    'The project released a security update with IPv6 defenses against the ongoing denial of service attack.';
  const reply =
    'A reader asks how to upgrade the browser bundle instead of the standalone relay software.';
  const page = `<main><h1>Security release</h1><div id="post_1" class="topic-body crawler-post"><div class="crawler-post-meta"><p>${reply}</p></div><div class="post" itemprop="text"><p>${announcement}</p></div></div><div id="post_2" class="crawler-post" itemprop="comment"><div class="post" itemprop="text"><p>${reply}</p><article><p>${reply}</p></article></div></div></main>`;
  assert.equal(publisherExcerpt(page), announcement);
  assert.equal(
    publisherExcerpt(page.replace('id="post_1"', 'id="post_9"')),
    reply,
  );
});

void test('title-matched legacy columns exclude previous entries, nested widgets and sidebars', () => {
  const page = `<title>Small compiler</title><div><h1>Small compiler</h1>
    <p>${reporting}</p><p>A second paragraph documents compiler size and historical measurements from the publisher.</p>
    <h1>Previously</h1><p>Previous entry prose must never become evidence for the current article.</p>
    </div><div><p>Sidebar biography must never become evidence for the current article.</p></div>`;
  assert.match(publisherExcerpt(page), /historical measurements/);
  assert.doesNotMatch(
    publisherExcerpt(page),
    /Previous entry|Sidebar biography/,
  );
  assert.equal(
    publisherExcerpt(
      page.replace(
        '<title>Small compiler</title>',
        '<title>Other page</title>',
      ),
    ),
    '',
  );
  assert.equal(
    publisherExcerpt(page.replace('<title>Small compiler</title>', '')),
    '',
  );
  assert.doesNotMatch(
    publisherExcerpt(
      page.replace(
        '<h1>Previously</h1>',
        '<div><p>Nested widget must not enter the excerpt despite a matching page title.</p></div>',
      ),
    ),
    /Nested widget|Previous entry/,
  );
});

void test('title-matched book chapters start at introduction and stop before footnotes', () => {
  const chapter = `<title>500 Lines or LessA 3D Modeller</title>
    <div class="titlebox"><h1>500 Lines or Less<br>A 3D Modeller</h1></div>
    <div class="banner"><p>${'Unrelated promotion '.repeat(8)}</p></div>
    <p>${'Author biography '.repeat(8)}</p><h2 id="introduction">Introduction</h2>
    <p>${reporting}</p><div class="footnotes"><p>${'Unrelated footnote '.repeat(8)}</p></div>`;
  assert.equal(publisherExcerpt(chapter), reporting);
  assert.equal(
    publisherExcerpt(
      chapter.replace(
        'LessA 3D Modeller</title>',
        'LessAnother Chapter</title>',
      ),
    ),
    '',
  );
  assert.equal(
    publisherExcerpt(chapter.replace('id="introduction"', 'id="other"')),
    '',
  );
});

void test('sectioned magazine prose excludes promotion, captions and related stories', () => {
  const promotion =
    'Subscribe to our science magazine and support independent journalism today.';
  const section = `<div class="post__content__section" data-role="selectable"><div class="post__content wysiwyg"><p>${reporting}</p></div><div class="caption"><p>${promotion}</p></div></div>`;
  const page = `<div id="postBody"><h1>Science reporting</h1><p>${promotion}</p>${section}${section}<div><p>${promotion}</p></div></div>`;
  assert.equal(publisherExcerpt(page), `${reporting} ${reporting}`);
  for (const changed of [
    page.replace('id="postBody"', ''),
    page.replace('<h1>Science reporting</h1>', ''),
    page.replaceAll('data-role="selectable"', ''),
  ]) {
    assert.equal(publisherExcerpt(changed), '');
  }
});

void test('bare documents provide consecutive opening prose without later sections or widgets', () => {
  const opening = `<h1>A programming tutorial</h1><p>${reporting}</p><p>${reporting}</p>`;
  const page = `<link rel="stylesheet" href="style.css">${opening}<h2>References</h2><p>${'Unrelated reference '.repeat(8)}</p>`;
  assert.equal(publisherExcerpt(page), `${reporting} ${reporting}`);
  for (const changed of [
    `<div>Navigation</div>${page}`,
    page.replace('<h1>A programming tutorial</h1>', ''),
    `${page}<h1>Another story</h1>`,
    `<h1>Tutorial</h1><p>${reporting}</p><div>Widget</div><p>${reporting}</p>`,
    `<h1>Tutorial</h1><p>${reporting}</p><p><script>widget()</script>${reporting}</p>`,
  ])
    assert.equal(publisherExcerpt(changed), '');
});
