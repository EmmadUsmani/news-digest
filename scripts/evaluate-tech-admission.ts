// Recorded-only evaluation: no database, network, configuration or provider access.
import { readFileSync } from 'node:fs';

import type { Candidate } from '../apps/api/src/modules/digests/domain/rank';
import {
  type AdmissionEvent,
  type AdmissionScore,
  techAdmissionControl,
} from '../apps/api/src/modules/digests/domain/tech-story-admission';
import { recordedTechEvidence } from './lib/tech-admission-evidence';

if (process.argv.slice(2).join(' ') !== '--recorded-tech')
  throw new Error('Expected --recorded-tech');
const fixture = JSON.parse(
  readFileSync(
    new URL(
      '../apps/api/test/fixtures/tech-admission-2026-11-17.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as {
  editionId: string;
  note: string;
  ranked: (AdmissionEvent & { title: string })[];
  scores: AdmissionScore[];
};
const result = techAdmissionControl({
  ...fixture,
  enabled: true,
  topic: 'tech',
  grouping: 'validated',
  triage: 'complete',
});
const sources = JSON.parse(
  readFileSync(
    new URL(
      '../apps/api/test/fixtures/tech-admission-evidence-2026-11-17.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as { candidates: Candidate[]; windowStart: string; windowEnd: string };
const transport = recordedTechEvidence({
  ...fixture,
  ...sources,
  enabled: true,
});
const baseline = recordedTechEvidence({
  ...fixture,
  ...sources,
  enabled: false,
});
const withText = (value: typeof transport) =>
  value.evidence.candidates.filter((event) =>
    event.clusterEvidence.some((member) => member.excerpt.trim()),
  ).length;
if (
  JSON.stringify(transport.ranked.map((e) => e.id)) !==
  JSON.stringify(fixture.ranked.map((e) => e.id))
)
  throw new Error('Recorded source ranking no longer reproduces the control');
const describe = (id: string) => ({
  id,
  title: fixture.ranked.find((event) => event.id === id)!.title,
});
console.log(
  JSON.stringify(
    {
      editionId: fixture.editionId,
      mode: 'offline control; production unchanged',
      note: fixture.note,
      admission: { status: result.status, reason: result.reason },
      events: fixture.ranked.length,
      members: fixture.ranked.reduce((n, e) => n + e.coverage.length, 0),
      eventsWithSourceText: {
        baseline: withText(baseline),
        reservedControl: withText(transport),
      },
      reserved: result.reserved.map(describe),
      reservations: result.reservations.map((decision) => ({
        ...decision,
        title: describe(decision.eventId).title,
      })),
      displaced: result.displaced.map(describe),
      admitted: result.admitted.map((event) => describe(event.id)),
      editorEvidence: transport.evidence.candidates.map((event) => ({
        eventId: event.id,
        leadCharacters: event.excerpt.length,
        members: event.clusterEvidence.slice(1).map((member) => ({
          id: member.id,
          characters: member.excerpt.length,
          publisher: member.publisher ?? null,
          sources: member.sources,
        })),
      })),
    },
    null,
    2,
  ),
);
