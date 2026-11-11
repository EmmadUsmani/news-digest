import type { Pool } from 'pg';

import { AnthropicLlmAdapter } from '../adapters/anthropic';
import { llmConfig } from '../adapters/config';
import { FileRejectedEditorStore } from '../adapters/rejected-editor-store';
import { BudgetedLlm } from '../application/budgeted-llm';
import { ShortlistEditor } from '../application/editor';
import { EventGrouping } from '../application/event-grouping';
import { SocialPostEditor } from '../application/social-editor';
import { CandidateTriage } from '../application/triage';
import { configuredLlmLedger } from './ledger';

export type { EditorialResult } from '../application/editor';
export type { TriageScore } from '../application/triage';

// Reuse services for every publication using the same pool. This lets overlapping
// manual runs share in-flight requests without retaining pools after shutdown.
const services = new WeakMap<
  Pool,
  {
    triage: CandidateTriage;
    editor: ShortlistEditor;
    socialTriage: CandidateTriage;
    socialEditor: SocialPostEditor;
    grouping: EventGrouping | null;
    validationDiagnostics: BudgetedLlm['validationDiagnostics'];
  }
>();

// Public composition boundary shared by manual and scheduled publication.
export function editorialServices(db: Pool) {
  const groupingEnabled = storyGroupingEnabled();
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const existing = services.get(db);
  if (existing) return existing;
  const config = llmConfig();
  const ledger = configuredLlmLedger(db, config.caps);
  const llm = new BudgetedLlm(
    new AnthropicLlmAdapter(key),
    ledger,
    undefined,
    new FileRejectedEditorStore(),
  );
  const result = {
    validationDiagnostics: () => llm.validationDiagnostics(),
    triage: new CandidateTriage(llm, ledger, config.haiku),
    editor: new ShortlistEditor(llm, config.sonnet, config.haiku),
    grouping: groupingEnabled ? new EventGrouping(llm, config.haiku) : null,
    socialTriage: new CandidateTriage(llm, ledger, config.haiku, 'social'),
    socialEditor: new SocialPostEditor(llm, config.sonnet, config.haiku),
  };
  services.set(db, result);
  return result;
}

export function storyGroupingEnabled(env: NodeJS.ProcessEnv = process.env) {
  const value = env.LLM_STORY_GROUPING_ENABLED ?? '0';
  if (!['0', '1'].includes(value))
    throw new Error('Invalid LLM_STORY_GROUPING_ENABLED');
  return value === '1';
}

export type {
  GroupingCandidate,
  OwnedStoryGroup,
  StoryScope,
} from '../application/event-grouping';
export type {
  SocialEditorialCandidate,
  SocialEditorialOutcome,
  SocialEditorialResult,
} from '../application/social-editor';
export type { TriageResult, TriageTopic } from '../application/triage';
