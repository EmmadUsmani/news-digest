// Recorded-only bridge from admission decisions to the real editor evidence path.
import { editorEvidence } from '../../apps/api/src/modules/digests/application/editor-evidence';
import {
  type Candidate,
  rank,
} from '../../apps/api/src/modules/digests/domain/rank';
import {
  type AdmissionEvent,
  type AdmissionScore,
  techAdmissionControl,
} from './tech-admission-control';

export function recordedTechEvidence(input: {
  ranked: readonly AdmissionEvent[];
  scores: readonly AdmissionScore[];
  candidates: Candidate[];
  windowStart: string;
  windowEnd: string;
  enabled: boolean;
}) {
  const membership = new Map(
    input.ranked.flatMap((event) =>
      event.coverage.map((member) => [member.id, event.id] as const),
    ),
  );
  const matches = (a: Candidate, b: Candidate) =>
    membership.has(a.id) && membership.get(a.id) === membership.get(b.id);
  const start = new Date(input.windowStart);
  const end = new Date(input.windowEnd);
  // rank's public budget is capped at twenty. Preserve that contract while
  // reconstructing the recorded pre-truncation event list without new grouping.
  const first = rank(input.candidates, start, end, 20, matches);
  const used = new Set(
    first.flatMap((event) => event.coverage.map((c) => c.id)),
  );
  const ranked = [
    ...first,
    ...rank(
      input.candidates.filter((candidate) => !used.has(candidate.id)),
      start,
      end,
      20,
      matches,
    ),
  ];
  const decision = techAdmissionControl({
    ...input,
    ranked,
    topic: 'tech',
    grouping: 'validated',
    triage: 'complete',
  });
  return {
    ranked,
    decision,
    evidence: editorEvidence(decision.admitted, input.candidates),
  };
}
