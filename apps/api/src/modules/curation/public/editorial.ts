import type { Pool } from 'pg';

import { AnthropicLlmAdapter } from '../adapters/anthropic';
import { llmConfig } from '../adapters/config';
import { BudgetedLlm } from '../application/budgeted-llm';
import { ShortlistEditor } from '../application/editor';
import { CandidateTriage } from '../application/triage';
import { PostgresLlmLedger } from '../database/llm.ledger';

export type { EditorialResult } from '../application/editor';
export type { TriageScore } from '../application/triage';

// Public composition boundary shared by manual and scheduled publication.
export function editorialServices(db: Pool) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const config = llmConfig();
  const ledger = new PostgresLlmLedger(db, config.caps);
  const llm = new BudgetedLlm(new AnthropicLlmAdapter(key), ledger);
  return {
    triage: new CandidateTriage(llm, ledger, config.haiku),
    editor: new ShortlistEditor(llm, config.sonnet, config.haiku),
  };
}
