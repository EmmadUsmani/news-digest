// Offline replay of retained production outputs. No provider or ledger imports.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { assertAbsenceSupport } from '../src/modules/curation/application/absence-support';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import type {
  TriageCandidate,
  TriageTopic,
} from '../src/modules/curation/application/triage';
import { LlmValidationFailure } from '../src/modules/curation/application/validation-failure';
import type { ModelPrice } from '../src/modules/curation/domain/llm.port';

type Output = {
  brief: string[];
  stories: Array<{
    id: string;
    evidenceIds: string[];
    headline: string;
    summary: string;
    whyItMatters: string;
    rationale: string;
  }>;
};
type Entry = {
  model: ModelPrice;
  attempt: string;
  input: { topic: TriageTopic; candidates: TriageCandidate[]; budget: number };
  output: Output;
};
const fields = ['headline', 'summary', 'whyItMatters', 'rationale'] as const;
const diagnostic = (error: unknown) => {
  if (error instanceof LlmValidationFailure)
    return { category: error.code, field: error.field };
  throw error;
};

export async function replayNbaRejections() {
  const fixture = JSON.parse(
    readFileSync(
      join(__dirname, '../test/fixtures/llm/nba-2026-11-12-rejected.json'),
      'utf8',
    ),
  ) as { editionId: string; entries: Entry[] };
  const results = [];
  for (const entry of fixture.entries) {
    let checked = false;
    let failure: ReturnType<typeof diagnostic> | null = null;
    const editor = new ShortlistEditor(
      {
        async json(_request, validate) {
          // Check this output once through the real schema/selection/field/brief
          // validator. A null result asks the editor to retain its normal fallback.
          if (checked) return null;
          checked = true;
          try {
            return await Promise.resolve(validate(entry.output));
          } catch (error) {
            failure = diagnostic(error);
            return null;
          }
        },
      },
      entry.model,
      entry.model,
    );
    const validated = await editor.edit(
      entry.input.topic,
      entry.input.candidates,
      entry.input.budget,
      fixture.editionId,
    );
    const evidenceFor = (ids: string[]) =>
      entry.input.candidates
        .filter((c) => ids.includes(c.id))
        .flatMap((c) => [
          c.title.slice(0, 300),
          c.excerpt?.slice(0, 600) ?? '',
        ]);
    const absenceFailures = [];
    // Separate diagnostic probes expose claims hidden behind the first failure.
    // They do not replace or override the full production validation above.
    for (const story of entry.output.stories) {
      for (const field of fields) {
        try {
          assertAbsenceSupport(
            story[field],
            evidenceFor(story.evidenceIds),
            field,
            field === 'summary',
          );
        } catch (error) {
          absenceFailures.push({
            storyId: story.id,
            ...diagnostic(error),
            text: story[field],
          });
        }
      }
    }
    for (const [index, text] of entry.output.brief.entries()) {
      try {
        assertAbsenceSupport(
          text,
          evidenceFor(entry.output.stories.flatMap((s) => s.evidenceIds)),
          'brief',
        );
      } catch (error) {
        absenceFailures.push({ index, ...diagnostic(error), text });
      }
    }
    results.push({
      model: entry.model.id,
      attempt: entry.attempt,
      validated: validated !== null,
      failure,
      absenceFailures,
    });
  }
  return { editionId: fixture.editionId, results };
}

if (require.main === module) {
  void replayNbaRejections().then((result) =>
    console.log(JSON.stringify(result, null, 2)),
  );
}
