// Offline challenge cases: labels are agent judgments, not independent review.
import { assertAbsenceSupport } from '../src/modules/curation/application/absence-support';
import { LlmValidationFailure } from '../src/modules/curation/application/validation-failure';
import { evaluateEditorialWindow } from './evaluate-editorial';

type SupportCase = {
  id: string;
  origin: 'synthetic' | 'recorded-tech-v4';
  claim: string;
  evidence: string[];
  supported: boolean;
  reason: string;
  pair?: string;
  topic?: 'Tech & AI' | 'NBA' | 'Gaming' | 'World';
  dimension?: string;
};
const synthetic: Omit<SupportCase, 'origin'>[] = [
  {
    id: 'verbatim-negative',
    claim: 'The studio has not announced a release date.',
    evidence: ['The studio has not announced a release date.'],
    supported: true,
    reason: 'Exact statement of absence.',
  },
  {
    id: 'paraphrased-negative',
    claim: 'No release date has been announced by the studio.',
    evidence: ['The studio has not announced a release date.'],
    supported: true,
    reason:
      'Same subject, scope and fact; conservative verbatim rule rejects this paraphrase.',
  },
  {
    id: 'attributed-negative',
    claim: 'The league says no games were canceled.',
    evidence: ['According to the league, no games were canceled.'],
    supported: true,
    reason: 'Preserves attribution and scope but changes syntax.',
  },
  {
    id: 'positive-paraphrase',
    claim: 'The studio delayed the game to March.',
    evidence: ['The studio moved the game release from January to March.'],
    supported: true,
    reason: 'Direct restatement of the supplied schedule change.',
  },
  {
    id: 'omitted-confirmation',
    claim: 'Apple has not confirmed the feature.',
    evidence: ['Code hints suggest Apple could add a security camera mode.'],
    supported: false,
    reason: 'Omitted confirmation is not evidence of non-confirmation.',
  },
  {
    id: 'changed-subject',
    claim: 'The publisher has not announced a release date.',
    evidence: ['The studio has not announced a release date.'],
    supported: false,
    reason: 'Evidence concerns a different actor.',
  },
  {
    id: 'dropped-attribution',
    claim: 'No civilians were injured.',
    evidence: ['The ministry claims no civilians were injured.'],
    supported: false,
    reason:
      'A ministry claim is promoted to established fact; complete-sentence matching must reject it.',
  },
  {
    id: 'omitted-synonym',
    claim: 'The release date remains undisclosed.',
    evidence: ['The studio announced a new game.'],
    supported: false,
    reason: 'Unsupported absence expressed outside the lexical trigger list.',
  },
  {
    id: 'causal-invention',
    claim: 'The update caused revenue to rise.',
    evidence: ['The update launched in June. Revenue rose in July.'],
    supported: false,
    reason: 'Sequence does not establish causation.',
  },
  {
    id: 'rumor-to-fact',
    claim: 'The company will release the device in March.',
    evidence: ['A reporter says the company may release the device in March.'],
    supported: false,
    reason: 'Removes attribution and uncertainty.',
  },
];

