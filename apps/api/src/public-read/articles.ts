import { contentGroupSchema } from '@digest/contracts';
import { ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';

import { publicArticleOrigin } from './article-link';

// Unknown columns and stored permalinks never escape the public projection.
const articleGroupInput = contentGroupSchema.extend({
  items: contentGroupSchema.shape.items.element
    .extend({ url: z.unknown() })
    .array(),
});

export async function readPublicArticles(read: () => Promise<unknown>) {
  try {
    return articleGroupInput
      .array()
      .parse(await read())
      .map(({ topicId, items }) => ({
        topicId,
        items: items.map(({ id, title, url, publishedAt, source }) => ({
          id,
          title,
          publisherOrigin: publicArticleOrigin(url),
          publishedAt,
          source,
        })),
      }));
  } catch {
    throw new ServiceUnavailableException('Articles unavailable');
  }
}

// Revalidate the already projected system reader at the HTTP boundary. Never
// fall back to a stored URL if a replacement adapter changes its output.
export async function readPublicArticleResponse(read: () => Promise<unknown>) {
  try {
    const group = articleGroupInput.extend({
      items: articleGroupInput.shape.items.element
        .omit({ url: true })
        .extend({ publisherOrigin: z.string().nullable() })
        .array(),
    });
    return group
      .array()
      .parse(await read())
      .map(({ topicId, items }) => ({
        topicId,
        items: items.map(
          ({ id, title, publishedAt, source, publisherOrigin }) => ({
            id,
            title,
            publishedAt,
            source,
            publisherOrigin: publicArticleOrigin(publisherOrigin),
          }),
        ),
      }));
  } catch {
    throw new ServiceUnavailableException('Articles unavailable');
  }
}
