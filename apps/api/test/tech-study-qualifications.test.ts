import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { assertAbsenceSupport } from '../src/modules/curation/application/absence-support';
import { ShortlistEditor } from '../src/modules/curation/application/editor';

const fixture = JSON.parse(
  readFileSync(
    new URL(
      './fixtures/llm/tech-study-qualifications-2026-11-18.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as { title: string; excerpt: string; rejectedSummary: string };
const summary = fixture.excerpt.slice(0, fixture.excerpt.indexOf(' Harvey'));

void test('saved Tech study retains output counterfinding and publication status through both editor routes', async () => {
  assert.throws(
    () =>
      assertAbsenceSupport(
        fixture.rejectedSummary,
        [fixture.title, fixture.excerpt],
        'summary',
      ),
    /unsupported-absence/,
  );
  assert.match(summary, /finished work did not measurably rise/);
  assert.match(summary, /no indication of completed peer review/);
  assert.ok(summary.length < 600);
  for (const route of ['sonnet', 'haiku']) {
    const calls: string[] = [];
    const price = (id: string) => ({
      id,
      input: 0,
      output: 0,
      cacheWrite: 0,
      cacheRead: 0,
    });
    const editor = new ShortlistEditor(
      {
        async json(request, validate) {
          calls.push(request.model.id);
          assert.match(
            request.instructions,
            /preserve central countervailing findings and supplied publication status/,
          );
          assert.match(
            request.instructions,
            /complete supplied source sentence verbatim/,
          );
          assert.equal(
            JSON.parse(request.prompt).candidates[0].excerpt,
            fixture.excerpt,
          );
          if (route === 'haiku' && request.model.id === 'sonnet') return null;
          return validate({
            brief: [
              'A working paper examines AI coding agents at 718 firms.',
              'Code review took 49 percent longer.',
            ],
            stories: [
              {
                id: 'study',
                evidenceIds: ['study'],
                headline:
                  'Coding-agent study finds longer code review alongside more code',
                summary,
                whyItMatters:
                  'The working paper measures the human review checkpoint.',
                rationale: 'A study of coding-agent adoption across 718 firms.',
              },
            ],
          });
        },
      },
      price('sonnet'),
      price('haiku'),
    );
    const result = await editor.edit(
      { id: 'tech', name: 'Tech & AI', description: '', guidance: '' },
      [
        {
          id: 'study',
          title: fixture.title,
          excerpt: fixture.excerpt,
          sources: ['hn'],
        },
      ],
      1,
      'offline-tech-study',
    );
    assert.equal(result?.model, route);
    assert.equal(result?.stories[0].summary, summary);
    assert.deepEqual(
      calls,
      route === 'sonnet' ? ['sonnet'] : ['sonnet', 'haiku'],
    );
  }
});
