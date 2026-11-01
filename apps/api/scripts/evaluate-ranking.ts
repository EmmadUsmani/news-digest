// Offline evaluation only. Never imports database/network adapters or seeds content.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rank, type Candidate } from '../src/modules/digests/domain/rank';
import { assessRelevance } from '../src/modules/digests/domain/relevance';
import { relevancePolicySchema } from '@digest/contracts';

export function evaluateNbaWindow() {
 const fixture = JSON.parse(readFileSync(join(__dirname, '../test/fixtures/ranking-nba-2026-11-01.json'), 'utf8')) as {
 windowStart: string; windowEnd: string; budget: number; relevancePolicy: unknown;
 candidates: Candidate[]; events: { name: string; reason: string; ids: string[] }[];
 mustOmit: { id: string; reason: string }[];
 };
 const ids = new Set(fixture.candidates.map(item => item.id));
 if (ids.size !== fixture.candidates.length) throw new Error('Duplicate candidate IDs');
 const labeled = new Set<string>();
 for (const event of fixture.events) for (const id of event.ids) {
 if (!ids.has(id) || labeled.has(id)) throw new Error('Missing or overlapping event label');
 labeled.add(id);
 }
 for (const item of fixture.mustOmit) if (!ids.has(item.id) || labeled.has(item.id)) throw new Error('Missing or conflicting omission label');
 const policy = relevancePolicySchema.parse(fixture.relevancePolicy);
 const eligible = fixture.candidates.filter(item => assessRelevance(item,policy).eligible);
 const stories = rank(eligible,new Date(fixture.windowStart),new Date(fixture.windowEnd),fixture.budget);
 const selectedIds = new Set(stories.flatMap(story => story.coverage.map(item => item.id)));
 const found = fixture.events.filter(event => event.ids.some(id => selectedIds.has(id)));
 return {
 windowStart: fixture.windowStart, windowEnd: fixture.windowEnd,
 candidates: fixture.candidates.length, budget: fixture.budget,
 selected: stories.map(story => ({ id: story.id, title: story.title })),
 targetEvents: fixture.events.length, foundEvents: found.map(event => event.name),
 missedEvents: fixture.events.filter(event => !found.includes(event)).map(event => event.name),
 eventRecall: found.length / fixture.events.length,
 // Distinct target events per selected slot: duplicates cannot inflate this measure.
 targetSlotYield: stories.length ? found.length / stories.length : 0,
 forbiddenSelected: fixture.mustOmit.filter(item => selectedIds.has(item.id)),
 };
}
if (require.main === module) console.log(JSON.stringify(evaluateNbaWindow(),null,2));
