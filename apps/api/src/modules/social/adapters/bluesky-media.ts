import { z } from 'zod';

import type { BlueskyMedia } from '../domain/bluesky';

// Preserve official view URLs only. Never fetch media during discovery.
const mediaUrl = z
  .string()
  .url()
  .max(4096)
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  });
const image = z.object({
  thumb: mediaUrl,
  fullsize: mediaUrl,
  alt: z.string().max(10000).default(''),
});
const images = z.object({
  $type: z.literal('app.bsky.embed.images#view'),
  images: z.array(z.unknown()).max(4),
});
const video = z.object({
  $type: z.literal('app.bsky.embed.video#view'),
  playlist: mediaUrl,
  thumbnail: mediaUrl.optional(),
  alt: z.string().max(10000).default(''),
});
const recordWithMedia = z.object({
  $type: z.literal('app.bsky.embed.recordWithMedia#view'),
  media: z.unknown(),
});

export function blueskyMedia(embed: unknown): BlueskyMedia[] {
  const wrapped = recordWithMedia.safeParse(embed);
  // Inspect only the author's attached media, never recursively copy quoted posts.
  const value = wrapped.success ? wrapped.data.media : embed;
  const pictures = images.safeParse(value);
  if (pictures.success)
    return pictures.data.images.flatMap((entry) => {
      const parsed = image.safeParse(entry);
      return parsed.success
        ? [
            {
              type: 'image' as const,
              thumbnail: parsed.data.thumb,
              fullsize: parsed.data.fullsize,
              alt: parsed.data.alt,
            },
          ]
        : [];
    });
  const movie = video.safeParse(value);
  return movie.success
    ? [
        {
          type: 'video',
          thumbnail: movie.data.thumbnail ?? null,
          playlist: movie.data.playlist,
          alt: movie.data.alt,
        },
      ]
    : [];
}
