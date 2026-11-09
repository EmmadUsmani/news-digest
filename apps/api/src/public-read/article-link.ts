import { publicFeedUrl } from '../libs/ports/public-url';

// Preparation only. A syntactically public URL does not establish that its
// article path/query is public. Never provide the stored link as a fallback.
// This is a publisher-origin display value, not an article permalink or a
// claim that the publisher or its DNS has been verified.
export function publicArticleOrigin(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    return new URL(publicFeedUrl(value)).origin;
  } catch {
    return null;
  }
}
