// Synthetic inputs for the private restore; never calls an application writer.
import { newEditionPublication } from '../apps/api/src/modules/digests/domain/edition-publication';

const cases = [
  ['scheduled', 'publication-probe:before-cutoff', '2026-11-02T23:59:59Z'],
  ['scheduled', 'publication-probe:future', '2026-11-08T15:03:00Z'],
  ['scheduled', 'publication-probe:offset', '2026-11-09T00:03:00+09:00'],
  ['manual', null, '2026-11-08T15:03:00Z'],
  ['test', null, '2026-11-08T15:03:00Z'],
  ['test', 'publication-probe:explicit-test', '2026-11-08T15:03:00Z'],
  ['scheduled', 'integration:publication-probe', '2026-11-08T15:03:00Z'],
  ['manual', 'integration:publication-probe-manual', '2026-11-08T15:03:00Z'],
] as const;

console.log(
  JSON.stringify(
    cases.map(([intent, key, timestamp]) => {
      const savedAt = new Date(timestamp);
      return {
        intent,
        key,
        savedAt: savedAt.toISOString(),
        ...newEditionPublication(intent, key, savedAt),
      };
    }),
  ),
);
