import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { type DigestPreview } from '@digest/contracts';

import { type PreviewRepository } from '../src/modules/digests/domain/preview.repository';
import {
  readerEdition,
  ReaderEditionController,
} from '../src/modules/digests/reader-edition.controller';

const id = '00000000-0000-4000-8000-000000000001';
const snapshot: DigestPreview = {
  id,
  createdAt: '2026-11-04',
  windowStart: '2026-11-03',
  windowEnd: '2026-11-04',
  method: 'editorial-v1',
  topics: [
    {
      id,
      name: 'Tech',
      candidateCount: 99,
      editorial: {
        mode: 'ai',
        model: 'private-model',
        reason: 'private-reason',
        brief: ['News today'],
        triage: [],
        unscoredIds: [],
      },
      stories: [
        {
          id,
          title: 'Launch',
          url: 'https://example.com/story',
          excerpt: 'private-excerpt',
          summary: 'A launch.',
          whyItMatters: 'private-note',
          score: 95,
          reasons: ['private-rank'],
          sources: ['Example'],
          publishedAt: '2026-11-04',
        },
      ],
      posts: [
        {
          platform: 'x',
          externalId: '123',
          url: 'https://x.com/a/status/123',
          author: 'a',
          authorUrl: 'https://x.com/a',
          publishedAt: '2026-11-04T12:00:00Z',
          text: 'A post',
          metrics: { likes: 100 },
          reasons: ['private-post'],
          xSearchRanking: { bonus: 2, reason: 'private-search' },
          whyItMatters: 'The author announces a new release.',
        },
      ],
    },
  ],
};

void test('reader projection keeps content and excludes nested operational fields without changing saved editions', () => {
  const before = JSON.stringify(snapshot);
  const result = readerEdition(snapshot);
  assert.deepEqual(Object.keys(result).sort(), [
    'createdAt',
    'id',
    'topics',
    'windowEnd',
    'windowStart',
  ]);
  assert.deepEqual(Object.keys(result.topics[0]).sort(), [
    'brief',
    'id',
    'name',
    'posts',
    'stories',
  ]);
  assert.deepEqual(result.topics[0].brief, ['News today']);
  assert.equal(result.topics[0].stories[0].summary, 'A launch.');
  assert.equal(result.topics[0].posts[0].metrics.likes, 100);
  assert.equal(
    result.topics[0].posts[0].whyItMatters,
    snapshot.topics[0].posts![0].whyItMatters,
  );
  assert.doesNotMatch(
    JSON.stringify(result),
    /private-|candidateCount|score|reasons|triage|method/,
  );
  assert.equal(JSON.stringify(snapshot), before);
  const historical = structuredClone(snapshot);
  delete historical.topics[0].editorial;
  delete historical.topics[0].posts;
  assert.deepEqual(readerEdition(historical).topics[0].brief, []);
  assert.deepEqual(readerEdition(historical).topics[0].posts, []);
  historical.topics[0].editorial = {
    ...snapshot.topics[0].editorial!,
    mode: 'non-ai',
  };
  assert.deepEqual(readerEdition(historical).topics[0].brief, []);
});

void test('reader retains saved developing destinations without exposing extra link fields or changing history', () => {
  const saved = structuredClone(snapshot);
  const developing = {
    previousEditionId: '00000000-0000-4000-8000-000000002885',
    previousStoryId: '00000000-0000-4000-8000-000000002884',
    previousHeadline: 'Earlier launch',
    previousSummary: 'Earlier reporting.',
    editionCount: 3,
  };
  saved.topics[0].stories[0].developing = {
    ...developing,
    ...{ internalScore: 99 },
  };
  const before = JSON.stringify(saved);
  const result = readerEdition(saved);
  assert.deepEqual(result.topics[0].stories[0].developing, developing);
  assert.equal(JSON.stringify(saved), before);
  assert.equal(
    readerEdition(snapshot).topics[0].stories[0].developing,
    undefined,
  );
});

void test('reader reports include editorial citations outside the selected coverage group', () => {
  const saved = structuredClone(snapshot);
  const story = saved.topics[0].stories[0];
  const primary = {
    id: story.id,
    title: 'Original launch headline',
    url: story.url,
    sources: story.sources,
    publishedAt: story.publishedAt,
  };
  const supporting = {
    ...primary,
    id: '00000000-0000-4000-8000-000000000002',
    title: 'Related development',
    url: 'https://example.org/report',
    sources: ['Second publisher', 'Another discovery feed'],
    excerpt: 'private-supporting-excerpt',
  };
  story.coverage = [primary];
  story.evidence = [
    {
      ...primary,
      title: 'Rewritten grouped headline',
      excerpt: 'private-primary-excerpt',
    },
    supporting,
  ];
  const before = JSON.stringify(saved);
  const reports = readerEdition(saved).topics[0].stories[0].coverage!;
  assert.deepEqual(
    reports.map((report) => report.id),
    [primary.id, supporting.id],
  );
  assert.deepEqual(reports[0], primary);
  assert.equal(reports[1].url, supporting.url);
  assert.equal(reports[1].title, supporting.title);
  assert.deepEqual(reports[1].sources, ['example.org']);
  assert.doesNotMatch(JSON.stringify(reports), /excerpt|private-/);
  assert.equal(JSON.stringify(saved), before);
  delete story.coverage;
  assert.deepEqual(readerEdition(saved).topics[0].stories[0].coverage, [
    { ...primary, title: 'Rewritten grouped headline' },
    reports[1],
  ]);
  delete story.evidence;
  assert.equal(readerEdition(saved).topics[0].stories[0].coverage, undefined);
});

