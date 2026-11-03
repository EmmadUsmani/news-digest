import assert from 'node:assert/strict';
import test from 'node:test';

import { blueskyMedia } from '../src/modules/social/adapters/bluesky-media';

const picture = {
  thumb: 'https://cdn.bsky.app/thumb.jpg',
  fullsize: 'https://cdn.bsky.app/full.jpg',
  alt: 'A game demo',
};
void test('Bluesky preserves image descriptions and video views including attached quote media', () => {
  assert.deepEqual(
    blueskyMedia({ $type: 'app.bsky.embed.images#view', images: [picture] }),
    [
      {
        type: 'image',
        thumbnail: picture.thumb,
        fullsize: picture.fullsize,
        alt: picture.alt,
      },
    ],
  );
  const video = {
    $type: 'app.bsky.embed.video#view',
    playlist: 'https://video.bsky.app/playlist.m3u8',
    thumbnail: picture.thumb,
    alt: 'A highlight',
  };
  assert.deepEqual(
    blueskyMedia({
      $type: 'app.bsky.embed.recordWithMedia#view',
      media: video,
    }),
    [
      {
        type: 'video',
        playlist: video.playlist,
        thumbnail: picture.thumb,
        alt: video.alt,
      },
    ],
  );
  assert.deepEqual(blueskyMedia({ ...video, thumbnail: undefined }), [
    {
      type: 'video',
      playlist: video.playlist,
      thumbnail: null,
      alt: video.alt,
    },
  ]);
});
void test('Bluesky drops malformed media individually and ignores quote-only and external embeds', () => {
  for (const url of [
    'javascript:alert(1)',
    'http://cdn.bsky.app/a',
    'https://user:pass@example.com/a',
  ]) {
    const result = blueskyMedia({
      $type: 'app.bsky.embed.images#view',
      images: [{ ...picture, fullsize: url }, picture],
    });
    assert.equal(result.length, 1);
    assert.equal(result[0].type, 'image');
  }
  for (const embed of [
    null,
    {},
    { $type: 'app.bsky.embed.record#view', record: picture },
    { $type: 'app.bsky.embed.external#view', external: picture },
    { $type: 'app.bsky.embed.images#view', images: Array(5).fill(picture) },
  ])
    assert.deepEqual(blueskyMedia(embed), []);
});
