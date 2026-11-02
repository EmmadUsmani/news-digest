import { z } from 'zod';

import { extractXLinks } from '../../ingestion/public/discovery';
import type { DiscoveredLink } from '../domain/collection.port';
import type { XReportedEngagement } from '../domain/x-search.port';

const count = z.number().int().nonnegative().safe().optional();
const observation = z.object({
  url: z.string(),
  published_at: z.string().datetime().optional(),
  likes: count,
  reposts: count,
  replies: count,
  views: count,
});

export function readReportedEngagement(
  texts: string[],
  links: DiscoveredLink[],
  observedAt: Date,
): XReportedEngagement[] {
  const candidates = new Set(links.map((link) => link.externalId));
  const reports = new Map<string, XReportedEngagement>();
  const duplicates = new Set<string>();
  for (const text of texts) {
    let entries: unknown;
    try {
      entries = JSON.parse(text);
    } catch {
      continue;
    }
    if (!Array.isArray(entries) || entries.length > 5) continue;
    for (const entry of entries) {
      const parsed = observation.safeParse(entry);
      if (!parsed.success) continue;
      const { url, published_at, ...metrics } = parsed.data;
      const matched = extractXLinks(url);
      if (matched.length !== 1) continue;
      const id = matched[0].externalId;
      if (!candidates.has(id)) continue;
      if (reports.has(id)) duplicates.add(id);
      const counts = Object.fromEntries(
        Object.entries(metrics).filter(([, value]) => value !== undefined),
      );
      if (!Object.keys(counts).length) continue;
      if (published_at && Date.parse(published_at) > observedAt.getTime())
        continue;
      reports.set(id, {
        externalId: id,
        reported_by: 'xai_search',
        observedAt: observedAt.toISOString(),
        ...(published_at ? { publishedAt: published_at } : {}),
        ...counts,
      });
    }
  }
  return [...reports.values()].filter(
    (report) => !duplicates.has(report.externalId),
  );
}
