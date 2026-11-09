import { contentGroupSchema } from '@digest/contracts';
import { ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';

import { publicArticleOrigin } from './article-link';

// Preparation only: configured title/source text still needs review before
// transport installation. Unknown columns and stored permalinks never escape.
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
