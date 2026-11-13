import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  editorialShortlist,
  scoredFallback,
} from '../src/modules/digests/domain/editorial-shortlist';
import { qualityRejection } from '../src/modules/digests/domain/quality';
import {
  type Candidate,
  rank,
  rankFallback,
} from '../src/modules/digests/domain/rank';
void test('headline quality labels exclude routine filler while retaining reporting and announcements', () => {
  // Selected observed headlines plus synthetic counterexamples; no network requests.
  const cases: [string, string | null][] = [
    ['A look at the Suns’ schedule for November', 'monthly-schedule'],
    [
      'Nets vs. Pacers preview: Brooklyn searches for answers after 0-5 start',
      'matchup-preview',
    ],
    ['Lakers vs Raptors Preview: Bounce back game', 'matchup-preview'],
    [
      'Preview: Warriors meet new look Clippers in Chase Center',
      'matchup-preview',
    ],
    ['Cavs at Bucks game thread', 'discussion-thread'],
    ['Open Thread: How the Spurs rolled in on Halloween', 'discussion-thread'],
    [
      'Hawks at Pelicans: start times, TV, streaming, combined thread',
      'discussion-thread',
    ],
    ['NBA best bets tonight', 'betting-promotion'],
    ['How to watch the NBA tonight', 'betting-promotion'],
    ['Best deals on Nintendo consoles', 'shopping-guide'],
    [
      'Week 2 Aftermath: Anthony Edwards and others join the dreaded injury list',
      null,
    ],
    ['Celtics will be without key starter when they face Magic', null],
    [
      'Kings rookie becomes NBA’s first teenager to make 9 3-pointers in a game',
      null,
    ],
    ['Nintendo announces new game release schedule', null],
    ['NBA changes schedule for player safety', null],
    ['Developer preview: new AI model announced', null],
    ['Warriors beat Clippers after overtime', null],
    ['Pikmin 4 Nintendo Switch 2 Edition launches 12th November', null],
    ['Parliament debates online betting restrictions', null],
    ['New thread scheduling algorithm released', null],
  ];
  for (const [title, expected] of cases)
    assert.equal(
      qualityRejection({ title, url: 'https://example.org/story' })?.rule ??
        null,
      expected,
      title,
    );
  assert.equal(
    qualityRejection({
      title: 'NBA news',
      url: 'https://example.org/betting/nba',
    })?.rule,
    'betting-promotion',
  );
  for (const url of ['javascript:alert(1)', 'https://', 'garbage'])
    assert.equal(
      qualityRejection({ title: 'NBA news', url })?.rule,
      'unsafe-url',
    );
});
void test('ranking leaves a quiet section empty rather than filling its budget with previews', () => {
  const base: Candidate = {
    id: 'preview',
    title: 'Nets vs. Pacers preview: what to expect',
    url: 'https://example.org/preview',
    excerpt: '',
    publishedAt: '2026-11-01T12:00:00Z',
    sources: ['Outlet'],
    points: 500,
  };
  const start = new Date('2026-11-01'),
    end = new Date('2026-11-02');
  assert.deepEqual(rank([base], start, end, 5), []);
  const news = {
    ...base,
    id: 'news',
    title: 'NBA announces new player safety rules',
    points: 0,
  };
  assert.deepEqual(
    rank([base, news], start, end, 5).map((item) => item.id),
    ['news'],
  );
});
void test('HN question threads cannot spend news slots, while launches and reporting remain eligible', () => {
  const base: Candidate = {
    id: 'question',
    title: 'Ask HN: Which TV do you recommend for privacy?',
    url: 'https://news.ycombinator.com/item?id=123',
    excerpt: 'AI and software recommendations',
    publishedAt: '2026-11-01T12:00:00Z',
    sources: ['Hacker News'],
    points: 10000,
  };
  assert.equal(qualityRejection(base)?.rule, 'hn-question');
  assert.equal(
    qualityRejection({ ...base, title: '  Ａｓｋ HN: Who is hiring?' })?.rule,
    'hn-question',
  );
  const launch = {
    ...base,
    id: 'launch',
    title: 'Show HN: An open-source AI model debugger',
    points: 0,
  };
  const report = {
    ...base,
    id: 'report',
    url: 'https://example.org/news',
    title: 'Ask HN: What developers learned about AI failures',
    points: 0,
  };
  assert.equal(qualityRejection(launch), null);
  assert.equal(qualityRejection(report), null);
  assert.equal(
    qualityRejection({
      ...base,
      url: 'https://news.ycombinator.com.example.org/item?id=123',
    }),
    null,
  );
  assert.equal(
    qualityRejection({
      ...base,
      title: 'How Ask HN: questions shaped a new compiler',
    }),
    null,
  );
  assert.deepEqual(
    rank(
      [base, launch, report],
      new Date('2026-11-01'),
      new Date('2026-11-02'),
      5,
    ).map((item) => item.id),
    ['launch', 'report'],
  );
  assert.deepEqual(
    rank([base], new Date('2026-11-01'), new Date('2026-11-02'), 5),
    [],
  );
});

