import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { loadArticleCandidates } from '../src/modules/digests/database/article-candidates';
import { rankFallback } from '../src/modules/digests/domain/rank';
import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';
import { HackerNewsAdapter } from '../src/modules/ingestion/adapters/hn.adapter';
import { PostgresContentRepository } from '../src/modules/ingestion/database/content.repository';
import { canonicalUrl } from '../src/modules/ingestion/domain/normalize';
import { ingest } from '../src/modules/ingestion/ingest';
const fixture = (name: string) =>
  readFile(`apps/api/test/fixtures/${name}`, 'utf8');
void test('recorded Google News headline links are not reporting excerpts', async () => {
  const xml = await fixture('google-news.xml');
  const items = parseFeed(xml);
  assert.equal(items.length, 2);
  assert.ok(items.every((item) => item.excerpt === ''));
  assert.equal(items[0].publisher?.name, 'Futurism');
  assert.equal(items[1].publisher?.name, "Tom's Hardware");
  const fallback = (rows: typeof items) =>
    rankFallback(
      rows.map((item, index) => ({
        ...item,
        id: String(index),
        points: 0,
        sources: ['Google News'],
      })),
      new Date('2026-10-31T00:00:00Z'),
      new Date('2026-11-01T00:00:00Z'),
      5,
    );
  assert.deepEqual(fallback(items), []);
  const withReporting = xml.replace(
    '</description>',
    ' Additional reporting supplied by the feed.</description>',
  );
  const revised = parseFeed(withReporting);
  assert.match(
    revised[0].excerpt,
    /Additional reporting supplied by the feed\.$/,
  );
  assert.equal(revised[1].excerpt, '');
  assert.equal(fallback(revised).length, 1);
  for (let i = 0; i < items.length; i++) {
    assert.deepEqual({ ...revised[i], excerpt: '' }, items[i]);
  }
  const content = parseFeed(
    xml.replace(
      '</item>',
      '<content:encoded><![CDATA[<p>Actual article evidence.</p>]]></content:encoded></item>',
    ),
  );
  assert.equal(content[0].excerpt, 'Actual article evidence.');
  assert.equal(content[1].excerpt, '');
  const otherHost = parseFeed(xml.replaceAll('news.google.com', 'example.com'));
  assert.ok(otherHost.every((item) => item.excerpt.length > 0));
  const otherPath = parseFeed(xml.replaceAll('/rss/articles/', '/report/'));
  assert.ok(otherPath.every((item) => item.excerpt.length > 0));
});

void test('recorded Destructoid contents gives excerpt space back to reporting', async () => {
  const xml = await fixture('destructoid.xml');
  const [item] = parseFeed(xml);
  const withoutContents = xml.replace(
    /<div class="wp-block-yoast-seo-table-of-contents yoast-table-of-contents">[\s\S]*?<\/div>/g,
    ' ',
  );
  assert.deepEqual(parseFeed(xml), parseFeed(withoutContents));
  assert.doesNotMatch(item.excerpt, /Table of contents/);
  assert.equal(
    item.excerpt.match(/Map fragment at The \$\.\$\. Rocky location/g)?.length,
    1,
  );
  assert.match(item.excerpt, /southern end/);
  assert.match(item.excerpt, /lower levels of the large ship/);
  assert.ok(item.excerpt.length <= 1500);
  assert.match(item.excerpt, /…$/);
});

void test('Yoast contents removal preserves article structure and unrelated blocks', () => {
  const contents =
    '<h2>Table of contents</h2><ul><li><a href="#event">Repeated heading</a></li></ul>';
  const body = `<p>Opening reporting.</p>
    <div class="wp-block-yoast-seo-table-of-contents yoast-table-of-contents">${contents}</div>
    <h2 id="event">Event schedule</h2><ul><li>October 27</li></ul>
    <div class="other-contents">${contents}</div>
    <div class="wp-block-yoast-seo-table-of-contents yoast-table-of-contents"><p>Article reporting inside a different structure.</p></div>
    <p>The article discusses yoast-table-of-contents.</p>`;
  const [item] = parseFeed(`<rss><channel><item>
    <title>Report</title><link>https://example.com/story</link>
    <pubDate>2026-11-14T00:00:00Z</pubDate>
    <description><![CDATA[${body}]]></description></item></channel></rss>`);
  assert.equal(
    item.excerpt,
    'Opening reporting. Event schedule October 27 Table of contents Repeated heading Article reporting inside a different structure. The article discusses yoast-table-of-contents.',
  );
});

void test('recorded GameSpot navigation gives excerpt space back to reporting', async () => {
  const xml = await fixture('gamespot.xml');
  const [item] = parseFeed(xml);
  const withoutNavigation = xml.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, ' ');
  assert.deepEqual(parseFeed(xml), parseFeed(withoutNavigation));
  assert.doesNotMatch(item.excerpt, /In This Article/);
  assert.match(item.excerpt, /10 AM local time on October 27/);
  assert.match(item.excerpt, /Pikachu wearing a hat and capelet/);
  assert.ok(item.excerpt.length <= 1500);
  assert.match(item.excerpt, /…$/);
});

void test('GameSpot navigation removal preserves headings, lists and other navigation', () => {
  const body = `<p>Opening reporting.</p>
    <nav class="wp-block-gamespot-blocks-toc" aria-label="Table of Contents"><a href="#event">Repeated heading</a></nav>
    <h2 id="event">Event schedule</h2><ul><li>October 27</li></ul>
    <nav class="other-navigation">Other navigation</nav>
    <p>The article discusses wp-block-gamespot-blocks-toc.</p>`;
  const [item] = parseFeed(`<rss><channel><item>
    <title>Report</title><link>https://example.com/story</link>
    <pubDate>2026-11-14T00:00:00Z</pubDate>
    <description><![CDATA[${body}]]></description></item></channel></rss>`);
  assert.equal(
    item.excerpt,
    'Opening reporting. Event schedule October 27 Other navigation The article discusses wp-block-gamespot-blocks-toc.',
  );
});