// Each minimal pair holds evidence fixed and changes one supported clause.
// These are deliberately synthetic challenges, not real reporting or labels
// inferred from the validator's output.
const clausePairs = [
  {
    id: 'attribution',
    topic: 'World',
    dimension: 'attribution',
    evidence: 'The ministry says the ceasefire began on Monday.',
    supported: 'The ministry says the ceasefire began on Monday.',
    unsupported: 'The ceasefire began on Monday.',
    reason:
      'Dropping the ministry attribution promotes a reported claim to fact.',
  },
  {
    id: 'certainty',
    topic: 'NBA',
    dimension: 'uncertainty',
    evidence: 'The coach says the guard may return on Friday.',
    supported: 'The coach says the guard may return on Friday.',
    unsupported: 'The coach says the guard will return on Friday.',
    reason: 'A possible return is promoted to a definite return.',
  },
  {
    id: 'causation',
    topic: 'Gaming',
    dimension: 'causation',
    evidence: 'The studio released an update in June. Sales rose in July.',
    supported: 'Sales rose after the studio released an update.',
    unsupported: 'Sales rose because the studio released an update.',
    reason: 'Chronological order does not establish the cause of sales growth.',
  },
  {
    id: 'numeric-scope',
    topic: 'Tech & AI',
    dimension: 'quantity',
    evidence:
      'In the lab test, the tool reduced completion time by 20 percent.',
    supported:
      'In the lab test, the tool reduced completion time by 20 percent.',
    unsupported:
      'In the lab test, the tool reduced completion time by 40 percent.',
    reason: 'The claimed reduction doubles the reported result.',
  },
  {
    id: 'population',
    topic: 'Tech & AI',
    dimension: 'scope',
    evidence: 'Three hospitals are testing the assistant in a pilot.',
    supported: 'Three hospitals are testing the assistant in a pilot.',
    unsupported:
      'Hospitals nationwide are using the assistant in routine care.',
    reason: 'A three-hospital pilot does not establish broad routine adoption.',
  },
  {
    id: 'time',
    topic: 'Gaming',
    dimension: 'time',
    evidence: 'The publisher plans to release the game in March 2027.',
    supported: 'The publisher plans to release the game in March 2027.',
    unsupported: 'The publisher released the game in March 2027.',
    reason: 'A future plan does not establish a completed release.',
  },
  {
    id: 'cross-sentence-attribution',
    topic: 'World',
    dimension: 'attribution',
    evidence: 'The following is the ministry claim. No civilians were injured.',
    supported: 'The ministry claims no civilians were injured.',
    unsupported: 'No civilians were injured.',
    reason:
      'Sentence equality loses attribution carried by the preceding sentence.',
  },
  {
    id: 'conjunction',
    topic: 'NBA',
    dimension: 'clause-addition',
    evidence: 'The team won 110 to 100. The guard scored 30 points.',
    supported: 'The team won 110 to 100 and the guard scored 30 points.',
    unsupported:
      'The team won 110 to 100 and the guard set a franchise scoring record.',
    reason: 'A supported first clause does not support an added record claim.',
  },
] as const;
const pairedCases: SupportCase[] = clausePairs.flatMap((pair) =>
  ([true, false] as const).map((supported) => ({
    id: `${pair.id}-${supported ? 'supported' : 'unsupported'}`,
    origin: 'synthetic',
    pair: pair.id,
    topic: pair.topic,
    dimension: pair.dimension,
    claim: supported ? pair.supported : pair.unsupported,
    evidence: [pair.evidence],
    supported,
    reason: supported
      ? 'The complete claim is supported by the supplied evidence.'
      : pair.reason,
  })),
);

export function evaluateSupport() {
  const replay = evaluateEditorialWindow('tech', 'v4');
  const recorded = [
    {
      id: 'hospital-adoption',
      storyId: '9f62943a-1eb5-4cc7-b09a-1a47490cc556',
      reason:
        'One hospital claiming early access does not establish adoption by healthcare providers.',
    },
    {
      id: 'benchmark-generalization',
      storyId: '9f06d37d-b113-48a1-8c7b-1aef40f532f8',
      reason:
        'A title claiming one result does not establish a general route to stronger benchmark results.',
    },
  ].map(({ id, storyId, reason }): SupportCase => {
    const story = replay.selected.find((s) => s.id === storyId)!;
    const inputs = replay.evidenceInputs.find((s) => s.storyId === storyId)!;
    return {
      id,
      origin: 'recorded-tech-v4',
      claim: story.whyItMatters,
      evidence: inputs.candidates.flatMap((c) => [c.title, c.excerpt ?? '']),
      supported: false,
      reason,
    };
  });
  const cases = [
    ...synthetic.map((c) => ({ ...c, origin: 'synthetic' as const })),
    ...recorded,
    ...pairedCases,
  ].map((entry) => {
    let accepted = true;
    try {
      assertAbsenceSupport(entry.claim, entry.evidence);
    } catch (error) {
      if (!(error instanceof LlmValidationFailure)) throw error;
      accepted = false;
    }
    return { ...entry, accepted };
  });
  const supported = cases.filter((c) => c.supported);
  const unsupported = cases.filter((c) => !c.supported);
  return {
    caveat:
      'Hand-selected agent-labeled challenge cases, not a production error rate or independent factual verification. Synthetic text is never ingested or published. Lexical guard requires complete source sentences for absence claims.',
    supported: supported.length,
    unsupported: unsupported.length,
    falseRejections: supported.filter((c) => !c.accepted).map((c) => c.id),
    unsupportedAccepted: unsupported.filter((c) => c.accepted).map((c) => c.id),
    clausePairs: clausePairs.map((pair) => {
      const entries = cases.filter((entry) => entry.pair === pair.id);
      return {
        id: pair.id,
        topic: pair.topic,
        dimension: pair.dimension,
        supportedAccepted: entries.find((entry) => entry.supported)!.accepted,
        unsupportedRejected: !entries.find((entry) => !entry.supported)!
          .accepted,
      };
    }),
    cases,
  };
}
if (require.main === module)
  console.log(JSON.stringify(evaluateSupport(), null, 2));
