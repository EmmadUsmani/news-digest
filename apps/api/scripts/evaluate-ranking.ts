// Offline evaluation only. Never imports database/network adapters or seeds content.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { relevancePolicySchema } from '@digest/contracts';

import { qualityRejection } from '../src/modules/digests/domain/quality';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';
import { assessRelevance } from '../src/modules/digests/domain/relevance';

export function evaluateWindow(filename: string) {
  const fixture = JSON.parse(
    readFileSync(join(__dirname, '../test/fixtures', filename), 'utf8'),
  ) as RankingFixture;
  return evaluateFixture(fixture);
}

export type RankingFixture = {
  topic: string;
  windowStart: string;
  windowEnd: string;
  budget: number;
  relevancePolicy: unknown;
  candidates: Candidate[];
  events: { name: string; reason: string; ids: string[] }[];
  mustOmit: { id: string; reason: string }[];
};

export function evaluateFixture(fixture: RankingFixture) {
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
  // Label-only counterfactual: no semantic inference and no production matcher.
  // Unlabeled articles remain separate; this is not an overall duplicate rate.
  const eventById = new Map(
    fixture.events.flatMap((event) =>
      event.ids.map((id) => [id, event.name] as const),
    ),
  );
  const labeledGrouping = rank(eligible, start, end, fixture.budget, (a, b) => {
    const event = eventById.get(a.id);
    return event !== undefined && event === eventById.get(b.id);
  });
  function labeledSlots(selection: typeof stories) {
    return fixture.events.map((event) => ({
      name: event.name,
      slots: selection.filter((story) =>
        story.coverage.some((item) => event.ids.includes(item.id)),
      ).length,
    }));
  }
  const baselineSlots = labeledSlots(stories);
  const groupedSlots = labeledSlots(labeledGrouping);
  const groupedIds = new Set(
    labeledGrouping.flatMap((story) => story.coverage.map((item) => item.id)),
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
    labeledGroupingComparison: {
      baselineSlots,
      knownRepeatedSlots: baselineSlots.reduce(
        (sum, event) => sum + Math.max(0, event.slots - 1),
        0,
      ),
      groupedSlots,
      groupedFoundEvents: groupedSlots
        .filter((event) => event.slots > 0)
        .map((event) => event.name),
      groupedSelected: labeledGrouping.map((story) => ({
        id: story.id,
        title: story.title,
        coveredArticles: story.coverage.length,
      })),
      groupedForbiddenSelected: fixture.mustOmit.filter((item) =>
        groupedIds.has(item.id),
      ),
    },
    targetEvents: fixture.events.length,
    foundEvents: found.map((event) => event.name),
    missedEvents: fixture.events
      .filter((event) => !found.includes(event))
      .map((event) => event.name),
    eventRecall: fixture.events.length
      ? found.length / fixture.events.length
      : null,
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
export function evaluateGamingWindow() {
  return evaluateWindow('ranking-gaming-2026-11-12.json');
}
export function evaluateLaterTechWindow() {
  return evaluateWindow('ranking-tech-2026-11-13.json');
}
if (require.main === module)
  console.log(
    JSON.stringify(
      [
        evaluateNbaWindow(),
        evaluateWorldWindow(),
        evaluateTechWindow(),
        evaluateGamingWindow(),
        evaluateLaterTechWindow(),
      ],
      null,
      2,
    ),
  );