void test('reader summaries preserve AI text and restore saved story text across historical editorial modes', () => {
  for (const mode of ['ai', 'non-ai', undefined] as const) {
    for (const summary of [undefined, '']) {
      const historical = structuredClone(snapshot);
      if (mode) historical.topics[0].editorial!.mode = mode;
      else delete historical.topics[0].editorial;
      historical.topics[0].stories[0].summary = summary;
      historical.topics[0].stories[0].excerpt = 'Saved article text.';
      const before = JSON.stringify(historical);
      const story = readerEdition(historical).topics[0].stories[0];
      assert.equal(story.summary, 'Saved article text.');
      assert.equal(story.summaryKind, 'source-excerpt');
      assert.equal('excerpt' in story, false);
      assert.equal(JSON.stringify(historical), before);
    }
  }
  assert.equal(
    readerEdition(snapshot).topics[0].stories[0].summary,
    'A launch.',
  );
  assert.equal(
    readerEdition(snapshot).topics[0].stories[0].summaryKind,
    undefined,
  );
  const empty = structuredClone(snapshot);
  empty.topics[0].stories[0].summary = '';
  empty.topics[0].stories[0].excerpt = '';
  assert.equal(
    readerEdition(empty).topics[0].stories[0].summaryKind,
    undefined,
  );
});

void test('reader fallback removes a terminal matching WordPress credit without changing saved evidence or AI text', () => {
  const saved = structuredClone(snapshot);
  const story = saved.topics[0].stories[0];
  story.title = 'Cavaliers hold LeBron James to eight points';
  story.summary = undefined;
  const news =
    'The margin of victory lifted Cleveland to the top of East Group B.';
  const footer = `The post ${story.title} appeared first on Basketball Insiders | NBA Rumors And Basketball News .`;
  story.excerpt = `${news} ${footer}`;
  const before = JSON.stringify(saved);
  assert.equal(readerEdition(saved).topics[0].stories[0].summary, news);
  assert.equal(JSON.stringify(saved), before);
  for (const excerpt of [
    news,
    footer,
    `${news} The post A different headline appeared first on Basketball Insiders .`,
    `${news} ${footer} More reporting follows.`,
    `${news} The post ${story.title} appeared first on Basketball Insiders`,
  ]) {
    story.excerpt = excerpt;
    assert.equal(readerEdition(saved).topics[0].stories[0].summary, excerpt);
  }
  story.summary = `${news} ${footer}`;
  assert.equal(
    readerEdition(saved).topics[0].stories[0].summary,
    story.summary,
  );
});

void test('reader endpoints handle latest, immutable ID lookup and missing editions', async () => {
  const repository = {
    latest: async () => snapshot,
    find: async (requested: string) => (requested === id ? snapshot : null),
  } as PreviewRepository;
  const controller = new ReaderEditionController(repository);
  assert.deepEqual(await controller.latest(), readerEdition(snapshot));
  assert.deepEqual(await controller.find(id), readerEdition(snapshot));
  await assert.rejects(controller.find('missing'), /Edition not found/);
  repository.latest = async () => null;
  assert.equal(await controller.latest(), null);
});

void test('reader archive exposes topic names without editorial modes', async () => {
  const repository = {
    history: async () => ({
      entries: [
        {
          id,
          createdAt: snapshot.createdAt,
          windowStart: snapshot.windowStart,
          windowEnd: snapshot.windowEnd,
          method: snapshot.method,
          topicModes: snapshot.topics.map((topic) => ({
            id: topic.id,
            name: topic.name,
            stories: 'ai',
            posts: 'non-ai',
          })),
        },
      ],
      hasMore: false,
    }),
  } as unknown as PreviewRepository;
  const controller = new ReaderEditionController(repository);
  const history = await controller.history('0');
  assert.deepEqual(
    history.entries[0].topics,
    snapshot.topics.map(({ id, name }) => ({ id, name })),
  );
  assert.equal('topicModes' in history.entries[0], false);
  assert.equal('method' in history.entries[0], false);
  await assert.rejects(controller.history('-1'), /nonnegative offset/);
});