void test('Nov 7 labelled matchup preview cannot occupy fallback or AI story slots', () => {
  const preview: Candidate = {
    id: 'nov7-preview',
    title: 'Game Preview: Knicks at Cavaliers, November 7, 2026',
    url: 'https://example.org/knicks-cavaliers-preview',
    excerpt:
      'The Knicks and Cavaliers tangle for an Eastern Conference Finals rematch.',
    publishedAt: '2026-11-07T10:00:00Z',
    sources: ['Recorded headline'],
    points: 10000,
  };
  const report = {
    ...preview,
    id: 'report',
    title: 'Cavaliers beat Knicks in Eastern Conference Finals rematch',
    points: 0,
  };
  const start = new Date('2026-11-06T15:00:00Z');
  const end = new Date('2026-11-07T15:00:00Z');
  for (const title of [
    preview.title,
    'Game Preview: Knicks vs. Cavaliers, November 7, 2026',
    ' Game Preview: Knicks versus Cavaliers, November 7, 2026',
  ])
    assert.equal(
      qualityRejection({ ...preview, title })?.rule,
      'matchup-preview',
    );
  for (const title of [
    'Game preview: a hands-on look at the new RPG',
    'Studio reveals game preview at developer conference',
    report.title,
  ])
    assert.equal(qualityRejection({ ...preview, title }), null);
  assert.deepEqual(
    rank([preview, report], start, end, 5).map((item) => item.id),
    ['report'],
  );
  const result = editorialShortlist(
    [preview, report],
    [
      { id: preview.id, relevance: 10, importance: 10 },
      { id: report.id, relevance: 8, importance: 8 },
    ],
    { includeAny: [], excludeAny: [] },
    start,
    end,
  );
  assert.deepEqual(
    result.shortlist.map((item) => item.id),
    ['report'],
  );
  assert.deepEqual(
    result.ranked.map((item) => item.id),
    ['report'],
  );
});

void test('complete-triage fallback keeps important reporting ahead of newer routine updates', () => {
  const base: Candidate = {
    id: 'important',
    title: 'League announces player safety rules',
    url: 'https://example.org/report',
    excerpt: 'Saved source reporting.',
    publishedAt: '2026-11-07T01:00:00Z',
    sources: ['Outlet'],
    points: 0,
  };
  const routine = {
    ...base,
    id: 'routine',
    title: 'Player expected to make season debut',
    publishedAt: '2026-11-07T14:00:00Z',
  };
  const preview = {
    ...routine,
    id: 'preview',
    title: 'Game Preview: Knicks at Cavaliers, November 7, 2026',
  };
  const start = new Date('2026-11-06T15:00:00Z');
  const end = new Date('2026-11-07T15:00:00Z');
  const { shortlist } = editorialShortlist(
    [routine, preview, base],
    [
      { id: base.id, relevance: 9, importance: 8 },
      { id: routine.id, relevance: 9, importance: 4 },
      { id: preview.id, relevance: 8, importance: 3 },
    ],
    { includeAny: [], excludeAny: [] },
    start,
    end,
    undefined,
    40,
  );
  assert.equal(rank([routine, base], start, end, 1)[0].id, routine.id);
  const fallback = scoredFallback(shortlist, start, end, 1);
  assert.deepEqual(
    fallback.map((story) => story.id),
    [base.id],
  );
  assert.equal(fallback[0].excerpt, base.excerpt);
  assert.deepEqual(scoredFallback(shortlist, start, end, 0), []);
  assert.deepEqual(scoredFallback([], start, end, 5), []);
});

