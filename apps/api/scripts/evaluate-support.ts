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
    cases,
  };
}
if (require.main === module)
  console.log(JSON.stringify(evaluateSupport(), null, 2));