void test('reader preserves structured publishers in new coverage and leaves historical metadata unknown', () => {
  const saved = structuredClone(snapshot);
  const story = saved.topics[0].stories[0];
  story.publisher = { name: 'CNBC', url: 'https://www.cnbc.com/' };
  story.coverage = [
    {
      id,
      title: story.title,
      url: story.url,
      sources: ['Google News'],
      publishedAt: story.publishedAt,
      publisher: story.publisher,
    },
  ];
  story.evidence = [
    {
      id: '00000000-0000-4000-8000-000000000002',
      title: 'Second report',
      url: 'https://news.google.com/articles/second',
      excerpt: 'Report',
      sources: ['Google News'],
      publishedAt: story.publishedAt,
      publisher: { name: 'Reuters', url: 'https://www.reuters.com/' },
    },
  ];
  const serialized = JSON.parse(JSON.stringify(saved)) as DigestPreview;
  const result = readerEdition(serialized).topics[0].stories[0];
  assert.equal(result.publisher?.name, 'CNBC');
  assert.deepEqual(
    result.coverage?.map((article) => article.publisher?.name),
    ['CNBC', 'Reuters'],
  );
  assert.equal(result.coverage?.length, 2);
  assert.deepEqual(
    result.coverage?.map((article) => article.sources),
    [['Google News'], ['Google News']],
  );
  assert.equal(
    readerEdition(snapshot).topics[0].stories[0].publisher,
    undefined,
  );
});

void test('reader collapses duplicate Google News wrappers but preserves separate coverage reports', () => {
  const saved = structuredClone(snapshot);
  const story = saved.topics[0].stories[0];
  const report = {
    id,
    title: 'A Human Reads the Anthropic I.P.O. Filing - The New York Times',
    url: 'https://news.google.com/rss/articles/first',
    publisher: { name: 'The New York Times', url: 'https://www.nytimes.com/' },
    sources: ['Google News: artificial intelligence'],
    publishedAt: '2026-11-15T10:01:57.000Z',
  };
  const variants = [
    { publishedAt: '2026-11-15T10:01:56.000Z' },
    { publishedAt: '2026-11-15T10:02:57.000Z' },
    { title: 'Another development' },
    { publisher: { name: 'Another publisher', url: null } },
    { publisher: undefined },
    { url: 'https://www.nytimes.com/report' },
    { publishedAt: 'unknown' },
  ];
  story.coverage = [
    report,
    ...variants.map((variant, index) => ({
      ...report,
      id: `00000000-0000-4000-8000-${String(index + 2).padStart(12, '0')}`,
      url: `https://news.google.com/rss/articles/variant-${index}`,
      ...variant,
    })),
  ];
  const before = JSON.stringify(saved);
  const articles = readerEdition(saved).topics[0].stories[0].coverage!;
  assert.deepEqual(
    articles.map(({ id }) => id),
    story.coverage.filter((_, index) => index !== 1).map(({ id }) => id),
  );
  assert.equal(articles[0].url, report.url);
  assert.equal(JSON.stringify(saved), before);
});

void test('reader fallback ends saved NBA excerpts at complete sentences without altering evidence or AI summaries', () => {
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        './fixtures/nba-fallback-excerpts-2026-11-18.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as { stories: { title: string; excerpt: string }[] };
  const saved = structuredClone(snapshot);
  const story = saved.topics[0].stories[0];
  story.summary = undefined;
  const expectedEnds = [
    'Monday, Nov. 16, 2026. …',
    "It's unlikely we see Newell again this season. …",
  ];
  for (const [index, recorded] of fixture.stories.entries()) {
    Object.assign(story, recorded);
    const before = JSON.stringify(saved);
    const projected = readerEdition(saved).topics[0].stories[0].summary;
    assert.ok(projected.endsWith(expectedEnds[index]), projected);
    assert.ok(recorded.excerpt.startsWith(projected.slice(0, -2)));
    assert.ok(projected.length >= recorded.excerpt.length / 2);
    assert.equal(JSON.stringify(saved), before);
  }
  for (const excerpt of [
    'Complete source sentence. More reporting follows.',
    'A short sentence. ' + 'long unfinished clause '.repeat(25) + '…',
    'An unsplit sentence with no complete boundary…',
    'A complete quotation says “More reporting follows.”…',
    'No change for a source using three dots...',
  ]) {
    story.excerpt = excerpt;
    assert.equal(readerEdition(saved).topics[0].stories[0].summary, excerpt);
  }
  story.excerpt = fixture.stories[0].excerpt;
  story.summary = story.excerpt;
  assert.equal(
    readerEdition(saved).topics[0].stories[0].summary,
    story.summary,
  );
});
