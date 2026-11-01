// Offline evaluation only. Never imports database/network adapters or seeds content.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rank, type Candidate } from '../src/modules/digests/domain/rank';
import { qualityRejection } from '../src/modules/digests/domain/quality';
import { assessRelevance } from '../src/modules/digests/domain/relevance';
import { relevancePolicySchema } from '@digest/contracts';

export function evaluateWindow(filename: string) {
  const fixture = JSON.parse(
    readFileSync(join(__dirname, '../test/fixtures', filename), 'utf8'),
  ) as {
    topic: string;
    windowStart: string;
    windowEnd: string;
    budget: number;
    relevancePolicy: unknown;
    candidates: Candidate[];
    events: { name: string; reason: string; ids: string[] }[];
    mustOmit: { id: string; reason: string }[];
  };
  const ids = new Set(fixture.candidates.map((item) => item.id));
  if (ids.size !== fixture.candidates.length)
    throw new Error('Duplicate candidate IDs');
  const labeled = new Set<string>();
  for (const event of fixture.events)
    for (const id of event.ids) {
      if (!ids.has(id) || labeled.has(id))
        throw new Error('Missing or overlapping event label');
      labeled.add(id);
    }
  for (const item of fixture.mustOmit)
    if (!ids.has(item.id) || labeled.has(item.id))
      throw new Error('Missing or conflicting omission label');
  const policy = relevancePolicySchema.parse(fixture.relevancePolicy);
  const eligible = fixture.candidates.filter(
    (item) => assessRelevance(item, policy).eligible,
  );
  const start = new Date(fixture.windowStart),
    end = new Date(fixture.windowEnd);
  const stories = rank(eligible, start, end, fixture.budget);
  // Expand only the offline audit horizon to twenty slots; production selection keeps the saved budget.
  const auditStories = rank(eligible, start, end, 20);
  const selectedIds = new Set(
    stories.flatMap((story) => story.coverage.map((item) => item.id)),
  );
  const found = fixture.events.filter((event) =>
    event.ids.some((id) => selectedIds.has(id)),
  );
  return {
    topic: fixture.topic,
    windowStart: fixture.windowStart,
    windowEnd: fixture.windowEnd,
    candidates: fixture.candidates.length,
    budget: fixture.budget,
    selected: stories.map((story) => ({
      id: story.id,
      title: story.title,
      score: story.score,
      sources: story.sources,
    })),
    eventDiagnostics: fixture.events.map((event) => {
      const position = auditStories.findIndex((story) =>
        story.coverage.some((item) => event.ids.includes(item.id)),
      );
      return {
        name: event.name,
        recordedArticles: event.ids.length,
        relevanceEligibleArticles: eligible.filter((item) =>
          event.ids.includes(item.id),
        ).length,
        articles: fixture.candidates
          .filter((item) => event.ids.includes(item.id))
          .map((item) => {
            const relevance = assessRelevance(item, policy);
            const quality = relevance.eligible ? qualityRejection(item) : null;
            return {
              id: item.id,
              title: item.title,
              relevanceEligible: relevance.eligible,
              relevanceReason: relevance.reason,
              qualityRule: quality?.rule ?? null,
              selected: selectedIds.has(item.id),
            };
          }),
        firstRankWithinTwenty: position < 0 ? null : position + 1,
      };
    }),
    targetEvents: fixture.events.length,
    foundEvents: found.map((event) => event.name),
    missedEvents: fixture.events
      .filter((event) => !found.includes(event))
      .map((event) => event.name),
    eventRecall: found.length / fixture.events.length,
    // Distinct target events per selected slot: duplicates cannot inflate this measure.
    targetSlotYield: stories.length ? found.length / stories.length : 0,
    forbiddenSelected: fixture.mustOmit.filter((item) =>
      selectedIds.has(item.id),
    ),
  };
}
export function evaluateNbaWindow() {
  return evaluateWindow('ranking-nba-2026-11-01.json');
}
export function evaluateWorldWindow() {
  return evaluateWindow('ranking-world-2026-11-01.json');
}
export function evaluateTechWindow() {
  return evaluateWindow('ranking-tech-2026-11-01.json');
}
if (require.main === module)
  console.log(
    JSON.stringify(
      [evaluateNbaWindow(), evaluateWorldWindow(), evaluateTechWindow()],
      null,
      2,
    ),
  );
