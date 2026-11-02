import type { Pool } from 'pg';

import { AnthropicLlmAdapter } from '../adapters/anthropic';
import { llmConfig } from '../adapters/config';
import { BudgetedLlm } from '../application/budgeted-llm';
import { ShortlistEditor } from '../application/editor';
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
    validationDiagnostics: BudgetedLlm['validationDiagnostics'];
  }
>();

// Public composition boundary shared by manual and scheduled publication.
export function editorialServices(db: Pool) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const existing = services.get(db);
  if (existing) return existing;
  const config = llmConfig();
  const ledger = configuredLlmLedger(db, config.caps);
  const llm = new BudgetedLlm(new AnthropicLlmAdapter(key), ledger);
  const result = {
    validationDiagnostics: () => llm.validationDiagnostics(),
    triage: new CandidateTriage(llm, ledger, config.haiku),
    editor: new ShortlistEditor(llm, config.sonnet, config.haiku),
    socialTriage: new CandidateTriage(llm, ledger, config.haiku, 'social'),
    socialEditor: new SocialPostEditor(llm, config.sonnet, config.haiku),
  };
  services.set(db, result);
  return result;
}

export type {
  SocialEditorialCandidate,
  SocialEditorialResult,
} from '../application/social-editor';
export type { TriageResult, TriageTopic } from '../application/triage';
