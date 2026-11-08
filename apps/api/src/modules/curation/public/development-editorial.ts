import { llmConfig } from '../adapters/config';
import { ShortlistEditor } from '../application/editor';
import { EventGrouping } from '../application/event-grouping';
import { SocialPostEditor } from '../application/social-editor';
import { CandidateTriage } from '../application/triage';
import { developmentJson } from './development-json';

/** One isolated test edition. No production ledger, durable cache or env prices.
 * The runtime supplies reservation-first development accounting; this local
 * cache only shares triage within this edition and is discarded afterwards.
 */
export function developmentEditorialServices(
  runtime: Parameters<typeof developmentJson>[0],
  editionId: string,
  groupingEnabled = false,
) {
  const llm = developmentJson(runtime, editionId);
  const models = llmConfig({});
  const values = new Map<string, unknown>();
  const cache = {
    cached(key: string) {
      return Promise.resolve(values.get(key));
    },
    cache(key: string, value: unknown) {
      values.set(key, value);
      return Promise.resolve();
    },
  };
  return {
    triage: new CandidateTriage(llm, cache, models.haiku),
    editor: new ShortlistEditor(llm, models.sonnet, models.haiku),
    socialTriage: new CandidateTriage(llm, cache, models.haiku, 'social'),
    socialEditor: new SocialPostEditor(llm, models.sonnet, models.haiku),
    grouping: groupingEnabled ? new EventGrouping(llm, models.haiku) : null,
    validationDiagnostics: () => [],
  };
}
