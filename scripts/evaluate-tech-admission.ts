// Recorded-only evaluation: no database, network, configuration or provider access.
import { readFileSync } from 'node:fs';

import {
  type AdmissionEvent,
  type AdmissionScore,
  techAdmissionControl,
} from './lib/tech-admission-control';

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
      events: fixture.ranked.length,
      members: fixture.ranked.reduce((n, e) => n + e.coverage.length, 0),
      reserved: result.reserved.map(describe),
      displaced: result.displaced.map(describe),
      admitted: result.admitted.map((event) => describe(event.id)),
    },
    null,
    2,
  ),
);