void test('scored fallback preserves validated coverage as one slot', () => {
  const base: Candidate = {
    id: 'lead',
    title: 'Player steps away',
    url: 'https://example.org/a',
    excerpt: 'Reporting.',
    publishedAt: '2026-11-07T01:00:00Z',
    sources: ['A'],
    points: 0,
  };
  const support = { ...base, id: 'support', sources: ['B'] };
  const other = {
    ...base,
    id: 'other',
    title: 'League announces safety rules',
  };
  const matches = (a: Candidate, b: Candidate) =>
    a.id !== 'other' && b.id !== 'other';
  const stories = scoredFallback(
    [base, support, other],
    new Date('2026-11-07'),
    new Date('2026-11-08'),
    2,
    matches,
  );
  assert.deepEqual(
    stories.map((story) => story.id),
    ['lead', 'other'],
  );
  assert.deepEqual(
    stories[0].coverage.map((item) => item.id),
    ['lead', 'support'],
  );
});

void test('fallback excerpts mark omitted text without splitting words or Unicode', () => {
  const start = new Date('2026-11-06T15:00:00Z');
  const end = new Date('2026-11-07T15:00:00Z');
  const candidate: Candidate = {
    id: 'excerpt',
    title: 'Wizards weigh Anthony Davis extension',
    url: 'https://example.org/story',
    excerpt: '',
    publishedAt: '2026-11-07T13:58:31Z',
    sources: ['RealGM Basketball'],
    points: 0,
  };
  const excerpt = (text: string) =>
    rank([{ ...candidate, excerpt: text }], start, end, 1)[0].excerpt;
  // Nov 7 reader failure: a capped attribution ended in "Windhor".
  const lead = 'a'.repeat(592) + ' ';
  assert.equal(excerpt(lead + 'Windhorst said more.'), 'a'.repeat(592) + '…');
  assert.equal(excerpt('a'.repeat(598) + ' more'), 'a'.repeat(598) + '…');
  assert.equal(excerpt('a'.repeat(599) + ' more'), 'a'.repeat(599) + '…');
  assert.equal(excerpt('a'.repeat(598) + '😀more'), 'a'.repeat(598) + '…');
  for (const text of ['', 'Short source excerpt.', 'a'.repeat(600)])
    assert.equal(excerpt(text), text);
  const longToken = excerpt('😀'.repeat(400));
  assert.ok(longToken.length <= 600);
  assert.equal(longToken, '😀'.repeat(299) + '…');
  assert.equal(candidate.excerpt, '');
});

void test('fallback skips headline-only stories before spending slots but AI keeps their evidence', () => {
  const start = new Date('2026-11-12T15:00:00Z');
  const end = new Date('2026-11-13T15:00:00Z');
  const readable: Candidate = {
    id: 'readable',
    title: 'Microsoft restores cloud service',
    url: 'https://example.org/recovery',
    excerpt: 'Microsoft says service has recovered.',
    publishedAt: '2026-11-13T12:00:00Z',
    sources: ['Publisher'],
    points: 0,
  };
  const headlineOnly = {
    ...readable,
    id: 'headline',
    excerpt: '',
    publishedAt: '2026-11-13T14:00:00Z',
  };
  const whitespace = { ...headlineOnly, id: 'whitespace', excerpt: ' \n\t ' };
  const candidates = [headlineOnly, whitespace, readable];
  assert.equal(rank(candidates, start, end, 1)[0].id, 'headline');
  assert.deepEqual(
    rankFallback(candidates, start, end, 1).map((s) => s.id),
    ['readable'],
  );
  assert.deepEqual(
    scoredFallback(candidates, start, end, 1).map((s) => s.id),
    ['readable'],
  );
  assert.deepEqual(rankFallback([headlineOnly, whitespace], start, end, 5), []);
  assert.deepEqual(
    scoredFallback([headlineOnly, whitespace], start, end, 5),
    [],
  );
  const { shortlist } = editorialShortlist(
    candidates,
    candidates.map(({ id }) => ({ id, relevance: 9, importance: 8 })),
    { includeAny: [], excludeAny: [] },
    start,
    end,
  );
  assert.equal(shortlist.length, 3);
  assert.equal(headlineOnly.excerpt, '');
});