void test('recorded post footers omit repeated headlines and retain reporting metadata', async () => {
  for (const name of ['basketball-insiders.xml', 'insider-gaming.xml']) {
    const items = parseFeed(await fixture(name));
    assert.ok(items.length >= 2);
    for (const item of items) {
      assert.doesNotMatch(item.excerpt, /The post .* appeared first on/);
      assert.ok(item.excerpt.length > 50);
      assert.ok(item.url && item.title && item.publishedAt);
    }
  }
  const nba = parseFeed(await fixture('basketball-insiders.xml'))[0];
  assert.match(nba.excerpt, /43 points/);
  assert.match(nba.excerpt, /117-112/);
  const gaming = parseFeed(await fixture('insider-gaming.xml'))[0];
  assert.match(gaming.excerpt, /security ahead of GTA 6/);
});

void test('post footer removal requires terminal navigation back to the article', () => {
  const item = (body: string) =>
    parseFeed(`<rss><channel><item>
    <title>Report</title><link>https://example.com/story</link>
    <pubDate>2026-11-14T00:00:00Z</pubDate>
    <description><![CDATA[${body}]]></description>
    </item></channel></rss>`)[0];
  const footer = (url: string) =>
    `<p>The post <a href="${url}">Report</a> appeared first on <a href="https://example.com">Publisher</a>.</p>`;
  assert.equal(
    item(
      '<p>Reporting…</p>' +
        footer('https://example.com/story?utm_source=rss#top'),
    ).excerpt,
    'Reporting…',
  );
  assert.match(
    item('<p>Reporting.</p>' + footer('https://other.example/story')).excerpt,
    /appeared first on/,
  );
  assert.match(
    item(footer('https://example.com/story') + '<p>More reporting.</p>')
      .excerpt,
    /appeared first on/,
  );
  assert.match(
    item('<p>Reporting. The post Report appeared first on Publisher.</p>')
      .excerpt,
    /appeared first on/,
  );
  assert.equal(item(footer('https://example.com/story')).excerpt, '');
});

void test('recorded publisher self-link footers leave truncated reporting visible', async () => {
  for (const name of ['vgc.xml', 'gematsu.xml']) {
    const xml = await fixture(name);
    const items = parseFeed(xml);
    const withoutFooter = parseFeed(
      xml.replace(/<p><a [^>]*>Source<\/a><\/p>/g, ''),
    );
    assert.equal(items.length, 2);
    assert.deepEqual(items, withoutFooter);
    for (const item of items) assert.match(item.excerpt, /…$/);
  }
});

void test('feed self-link removal preserves external, inline and nonterminal source links', () => {
  const item = (body: string) =>
    parseFeed(`<rss><channel><item>
    <title>Report</title><link>https://example.com/story</link>
    <pubDate>2026-11-14T00:00:00Z</pubDate>
    <description><![CDATA[${body}]]></description></item></channel></rss>`)[0];
  const source = (url: string) =>
    `<p><a rel="nofollow" href="${url}">Source</a></p>`;
  assert.equal(
    item('Reporting…' + source('https://example.com/story?utm_source=feed'))
      .excerpt,
    'Reporting…',
  );
  assert.equal(
    item('Reporting…' + source('https://example.com/other')).excerpt,
    'Reporting… Source',
  );
  assert.equal(
    item(
      'Reporting…' +
        source('https://example.com/story') +
        '<p>More reporting.</p>',
    ).excerpt,
    'Reporting… Source More reporting.',
  );
  assert.equal(
    item(
      '<p>Reporting cites <a href="https://example.com/story">Source</a>.</p>',
    ).excerpt,
    'Reporting cites Source.',
  );
  assert.equal(
    item('Reporting…' + source('javascript:alert(1)')).excerpt,
    'Reporting… Source',
  );
});

void test('recorded Verge opening figure supplies its missing lead image', async () => {
  const xml = await fixture('verge-commerce-2026-11-13.xml');
  const [item] = parseFeed(xml);
  assert.equal(
    item.imageUrl,
    'https://platform.theverge.com/wp-content/uploads/sites/2/2026/11/cmf-by-nothing-speaker-s-breakout.png?crop=0%2C0%2C100%2C100&quality=90&strip=all',
  );
  const [withoutFigure] = parseFeed(
    xml.replace(/&lt;figure&gt;[\s\S]*?&lt;\/figure&gt;/, ''),
  );
  assert.equal(withoutFigure.imageUrl, null);
  assert.equal(item.excerpt, withoutFigure.excerpt);
  assert.match(item.excerpt, /^Bluetooth speakers are often boring boxes/);
  assert.doesNotMatch(item.excerpt, /Image: CMF by Nothing/);
});

void test('feed opening photo captions do not displace reporting', () => {
  const item = (body: string) =>
    parseFeed(`<rss><channel><item><title>Airport report</title>
    <link>https://example.com/airport</link><pubDate>2026-11-14T00:00:00Z</pubDate>
    <content:encoded><![CDATA[${body}]]></content:encoded>
    <description>Publisher teaser.</description></item></channel></rss>`)[0];
  const figure =
    '<figure class="lead"><img src="https://example.com/photo.jpg" /><figcaption>Planes on June 3. | Photo: Agency <a href="https://example.com/credit">Credit</a></figcaption></figure>';
  assert.equal(
    item(figure + '<p>Flights stopped on Friday.</p>').excerpt,
    'Flights stopped on Friday.',
  );
  assert.equal(item(figure).excerpt, 'Publisher teaser.');
  assert.equal(item(figure).imageUrl, 'https://example.com/photo.jpg');
  // Later captions, caption-like prose and reporting inside a figure survive.
  assert.match(item('<p>Reporting.</p>' + figure).excerpt, /Planes on June 3/);
  assert.equal(
    item('<p>Photo: Agency reported the closure.</p>').excerpt,
    'Photo: Agency reported the closure.',
  );
  assert.match(
    item(
      figure.replace('<figcaption>', '<p>Article reporting.</p><figcaption>'),
    ).excerpt,
    /Article reporting/,
  );
});

