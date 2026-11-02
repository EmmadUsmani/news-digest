import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  officialPostDisplayText,
  officialPostText,
} from '../src/modules/social/adapters/embed-text';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';
import { assessPostEligibility } from '../src/modules/social/domain/eligibility';

const start = new Date('2026-11-01T00:00:00Z');
const end = new Date('2026-11-02T00:00:00Z');
const policy = {
  includeAny: ['AI', 'machine learning'],
  excludeAny: ['sponsored'],
};
const assess = (
  text: string,
  publishedAt: string | null = start.toISOString(),
) => assessPostEligibility({ text, publishedAt }, policy, start, end);
void test('saved display preserves paragraph line breaks and visible URLs without changing screening evidence', () => {
  const html =
    '<blockquote><p>Launch &amp; demo<br><br>Read <a href="https://example.org/AI">https://example.org/AI</a><br />&lt;img src=x onerror=alert(1)&gt;</p>— AI Labs <a>footer</a></blockquote>';
  assert.equal(
    officialPostDisplayText(html),
    'Launch & demo\n\nRead https://example.org/AI\n<img src=x onerror=alert(1)>',
  );
  assert.equal(
    officialPostText(html),
    'Launch & demo Read <img src=x onerror=alert(1)>',
  );
  assert.equal(assess(officialPostText(html)).eligible, false);
  assert.equal(officialPostDisplayText('<p>first</p><p>second</p>'), '');
  assert.equal(
    officialPostDisplayText('<p>' + 'x'.repeat(20001) + '</p>').length,
    20000,
  );
});
void test('social screening uses bounded post paragraph evidence, never author, date or URL attributes', () => {
  const text = officialPostText(
    '<blockquote><p>A launch &amp; demo<br>today <a href="https://ai.example">details</a></p>— AI Labs <a>AI</a></blockquote>',
  );
  assert.equal(text, 'A launch & demo today details');
  assert.equal(assess(text).eligible, false);
  assert.equal(officialPostText('<p>https://example.com/AI</p>'), '');
  assert.equal(officialPostText('<p>AI</p><p>Other</p>'), '');
  assert.equal(assess('AI demos & machine learning').eligible, true);
  assert.equal(assess('chair repair').eligible, false);
  assert.equal(assess('ＡＩ demo').eligible, true);
});
void test('social window is half-open, missing dates fail closed, and quality/exclusion rules precede positive matches', () => {
  assert.equal(assess('AI demo').eligible, true);
  assert.equal(
    assess('AI demo', end.toISOString()).reason,
    'Outside coverage window',
  );
  assert.equal(assess('AI demo', '2026-10-31T23:59:59.999Z').eligible, false);
  assert.equal(assess('AI demo', null).reason, 'Unknown post time');
  for (const text of [
    'AI crypto launch',
    'AI airdrop',
    'AI like and repost',
    'sponsored AI demo',
  ])
    assert.equal(assess(text).eligible, false);
  assert.equal(assess('').reason, 'No verified post text');
  assert.equal(
    assessPostEligibility(
      { text: 'AI', publishedAt: start.toISOString() },
      { includeAny: [], excludeAny: [] },
      start,
      end,
    ).eligible,
    false,
  );
  assert.throws(() =>
    assessPostEligibility(
      { text: 'AI', publishedAt: null },
      policy,
      end,
      start,
    ),
  );
});
void test('social topic discovery scope deduplicates verified posts and excludes unverified and unrelated citations', async () => {
  const repository = new PostgresSocialRepository();
  const id = '999000000000000001';
  try {
    await repository.store({
      platform: 'x',
      externalId: id,
      url: `https://x.com/i/web/status/${id}`,
      author: 'Fixture',
      authorUrl: 'https://x.com/fixture',
      publishedAt: start.toISOString(),
      metrics: {},
      embedHtml: '<p>AI demo</p>',
    });
    await repository.discovered('techmeme', [
      { externalId: id, url: `https://x.com/i/web/status/${id}` },
      {
        externalId: '999000000000000002',
        url: 'https://x.com/i/web/status/999000000000000002',
      },
    ]);
    const posts = await repository.topicPosts(
      '00000000-0000-4000-8000-000000000011',
    );
    assert.equal(posts.filter((post) => post.externalId === id).length, 1);
    assert.equal(
      posts.find((post) => post.externalId === id)?.publishedAt?.toISOString(),
      start.toISOString(),
    );
    assert.equal(
      posts.some((post) => post.externalId === '999000000000000002'),
      false,
    );
    assert.equal(
      (
        await repository.topicPosts('00000000-0000-4000-8000-000000000012')
      ).some((post) => post.externalId === id),
      false,
    );
  } finally {
    await repository.db.query(
      'DELETE FROM social_discovery_citations WHERE external_id=ANY($1::text[])',
      [[id, '999000000000000002']],
    );
    await repository.db.query('DELETE FROM social_posts WHERE external_id=$1', [
      id,
    ]);
    await repository.db.end();
  }
});
