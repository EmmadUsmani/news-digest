import { publicFeedUrl } from '../../apps/api/src/libs/ports/public-url';

// Inventory only: a public host does not establish that a path/query is safe
// to publish. Never retain URL values, hosts, parameter names or parser errors.
export function articleLinkCounts() {
  return {
    total: 0,
    malformed: 0,
    publicHttps: 0,
    rejectedByPublicUrlPolicy: 0,
    credentials: 0,
    query: 0,
    fragment: 0,
  };
}

export function countArticleLink(
  counts: ReturnType<typeof articleLinkCounts>,
  value: unknown,
) {
  counts.total++;
  if (typeof value !== 'string') {
    counts.malformed++;
    return;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    counts.malformed++;
    return;
  }
  if (url.username || url.password) counts.credentials++;
  if (url.search) counts.query++;
  if (url.hash) counts.fragment++;
  try {
    publicFeedUrl(value);
    counts.publicHttps++;
  } catch {
    counts.rejectedByPublicUrlPolicy++;
  }
}