void test('feed lead figures preserve media priority and reject unsafe or later images', () => {
  const item = (body: string, media = '') =>
    parseFeed(`<rss><channel><item>
    <title>Lead image</title><link>https://example.com/story</link>
    <pubDate>2026-11-14T00:00:00Z</pubDate>${media}
    <content:encoded><![CDATA[${body}]]></content:encoded>
    </item></channel></rss>`)[0];
  const figure = (src: string) =>
    `<figure><img alt="Cover" src='${src}' /></figure>`;
  assert.equal(
    item(figure('https://example.com/cover.jpg')).imageUrl,
    'https://example.com/cover.jpg',
  );
  assert.equal(
    item(
      figure('https://example.com/cover.jpg'),
      '<media:thumbnail url="https://example.com/media.jpg"/>',
    ).imageUrl,
    'https://example.com/media.jpg',
  );
  for (const src of [
    'javascript:alert(1)',
    'data:image/png;base64,a',
    '/relative.jpg',
    'https://user:password@example.com/cover.jpg',
  ]) {
    assert.equal(item(figure(src)).imageUrl, null);
  }
  assert.equal(
    item('<p>Reporting first.</p>' + figure('https://example.com/later.jpg'))
      .imageUrl,
    null,
  );
  assert.equal(
    item('<figure><img data-src="https://example.com/lazy.jpg" /></figure>')
      .imageUrl,
    null,
  );
  assert.equal(
    item('<img src="https://example.com/pixel.jpg" />').imageUrl,
    null,
  );
});

void test('recorded Verge commerce keeps reporting without the terminal ad config', async () => {
  const xml = await fixture('verge-commerce-2026-11-13.xml');
  const [item] = parseFeed(xml);
  assert.match(item.excerpt, /CMF Speaker S/);
  assert.match(item.excerpt, /18 hours on a single charge/);
  assert.ok(item.excerpt.endsWith('create their own attachments and looks.'));
  assert.doesNotMatch(item.excerpt, /HYPE_DESK|productImageUrl|Beats|Walmart/);
  assert.ok(item.excerpt.length < 1500);
  const reportingOnly = xml.replace(
    /&lt;div id="hype-desk-root"[\s\S]*?(?=<\/content>)/,
    '',
  );
  assert.notEqual(reportingOnly, xml);
  const [withoutWidget] = parseFeed(reportingOnly);
  assert.deepEqual(item, withoutWidget);
  assert.equal(item.author, 'Brad Bourque');
  assert.equal(item.publishedAt, '2026-11-13T20:30:00.000Z');
});

void test('feed ad removal requires the exact terminal widget and configuration', () => {
  const excerpt = (body: string) =>
    parseFeed(`<rss><channel><item><title>Code reporting</title>
    <link>https://example.com/code</link><pubDate>2026-11-14T00:00:00Z</pubDate>
    <description><![CDATA[${body}]]></description></item></channel></rss>`)[0]
      .excerpt;
  const widget = '<div id="hype-desk-root"></div>';
  const config = 'window.HYPE_DESK_CONFIG = { productTitle: "Advertisement" };';
  assert.equal(excerpt(`<p>Reporting.</p>${widget}${config}`), 'Reporting.');
  assert.equal(excerpt(config), config);
  assert.match(
    excerpt(`${widget}${config}<p>More reporting.</p>`),
    /More reporting\.$/,
  );
  assert.match(excerpt(`${widget}window.OTHER_CONFIG = {};`), /OTHER_CONFIG/);
  assert.equal(excerpt(`${widget}<p>Reporting.</p>`), 'Reporting.');
});

void test('recorded Ars content takes precedence and retains reporting and metadata', async () => {
  const xml = await fixture('ars-outage-2026-11-13.xml');
  const [original] = parseFeed(xml);
  // Removing the teaser must leave the same reporting and metadata.
  const [body] = parseFeed(
    xml.replace(/<description>[\s\S]*?<\/description>/, ''),
  );
  assert.equal(original.excerpt, body.excerpt);
  assert.match(body.excerpt, /Recovery actions are ongoing/);
  assert.match(body.excerpt, /extended email timeout to 48 hours/);
  assert.equal(body.excerpt.length, 593);
  assert.doesNotMatch(body.excerpt, /<[^>]+>/);
  assert.equal(body.author, 'Ashley Belanger');
  assert.equal(body.publishedAt, '2026-11-13T15:26:53.000Z');
  assert.equal(
    body.imageUrl,
    'https://cdn.arstechnica.net/wp-content/uploads/2026/11/GettyImages-2191081646-1024x648.jpg',
  );
  const { excerpt: _originalExcerpt, ...originalMetadata } = original;
  const { excerpt: _bodyExcerpt, ...bodyMetadata } = body;
  assert.deepEqual(bodyMetadata, originalMetadata);
});

void test('feed content paths retain bounded text, blank fallback and X citations', () => {
  const teaser = 'Short source description';
  const description = `<description>${teaser}</description>`;
  const body = `<content:encoded><![CDATA[<p>${'Evidence '.repeat(250)}</p><a href="https://x.com/reporter/status/1234567890123456789">Report</a>]]></content:encoded>`;
  const rss = (fields: string) =>
    `<rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><item><title>Test</title><link>https://example.org/story</link><pubDate>2026-11-13T00:00:00Z</pubDate>${fields}</item></channel></rss>`;
  const [contentOnly] = parseFeed(rss(body));
  assert.equal(
    parseFeed(rss(description + body))[0].excerpt,
    contentOnly.excerpt,
  );
  assert.ok(contentOnly.excerpt.length <= 1500);
  assert.equal(contentOnly.excerpt, 'Evidence '.repeat(166).trim() + '…');
  assert.deepEqual(
    parseFeed(rss(description + body))[0].xLinks,
    contentOnly.xLinks,
  );
  assert.equal(contentOnly.xLinks?.length, 1);
  assert.equal(
    parseFeed(
      rss(
        `${description}<content:encoded><![CDATA[<p> </p>]]></content:encoded>`,
      ),
    )[0].excerpt,
    teaser,
  );
  const atom = (content: string) =>
    `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Test</title><link href="https://example.org/story"/><updated>2026-11-13T00:00:00Z</updated>${content}</entry></feed>`;
  assert.equal(
    parseFeed(
      atom(
        '<summary>Atom teaser</summary><content type="html">&lt;p&gt;Atom article evidence&lt;/p&gt;</content>',
      ),
    )[0].excerpt,
    'Atom article evidence',
  );
  assert.equal(
    parseFeed(
      atom(
        '<summary>Atom summary</summary><content type="html">&lt;p&gt; &lt;/p&gt;</content>',
      ),
    )[0].excerpt,
    'Atom summary',
  );
});

void test('recorded RSS and Atom normalize real headlines, dates and safe links', async () => {
  for (const name of [
    'rss.xml',
    'atom.xml',
    'yahoo-nba.xml',
    'eurogamer.xml',
    'nintendo-life.xml',
    'vgc.xml',
    'gamedeveloper.xml',
    'gamingbolt.xml',
    'pushsquare.xml',
    'gamesradar.xml',
    'gamespot.xml',
    'hoopsrumors.xml',
    'realgm.xml',
    'sbnation-nba.xml',
    'basketball-insiders.xml',
    'yardbarker-nba.xml',
    'destructoid.xml',
    'al-jazeera.xml',
    'aftermath.xml',
    'gematsu.xml',
    'kotaku.xml',
    'npr-world.xml',
    'guardian-world.xml',
  ]) {
    const items = parseFeed(await fixture(name));
    assert.equal(items.length, 2);
    assert.ok(
      items.every(
        (i) =>
          i.title && i.url.startsWith('https://') && Date.parse(i.publishedAt),
      ),
    );
  }
  assert.throws(() => parseFeed('<html>blocked</html>'), /Unsupported/);
  assert.throws(() => parseFeed('<!DOCTYPE rss><rss/>'), /Invalid/);
  const encoded = parseFeed(
    '<rss><channel><item><title>A &amp;amp; B &#039;ok&#039;</title><link>https://example.org/?a=1&amp;b=2</link><pubDate>2026-11-01T00:00:00Z</pubDate></item></channel></rss>',
  )[0];
  assert.equal(encoded.title, "A & B 'ok'");
  assert.equal(encoded.url, 'https://example.org/?a=1&b=2');
  assert.equal(
    parseFeed(
      '<rss><channel><item><title>No date</title><link>https://example.org</link></item></channel></rss>',
    ).length,
    0,
  );
  assert.equal(
    canonicalUrl('https://example.org/a?utm_source=x&b=2#top'),
    'https://example.org/a?b=2',
  );
  assert.equal(canonicalUrl('javascript:alert(1)'), null);
});
void test('recorded Gaming feeds discover X citations from encoded content and descriptions', async () => {
  const bolt = parseFeed(await fixture('gamingbolt.xml'));
  const square = parseFeed(await fixture('pushsquare.xml'));
  assert.deepEqual(
    bolt.flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? []),
    ['2117074929594298758', '2116088984703209689'],
  );
  assert.deepEqual(
    square.flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? []),
    ['2116822592556580874'],
  );
  assert.equal(bolt[0].publishedAt, '2026-11-02T03:31:07.000Z');
  assert.match(bolt[0].title, /Phantom Blade Zero/);
  assert.ok(
    bolt.every((item) => new URL(item.url).hostname === 'gamingbolt.com'),
  );
  assert.ok(
    square.every((item) => new URL(item.url).hostname === 'www.pushsquare.com'),
  );
  assert.ok([...bolt, ...square].every((item) => item.excerpt.length <= 1500));
});
void test('recorded GamesRadar and GameSpot feeds retain publisher X citations and original dates', async () => {
  const radar = parseFeed(await fixture('gamesradar.xml'));
  const spot = parseFeed(await fixture('gamespot.xml'));
  assert.deepEqual(
    radar.flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? []),
    ['2116073492521394429', '2116088984703209689', '2115337924376141927'],
  );
  assert.deepEqual(
    spot.flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? []),
    ['2116827467977527751'],
  );
  assert.equal(radar[0].publishedAt, '2026-10-30T18:31:42.000Z');
  assert.match(radar[0].title, /Marathon/);
  assert.ok(
    radar.every((item) => new URL(item.url).hostname === 'www.gamesradar.com'),
  );
  assert.ok(
    spot.every((item) => new URL(item.url).hostname === 'www.gamespot.com'),
  );
  assert.ok([...radar, ...spot].every((item) => item.excerpt.length <= 1500));
});
void test('recorded Aftermath RSS preserves article citations and separates excerpts from full content', async () => {
  const items = parseFeed(await fixture('aftermath.xml'));
  assert.equal(items[0].title, 'Itch Is Being Flooded By AI-Generated Garbage');
  assert.equal(items[0].publishedAt, '2026-11-01T23:52:20.000Z');
  assert.equal(items[1].publishedAt, '2026-10-30T19:59:05.000Z');
  assert.deepEqual(items[0].xLinks, []);
  assert.deepEqual(items[1].xLinks, [
    {
      externalId: '2115869254688063857',
      verificationUrl:
        'https://twitter.com/socialistadri/status/2115869254688063857',
      url: 'https://x.com/i/web/status/2115869254688063857',
    },
    {
      externalId: '2043182942982373785',
      verificationUrl:
        'https://twitter.com/HnD_Productions/status/2043182942982373785',
      url: 'https://x.com/i/web/status/2043182942982373785',
    },
  ]);
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'aftermath.site'),
  );
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(items.every((item) => !/<[^>]+>/.test(item.excerpt)));
});
void test('recorded Al Jazeera RSS retains World headlines and dates without inventing social citations', async () => {
  const items = parseFeed(await fixture('al-jazeera.xml'));
  assert.equal(
    items[0].title,
    'Sudan files complaints against Ethiopia with UN over deadly drone spree',
  );
  assert.equal(items[0].publishedAt, '2026-11-02T10:25:22.000Z');
  assert.equal(items[1].publishedAt, '2026-11-02T10:24:47.000Z');
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.aljazeera.com'),
  );
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(
    items.every((item) => item.author === null && item.imageUrl === null),
  );
  assert.deepEqual(
    items.flatMap((item) => item.xLinks ?? []),
    [],
  );
});
void test('recorded Destructoid RSS preserves encoded-content citations without promoting guide links', async () => {
  const items = parseFeed(await fixture('destructoid.xml'));
  assert.equal(items[0].publishedAt, '2026-11-02T10:22:16.000Z');
  assert.equal(items[0].author, 'Kacee Fay');
  assert.deepEqual(items[0].xLinks, []);
  assert.equal(items[1].publishedAt, '2026-10-31T19:16:39.000Z');
  assert.equal(items[1].author, 'Pedro Peres');
  assert.match(items[1].title, /Bungie’s new leadership/);
  assert.deepEqual(items[1].xLinks, [
    {
      externalId: '2116086082341306812',
      verificationUrl:
        'https://twitter.com/S14deane/status/2116086082341306812',
      url: 'https://x.com/i/web/status/2116086082341306812',
    },
  ]);
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.destructoid.com'),
  );
  assert.ok(items.every((item) => item.excerpt.length <= 1500));
  assert.doesNotMatch(items[1].excerpt, /<[^>]+>|&#\d+;/);
});
void test('recorded Hoops Rumors RSS preserves NBA reporter and official team citations', async () => {
  const items = parseFeed(await fixture('hoopsrumors.xml'));
  assert.equal(
    items[0].title,
    'NBA Suspends Hawks’ Kingston Flemings For One Game',
  );
  assert.equal(items[0].publishedAt, '2026-11-02T02:02:18.000Z');
  assert.equal(items[1].publishedAt, '2026-11-02T01:09:01.000Z');
  assert.deepEqual(
    items
      .flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? [])
      .sort(),
    [
      '2117092005188878390',
      '2116712563430060542',
      '2117071860672143746',
      '2117052664475263042',
      '2117056008900014458',
      '2117052480076837082',
    ].sort(),
  );
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.hoopsrumors.com'),
  );
  assert.ok(items.every((item) => item.excerpt.length <= 1500 && item.author));
  assert.doesNotMatch(items[0].excerpt, /<[^>]+>|&#\d+;/);
});
void test('recorded Nintendo Life feed preserves release news and plain excerpts', async () => {
  const items = parseFeed(await fixture('nintendo-life.xml'));
  assert.equal(
    items[0].title,
    "HoYoverse Announces Cosy Galactic Life Sim 'Petit Planet' For Switch 2",
  );
  assert.equal(items[0].publishedAt, '2026-11-02T03:30:00.000Z');
  assert.match(items[0].excerpt, /2027/);
  assert.ok(
    items.every(
      (item) => new URL(item.url).hostname === 'www.nintendolife.com',
    ),
  );
  assert.doesNotMatch(items[0].excerpt, /<[^>]+>|&#\d+;/);
  assert.equal(items[0].xLinks?.length, 0);
});
void test('recorded world feeds retain publisher links, bylines and plain excerpts', async () => {
  const npr = parseFeed(await fixture('npr-world.xml'));
  assert.equal(npr[0].author, 'Ayesha Rascoe');
  assert.equal(npr[0].publishedAt, '2026-11-01T13:15:28.000Z');
  assert.ok(npr.every((item) => new URL(item.url).hostname === 'www.npr.org'));
  assert.match(npr[1].excerpt, /ministers' meeting/);
  const guardian = parseFeed(await fixture('guardian-world.xml'));
  assert.ok(
    guardian.every(
      (item) => new URL(item.url).hostname === 'www.theguardian.com',
    ),
  );
  assert.match(guardian[0].title, /illegal gold mining/);
  assert.ok(guardian[0].author);
  assert.doesNotMatch(guardian[0].excerpt, /<\/?(?:p|a|em)\b/);
  assert.ok(guardian[0].imageUrl?.startsWith('https://'));
});
void test('recorded platform feeds preserve first-party links, dates and author attribution', async () => {
  const playstation = parseFeed(await fixture('playstation.xml'));
  const xbox = parseFeed(await fixture('xbox.xml'));
  assert.equal(playstation.length, 2);
  assert.equal(xbox.length, 2);
  assert.ok(
    playstation.every(
      (item) => new URL(item.url).hostname === 'blog.playstation.com',
    ),
  );
  assert.ok(
    xbox.every((item) => new URL(item.url).hostname === 'news.xbox.com'),
  );
  assert.equal(playstation[0].publishedAt, '2026-10-30T16:55:53.000Z');
  assert.equal(playstation[0].author, 'O’Dell Harmon Jr. (he/him)');
  assert.equal(xbox[1].author, 'Mike Nelson, XBOX Wire Editor');
  assert.match(xbox[1].excerpt, /Avatar State Patch is available today/);
  assert.doesNotMatch(xbox[1].excerpt, /<\/?(?:p|a)\b|&#\d+;/);
  assert.ok(
    [...playstation, ...xbox].every((item) => item.excerpt.length <= 1500),
  );
});
void test('recorded PC gaming feeds retain publisher bylines, excerpts and lead media', async () => {
  const pcgamer = parseFeed(await fixture('pcgamer.xml'));
  const rps = parseFeed(await fixture('rps.xml'));
  assert.equal(pcgamer.length, 2);
  assert.equal(rps.length, 2);
  assert.ok(
    pcgamer.every((item) => new URL(item.url).hostname === 'www.pcgamer.com'),
  );
  assert.ok(
    rps.every(
      (item) => new URL(item.url).hostname === 'www.rockpapershotgun.com',
    ),
  );
  assert.equal(pcgamer[0].author, 'Justin Wagner');
  assert.equal(pcgamer[0].publishedAt, '2026-11-01T18:41:29.000Z');
  assert.equal(
    pcgamer[0].excerpt,
    'Melvor Idle 2 has gained a subtitle: A RuneScape Adventure.',
  );
  assert.equal(rps[0].author, 'Oisin Kuhnke');
  assert.equal(rps[0].publishedAt, '2026-11-01T19:08:44.000Z');
  assert.match(rps[1].excerpt, /February 23rd, 2027/);
  assert.ok(
    [...pcgamer, ...rps].every(
      (item) =>
        item.imageUrl?.startsWith('https://') && item.excerpt.length <= 1500,
    ),
  );
  assert.doesNotMatch(rps[0].excerpt, /<\/?(?:p|a)\b/);
});
void test('Hacker News fixture preserves engagement and excludes deleted items', async () => {
  const records = JSON.parse(await fixture('hn.json'));
  records[0].text = 'It&#x27;s &amp; more <p>text</p>';
  const adapter = new HackerNewsAdapter({
    get: async (url) =>
      url.endsWith('topstories.json')
        ? JSON.stringify([records[0].id, records[1].id, 42])
        : url.endsWith('/42.json')
          ? '{"deleted":true}'
          : JSON.stringify(
              records.find((r: { id: number }) =>
                url.endsWith(`/${r.id}.json`),
              ),
            ),
  });
  const items = await adapter.collect({
    id: 'test',
    topicId: '',
    name: '',
    kind: 'hn',
    url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
  });
  assert.equal(items.length, 2);
  assert.equal(items[0].engagement.points, records[0].score);
  assert.equal(items[0].excerpt, "It's & more text");
});
void test('Postgres ingestion is idempotent and records failure without losing last success', async () => {
  const repository = new PostgresContentRepository();
  const id = `test-${Date.now()}`;
  try {
    await repository.db.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url) SELECT $1,id,'Fixture integration','feed','https://example.org/fixture' FROM topics ORDER BY position LIMIT 1`,
      [id],
    );
    await repository.db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) SELECT topic_id,id FROM content_sources WHERE id=$1',
      [id],
    );
    const source = (await repository.sources()).find((s) => s.id === id)!;
    const item = {
      ...parseFeed(await fixture('rss.xml'))[0],
      url: `https://example.org/${id}`,
      xLinks: [
        {
          externalId: '123456789',
          url: 'https://twitter.com/reporter/status/123456789?s=20',
        },
      ],
      engagement: { points: 42 },
    };
    const adapter = { collect: async () => [item, item] };
    await ingest(repository, { feed: adapter, hn: adapter }, id);
    await ingest(repository, { feed: adapter, hn: adapter }, id);
    assert.equal(
      (
        await repository.db.query(
          'SELECT count(*)::int AS n FROM content_observations WHERE source_id=$1',
          [id],
        )
      ).rows[0].n,
      1,
    );
    const citations = await repository.db.query(
      'SELECT external_id,canonical_url,citing_engagement FROM x_link_citations WHERE source_id=$1',
      [id],
    );
    assert.equal(citations.rowCount, 1);
    assert.equal(citations.rows[0].external_id, '123456789');
    assert.equal(
      citations.rows[0].canonical_url,
      'https://x.com/i/web/status/123456789',
    );
    assert.deepEqual(citations.rows[0].citing_engagement, { points: 42 });
    const readPublisher = async () =>
      (
        await repository.db.query(
          'SELECT publisher FROM content_items WHERE canonical_url=$1',
          [item.url],
        )
      ).rows[0].publisher;
    assert.equal(await readPublisher(), null);
    const publisher = { name: 'Reuters', url: 'https://www.reuters.com/' };
    await repository.store(source, [{ ...item, publisher }]);
    assert.deepEqual(await readPublisher(), publisher);
    // A title-only or direct feed observing the same URL must not erase evidence.
    await repository.store(source, [item]);
    assert.deepEqual(await readPublisher(), publisher);
    const updatedPublisher = { name: 'Reuters', url: null };
    await repository.store(source, [{ ...item, publisher: updatedPublisher }]);
    assert.deepEqual(await readPublisher(), updatedPublisher);
    const published = new Date(item.publishedAt).getTime();
    const candidates = await loadArticleCandidates(
      repository.db,
      source.topicId,
      new Date(published),
      new Date(published + 1),
    );
    assert.deepEqual(
      candidates.find((candidate) => candidate.url === item.url)?.publisher,
      updatedPublisher,
    );
    const empty = { collect: async () => [] };
    await assert.rejects(
      ingest(repository, { feed: empty, hn: empty }, id),
      /no usable/,
    );
    const state = (
      await repository.db.query(
        'SELECT last_success,last_error FROM content_sources WHERE id=$1',
        [source.id],
      )
    ).rows[0];
    assert.ok(state.last_success);
    assert.match(state.last_error, /no usable/);
  } finally {
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [id],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE source_id=$1',
      [id],
    );
    await repository.db.query('DELETE FROM content_sources WHERE id=$1', [id]);
    await repository.db.query(
      'DELETE FROM content_items WHERE canonical_url=$1',
      [`https://example.org/${id}`],
    );
    await repository.onModuleDestroy();
  }
});
void test('recorded feed reporting survives enrichment, repeat ingestion and title-only observations', async () => {
  const repository = new PostgresContentRepository();
  const id = `ars-depth-${Date.now()}`;
  const url = `https://example.org/${id}`;
  try {
    await repository.db.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url) SELECT $1,id,'Recorded Ars depth','feed','https://example.org/fixture' FROM topics ORDER BY position LIMIT 1`,
      [id],
    );
    await repository.db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) SELECT topic_id,id FROM content_sources WHERE id=$1',
      [id],
    );
    const source = (await repository.sources()).find(
      (entry) => entry.id === id,
    )!;
    const xml = await fixture('ars-outage-2026-11-13.xml');
    const teaser = {
      ...parseFeed(
        xml.replace(/<content:encoded>[\s\S]*?<\/content:encoded>/, ''),
      )[0],
      url,
    };
    // A prior teaser-only observation is enriched by the unchanged feed fragment.
    const body = {
      ...parseFeed(xml)[0],
      url,
    };
    assert.notEqual(teaser.excerpt, body.excerpt);
    const published = new Date(body.publishedAt).getTime();
    const read = async () =>
      (
        await loadArticleCandidates(
          repository.db,
          source.topicId,
          new Date(published),
          new Date(published + 1),
        )
      ).filter((candidate) => candidate.url === url);
    await repository.store(source, [teaser]);
    const [before] = await read();
    assert.equal(before.excerpt, teaser.excerpt);
    for (const observation of [
      body,
      body,
      { ...body, excerpt: '' },
      { ...body, excerpt: '   ' },
    ]) {
      await repository.store(source, [observation]);
      const candidates = await read();
      assert.equal(candidates.length, 1);
      const [candidate] = candidates;
      assert.equal(candidate.id, before.id);
      assert.equal(candidate.excerpt, body.excerpt);
      assert.match(candidate.excerpt, /Recovery actions are ongoing/);
      assert.match(candidate.excerpt, /extended email timeout to 48 hours/);
      assert.equal(candidate.title, body.title);
      assert.equal(candidate.imageUrl, body.imageUrl);
      assert.equal(candidate.publishedAt, body.publishedAt);
      assert.deepEqual(candidate.sources, [source.name]);
    }
    const observations = await repository.db.query(
      'SELECT count(*)::int AS n FROM content_observations WHERE source_id=$1',
      [id],
    );
    assert.equal(observations.rows[0].n, 1);
  } finally {
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [id],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE source_id=$1',
      [id],
    );
    await repository.db.query('DELETE FROM content_sources WHERE id=$1', [id]);
    await repository.db.query(
      'DELETE FROM content_items WHERE canonical_url=$1',
      [url],
    );
    await repository.onModuleDestroy();
  }
});
void test('recorded AI announcement feeds preserve publisher dates, missing fields and media', async () => {
  const openai = parseFeed(await fixture('openai.xml'));
  const deepmind = parseFeed(await fixture('deepmind.xml'));
  assert.equal(openai.length, 2);
  assert.equal(deepmind.length, 2);
  assert.ok(
    openai.every((item) => new URL(item.url).hostname === 'openai.com'),
  );
  assert.ok(
    deepmind.every((item) => new URL(item.url).hostname === 'deepmind.google'),
  );
  assert.equal(openai[0].publishedAt, '2026-10-30T09:30:00.000Z');
  assert.match(openai[0].excerpt, /robots.txt/);
  assert.equal(deepmind[0].publishedAt, '2026-10-28T17:00:58.000Z');
  assert.equal(deepmind[0].excerpt, '');
  assert.equal(deepmind[0].author, null);
  assert.equal(deepmind[0].imageUrl, null);
  assert.ok(
    deepmind[1].imageUrl?.startsWith('https://lh3.googleusercontent.com/'),
  );
  assert.ok(
    [...openai, ...deepmind].every((item) => item.excerpt.length <= 1500),
  );
});

void test('recorded Gematsu RSS preserves release reporting and has no inferred X citations', async () => {
  const items = parseFeed(await fixture('gematsu.xml'));
  assert.equal(items[0].title, 'Nagoshi Studio shuts down');
  assert.equal(items[0].publishedAt, '2026-11-02T03:16:59.000Z');
  assert.equal(
    items[1].title,
    'Phantom Blade Zero sales top four million in 72 hours',
  );
  assert.equal(items[1].publishedAt, '2026-11-02T02:59:03.000Z');
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.gematsu.com'),
  );
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded Kotaku feed preserves dates without inventing page citations', async () => {
  const items = parseFeed(await fixture('kotaku.xml'));
  assert.equal(
    items[1].title,
    'Team Behind Fan-Made Oblivion Remake Face Lawsuit From Former Contributor',
  );
  assert.equal(items[1].publishedAt, '2026-11-01T21:19:05.000Z');
  assert.ok(items.every((item) => new URL(item.url).hostname === 'kotaku.com'));
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded Guardian US feed preserves US reporting without inferring page citations', async () => {
  const items = parseFeed(await fixture('guardian-us.xml'));
  assert.equal(items.length, 2);
  assert.match(items[0].title, /Haley Stevens/);
  assert.equal(items[0].publishedAt, '2026-11-02T11:06:26.000Z');
  assert.equal(items[1].publishedAt, '2026-11-02T11:00:41.000Z');
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.theguardian.com'),
  );
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded Insider Gaming feed retains reporting dates and leaves page citations unknown', async () => {
  const items = parseFeed(await fixture('insider-gaming.xml'));
  assert.equal(items.length, 3);
  assert.match(items[0].title, /PS5 Firmware Update/);
  assert.equal(items[0].publishedAt, '2026-11-02T10:58:42.000Z');
  assert.match(items[2].title, /Phantom Blade Zero/);
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'insider-gaming.com'),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded RealGM feed retains NBA reporting, EST dates and excerpts without invented citations', async () => {
  const items = parseFeed(await fixture('realgm.xml'));
  assert.equal(items.length, 2);
  assert.equal(
    items[0].title,
    'Dalen Terry, Thunder Agree To Two-Year Contract',
  );
  assert.equal(items[0].publishedAt, '2026-11-03T14:06:43.000Z');
  assert.equal(items[1].publishedAt, '2026-11-02T21:36:41.000Z');
  assert.equal(
    items[0].imageUrl,
    'https://basketball.realgm.com/images/nba/4.2/wiretap/photos/2006/Terry_Dalen_chi_221114.jpg',
  );
  assert.ok(items[0].excerpt?.includes('two-year contract'));
  assert.ok(items[1].excerpt?.includes('Wembanyama'));
  assert.ok(
    items.every(
      (item) => new URL(item.url).hostname === 'basketball.realgm.com',
    ),
  );
  assert.ok(items.every((item) => !item.excerpt?.includes('<p>')));
  assert.ok(items.every((item) => item.author === null));
  assert.ok(items.every((item) => item.xLinks?.length === 0));
});

void test('recorded SB Nation NBA Atom preserves dates, authors and embedded highlight citations', async () => {
  const items = parseFeed(await fixture('sbnation-nba.xml'));
  assert.equal(items.length, 2);
  assert.equal(
    items[0].title,
    'Draymond Green tackles opponent, brawls with another for 26th career ejection',
  );
  assert.equal(items[0].publishedAt, '2026-11-03T15:11:29.000Z');
  assert.equal(items[1].publishedAt, '2026-11-03T13:00:00.000Z');
  assert.deepEqual(
    items.map((item) => item.author),
    ['James Dator', "Ricky O'Donnell"],
  );
  assert.deepEqual(
    items.map((item) => item.xLinks),
    [
      [
        {
          externalId: '2117481817821286446',
          verificationUrl:
            'https://twitter.com/ESPNNBA/status/2117481817821286446',
          url: 'https://x.com/i/web/status/2117481817821286446',
        },
      ],
      [
        {
          externalId: '2117106779997753358',
          verificationUrl: 'https://twitter.com/NBA/status/2117106779997753358',
          url: 'https://x.com/i/web/status/2117106779997753358',
        },
      ],
    ],
  );
  assert.ok(
    items.every(
      (item) =>
        new URL(item.url).hostname === 'www.sbnation.com' &&
        new URL(item.url).pathname.startsWith('/nba/'),
    ),
  );
  assert.ok(items[0].excerpt.includes('double technical'));
  assert.ok(
    items.every(
      (item) =>
        item.excerpt.length > 0 &&
        item.excerpt.length <= 1500 &&
        !item.excerpt.includes('<p>'),
    ),
  );
  assert.deepEqual(
    items.map((item) => item.imageUrl),
    [
      null,
      'https://platform.sbnation.com/wp-content/uploads/sites/2/2026/11/gettyimages-2303061353.jpg?crop=0%2C0%2C100%2C100&quality=90&strip=all',
    ],
  );
});

void test('recorded Basketball Insiders feed preserves authored game reporting and UTC dates', async () => {
  const items = parseFeed(await fixture('basketball-insiders.xml'));
  assert.equal(items.length, 2);
  assert.equal(
    items[0].title,
    'Gilgeous-Alexander’s 43 points and late 3 hand Cavaliers their first home loss',
  );
  assert.deepEqual(
    items.map((item) => item.publishedAt),
    ['2026-11-03T12:18:28.000Z', '2026-11-03T09:57:57.000Z'],
  );
  assert.ok(
    items.every((item) => item.author === 'Basketball Insiders Editor'),
  );
  assert.ok(items[0].excerpt.includes('117-112'));
  assert.ok(items[1].excerpt.includes('Golden State'));
  assert.ok(
    items.every(
      (item) =>
        new URL(item.url).hostname === 'www.basketballinsiders.com' &&
        item.excerpt.length > 0 &&
        item.excerpt.length <= 1500 &&
        !item.excerpt.includes('<p>'),
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded Yardbarker NBA feed preserves bylines, offset dates and syndicated links', async () => {
  const items = parseFeed(await fixture('yardbarker-nba.xml'));
  assert.equal(items.length, 2);
  assert.equal(
    items[0].title,
    'Zero doubt: Russell Westbrook feted by Thunder after legendary 18-year career',
  );
  assert.deepEqual(
    items.map((item) => item.author),
    ['Andrew Wright, Yardbarker', 'Ty Bronicel, Yardbarker'],
  );
  assert.deepEqual(
    items.map((item) => item.publishedAt),
    ['2026-11-02T22:00:38.000Z', '2026-11-02T17:36:18.000Z'],
  );
  assert.ok(items[0].excerpt.includes('Oklahoma City'));
  assert.ok(
    items.every(
      (item) =>
        new URL(item.url).hostname === 'www.yardbarker.com' &&
        new URL(item.url).pathname.startsWith('/nba/articles/') &&
        item.excerpt.length > 0 &&
        item.excerpt.length <= 1500,
    ),
  );
  assert.ok(
    items.every((item) =>
      item.imageUrl?.startsWith('http://www.yardbarker.com/media/'),
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('feed excerpts prefer bounded content and fall back to summaries', () => {
  const item = (fields: string) =>
    parseFeed(`<rss><channel><item>
    <title>Synthetic feed fallback</title><link>https://example.com/article</link>
    <pubDate>Fri, 06 Nov 2026 12:00:00 GMT</pubDate>${fields}
    </item></channel></rss>`)[0];
  assert.equal(
    item(
      '<description>Publisher summary</description><content:encoded>Long body</content:encoded>',
    ).excerpt,
    'Long body',
  );
  assert.equal(
    item(
      '<description> </description><summary>Alternative summary</summary><content:encoded>Long body</content:encoded>',
    ).excerpt,
    'Long body',
  );
  assert.equal(
    item(
      '<description><![CDATA[<p> </p>]]></description><content:encoded><![CDATA[<p>Body &amp; context</p>]]></content:encoded>',
    ).excerpt,
    'Body & context',
  );
  const atom = parseFeed(
    `<feed><entry><title>Synthetic Atom</title><link href="https://example.com/atom"/><updated>2026-11-06T12:00:00Z</updated><content type="html">&lt;p&gt;${'x'.repeat(1800)}&lt;/p&gt;</content></entry></feed>`,
  )[0];
  assert.equal(atom.excerpt, 'x'.repeat(1499) + '…');
  assert.equal(item('').excerpt, '');
});

void test('feed caps mark omitted reporting without splitting words or Unicode', () => {
  const item = (body: string) =>
    parseFeed(`<rss><channel><item>
    <title>Bounded reporting</title><link>https://example.com/bounded</link>
    <pubDate>2026-11-14T00:00:00Z</pubDate>
    <description><![CDATA[${body}]]></description>
    </item></channel></rss>`)[0];
  const exact = 'x'.repeat(1500);
  assert.equal(item(exact).excerpt, exact);
  assert.equal(
    item('Short complete reporting.').excerpt,
    'Short complete reporting.',
  );
  const words = 'word '.repeat(299) + 'November 14 reporting continues';
  assert.equal(item(words).excerpt, 'word '.repeat(299).trimEnd() + '…');
  const unicode = 'x'.repeat(1498) + '🏀' + 'continued';
  assert.equal(item(unicode).excerpt, 'x'.repeat(1498) + '…');
  assert.equal(item('<p> </p>').excerpt, '');
});

void test('feed inline formatting preserves punctuation and block separation', () => {
  const [item] = parseFeed(`<rss><channel><item>
    <title>Inline reporting</title><link>https://example.com/inline</link>
    <pubDate>2026-11-14T00:00:00Z</pubDate>
    <description><![CDATA[<p>Live in <em>Marvel's Spider-Man 2</em>.</p><p>A <a href="https://example.com">free <strong>update</strong></a>, with H<sub>2</sub>O and co<span>op</span> support.<br/>More details.</p><ul><li>First</li><li>Second</li></ul>]]></description>
    </item></channel></rss>`);
  assert.equal(
    item.excerpt,
    "Live in Marvel's Spider-Man 2. A free update, with H2O and coop support. More details. First Second",
  );
});
