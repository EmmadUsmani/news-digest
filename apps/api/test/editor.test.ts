import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import { LlmValidationFailure } from '../src/modules/curation/application/validation-failure';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

const topic = {
  id: 'tech',
  name: 'Tech',
  description: 'AI news',
  guidance: 'No filler',
};
const candidates = [
  {
    id: 'one',
    title: 'A launch',
    excerpt: 'A company announced a model.',
    sources: ['Publisher'],
  },
];
const story = {
  id: 'one',
  evidenceIds: ['one'],
  headline: 'Company announces model',
  summary: 'The company announced a model.',
  whyItMatters: 'Builders have a new option.',
  rationale: 'Relevant launch.',
};
const valid = {
  brief: ['A company announced a model.', 'A model launch.'],
  stories: [story],
};
function harness(outputs: unknown[] = [valid], refuse: string[] = []) {
  const config = llmConfig({});
  const calls: LlmRequest[] = [];
  const cache = new Map<string, unknown>();
  const ledger: LlmLedger = {
    async cached(key) {
      return cache.get(key);
    },
    async cache(key, value) {
      cache.set(key, value);
    },
    async reserve(request) {
      return refuse.includes(request.model.id) ? null : 'id';
    },
    async settle() {},
    async fail() {},
  };
  const llm = new BudgetedLlm(
    {
      async complete(request) {
        calls.push(request);
        return {
          text: JSON.stringify(
            outputs[Math.min(calls.length - 1, outputs.length - 1)],
          ),
          usage: { input: 1, output: 1, cacheWrite: 0, cacheRead: 0 },
        };
      },
    },
    ledger,
  );
  return {
    editor: new ShortlistEditor(llm, config.sonnet, config.haiku),
    calls,
    diagnostics: () => llm.validationDiagnostics(),
  };
}
void test('editor selects supplied IDs, records model and reuses cache across runs', async () => {
  const h = harness();
  const result = await h.editor.edit(topic, candidates, 1, 'first');
  assert.deepEqual(result, { ...valid, model: 'claude-sonnet-5-5' });
  assert.deepEqual(await h.editor.edit(topic, candidates, 1, 'second'), result);
  assert.equal(h.calls.length, 1);
});
void test('Sonnet reservation refusal falls back to capped Haiku; total refusal returns no AI result', async () => {
  const h = harness([valid], ['claude-sonnet-5-5']);
  assert.equal(
    (await h.editor.edit(topic, candidates, 1, 'fallback'))?.model,
    'claude-haiku-5-5',
  );
  assert.equal(h.calls.length, 1);
  const exhausted = harness([valid], ['claude-sonnet-5-5', 'claude-haiku-5-5']);
  assert.equal(await exhausted.editor.edit(topic, candidates, 1, 'none'), null);
  assert.equal(exhausted.calls.length, 0);
});
void test('invalid selection gets one repair per model then returns no result', async () => {
  for (const output of [
    { ...valid, stories: [{ ...story, id: 'invented' }] },
    { ...valid, stories: [story, story] },
    ...[[], ['invented'], ['one', 'one']].map((evidenceIds) => ({
      ...valid,
      stories: [{ ...story, evidenceIds }],
    })),
    { ...valid, brief: [] },
    { brief: valid.brief, stories: [] },
    { ...valid, stories: [{ ...story, url: 'https://invented.example' }] },
  ]) {
    const h = harness([output]);
    assert.equal(await h.editor.edit(topic, candidates, 1, 'invalid'), null);
    assert.equal(h.calls.length, 4);
  }
});
void test('quiet windows and zero budgets do not pad or spend', async () => {
  const h = harness([{ brief: [], stories: [] }]);
  assert.deepEqual(
    (await h.editor.edit(topic, candidates, 1, 'quiet'))?.stories,
    [],
  );
  const before = h.calls.length;
  assert.equal(
    (await h.editor.edit(topic, candidates, 0, 'zero'))?.model,
    'none',
  );
  assert.equal((await h.editor.edit(topic, [], 5, 'empty'))?.model, 'none');
  assert.equal(h.calls.length, before);
  await assert.rejects(() =>
    h.editor.edit(topic, [...candidates, ...candidates], 1, 'duplicate'),
  );
  await assert.rejects(() => h.editor.edit(topic, candidates, 11, 'budget'));
});
void test('maximum escaped shortlist stays under transport input bound', async () => {
  const h = harness([{ brief: [], stories: [] }]);
  const text = '\u0000'.repeat(5000);
  await h.editor.edit(
    { id: text, name: text, description: text, guidance: text },
    Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      title: text,
      excerpt: text,
      sources: [text, text, text],
    })),
    10,
    'bound',
  );
  assert.ok(
    Buffer.byteLength(h.calls[0].instructions + h.calls[0].prompt) + 2048 <
      100000,
  );
  assert.equal(h.calls.length, 1);
});

void test('editor retains supporting IDs outside selected stories and requires the lead ID', async () => {
  const second = { ...candidates[0], id: 'two' };
  const supported = {
    ...valid,
    stories: [{ ...story, evidenceIds: ['one', 'two'] }],
  };
  const h = harness([supported]);
  assert.deepEqual(
    (await h.editor.edit(topic, [...candidates, second], 1, 'support'))
      ?.stories,
    supported.stories,
  );
  const invalid = harness([
    { ...valid, stories: [{ ...story, evidenceIds: ['two'] }] },
  ]);
  assert.equal(
    await invalid.editor.edit(
      topic,
      [...candidates, second],
      1,
      'missing-lead',
    ),
    null,
  );
});

void test('absence claims fail closed in every output field and repair can remove them', async () => {
  for (const field of [
    'headline',
    'summary',
    'whyItMatters',
    'rationale',
  ] as const) {
    const invalid = {
      ...valid,
      stories: [{ ...story, [field]: 'Apple has not confirmed the feature.' }],
    };
    const h = harness([invalid]);
    assert.equal(await h.editor.edit(topic, candidates, 1, 'absence'), null);
    assert.equal(h.calls.length, 4);
    const repaired = harness([invalid, valid]);
    assert.ok(await repaired.editor.edit(topic, candidates, 1, 'repair'));
    assert.equal(repaired.calls.length, 2);
    assert.ok(
      repaired.calls[1].prompt.includes('failed the absence-support check'),
    );
    assert.ok(
      repaired.calls[1].prompt.includes('Return the complete corrected JSON'),
    );
    assert.ok(
      repaired.calls[1].prompt.includes(`The rejected field was ${field}.`),
    );
    assert.ok(!repaired.calls[1].prompt.includes('Apple has not confirmed'));
    // The original untrusted topic/shortlist is unchanged; feedback is fixed.
    assert.ok(repaired.calls[1].prompt.startsWith(repaired.calls[0].prompt));
    assert.equal(repaired.calls[1].model.id, repaired.calls[0].model.id);
  }
  const h = harness([
    { ...valid, brief: ['A launch.', 'No price is available.'] },
  ]);
  assert.equal(await h.editor.edit(topic, candidates, 1, 'brief'), null);
});

void test('absence support is limited to cited and actually supplied bounded input', async () => {
  const sentence = 'The company has not announced a price.';
  const output = { ...valid, stories: [{ ...story, summary: sentence }] };
  const supported = [{ ...candidates[0], excerpt: sentence }];
  assert.ok(
    await harness([output]).editor.edit(topic, supported, 1, 'supported'),
  );
  const other = { ...candidates[0], id: 'two', excerpt: sentence };
  assert.equal(
    await harness([output]).editor.edit(
      topic,
      [...candidates, other],
      1,
      'uncited',
    ),
    null,
  );
  const clipped = [{ ...candidates[0], excerpt: 'x'.repeat(601) + sentence }];
  assert.equal(
    await harness([output]).editor.edit(topic, clipped, 1, 'clipped'),
    null,
  );
  const changed = {
    ...valid,
    stories: [
      { ...story, summary: 'Another company has not announced a price.' },
    ],
  };
  assert.equal(
    await harness([changed]).editor.edit(topic, supported, 1, 'subject'),
    null,
  );
});

void test('editor exposes sanitized selection and absence failure categories through real validation', async () => {
  for (const [output, category] of [
    [
      { ...valid, stories: [{ ...story, evidenceIds: ['unknown'] }] },
      'invalid-selection',
    ],
    [
      {
        ...valid,
        stories: [
          { ...story, summary: 'The company has not confirmed the launch.' },
        ],
      },
      'unsupported-absence',
    ],
  ] as const) {
    const h = harness([output]);
    assert.equal(
      await h.editor.edit(topic, candidates, 1, 'diagnostics'),
      null,
    );
    assert.deepEqual(
      h.diagnostics().map((event) => event.category),
      Array(4).fill(category),
    );
  }
});

void test('editor advertises enforced text bounds and repairs overlong fields without relaxing validation', async () => {
  for (const [field, limit] of [
    ['headline', 240],
    ['summary', 1400],
    ['whyItMatters', 400],
    ['rationale', 400],
    ['brief', 400],
  ] as const) {
    const invalid =
      field === 'brief'
        ? { ...valid, brief: ['x'.repeat(limit + 1), 'A launch.'] }
        : { ...valid, stories: [{ ...story, [field]: 'x'.repeat(limit + 1) }] };
    const h = harness([invalid, valid]);
    assert.ok(await h.editor.edit(topic, candidates, 1, 'length-repair'));
    assert.equal(h.calls.length, 2);
    assert.deepEqual(h.diagnostics(), [
      { attempt: 'initial', category: 'invalid-schema' },
    ]);
    for (const request of h.calls) {
      assert.ok(request.instructions.includes('headline 1–240 characters'));
      assert.ok(request.instructions.includes('summary 1–1400 characters'));
      assert.ok(
        request.instructions.includes(
          'whyItMatters and rationale each 1–400 characters',
        ),
      );
      assert.ok(
        request.instructions.includes('each brief bullet 1–400 characters'),
      );
    }
    const boundary =
      field === 'brief'
        ? { ...valid, brief: ['x'.repeat(limit), 'A launch.'] }
        : { ...valid, stories: [{ ...story, [field]: 'x'.repeat(limit) }] };
    assert.ok(
      await harness([boundary]).editor.edit(topic, candidates, 1, 'boundary'),
    );
  }
});

void test('attribution-dropping absence claims are rejected in every editor field and brief', async () => {
  const evidence = [
    {
      ...candidates[0],
      excerpt: 'The ministry claims no civilians were injured.',
    },
  ];
  for (const field of [
    'headline',
    'summary',
    'whyItMatters',
    'rationale',
    'brief',
  ] as const) {
    const output =
      field === 'brief'
        ? { ...valid, brief: ['A report.', 'No civilians were injured.'] }
        : {
            ...valid,
            stories: [{ ...story, [field]: 'No civilians were injured.' }],
          };
    const h = harness([output, valid]);
    assert.ok(await h.editor.edit(topic, evidence, 1, 'attribution-repair'));
    assert.equal(h.calls.length, 2);
    assert.deepEqual(h.diagnostics(), [
      {
        attempt: 'initial',
        category: 'unsupported-absence',
        field,
        absenceMarker: 'negative-word',
      },
    ]);
  }
});

void test('NBA rank abbreviations do not force editorial repair or fallback', async () => {
  const ranked = {
    ...valid,
    brief: [
      'The No. 1 prospect leads the draft board.',
      'The draft board changes.',
    ],
    stories: [
      {
        ...story,
        headline: 'A new No. 1 prospect',
        summary: 'The No. 1 prospect leads the draft board.',
        rationale: 'A change at No. 1.',
      },
    ],
  };
  const h = harness([ranked]);
  assert.ok(
    await h.editor.edit(
      topic,
      [
        {
          ...candidates[0],
          title: 'Draft board updated',
          excerpt: 'The top prospect leads the revised draft board.',
        },
      ],
      1,
      'nba-rank',
    ),
  );
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.diagnostics(), []);
});

void test('repair feedback uses only closed application-owned field labels', () => {
  const unknownField = 'untrusted source instructions' as unknown as 'summary';
  const generic = new LlmValidationFailure('unsupported-absence');
  assert.equal(
    new LlmValidationFailure('unsupported-absence', unknownField).feedback,
    generic.feedback,
  );
  assert.equal(
    new LlmValidationFailure('invalid-selection', 'summary').feedback,
    '',
  );
  assert.ok(
    new LlmValidationFailure('unsupported-absence', 'brief').feedback.includes(
      'The rejected field was brief.',
    ),
  );
});

void test('headline-only evidence accepts a concise attributed summary without repair on either model', async () => {
  const title =
    'OpenSSH 10.6p2 released with workaround for critical vulnerability';
  const thin = [{ id: 'one', title, excerpt: title, sources: ['Hacker News'] }];
  const output = {
    brief: [title, 'OpenSSH release includes a vulnerability workaround.'],
    stories: [
      {
        id: 'one',
        evidenceIds: ['one'],
        headline: title,
        summary:
          'A Hacker News item reports that OpenSSH 10.6p2 was released with a workaround for a critical vulnerability.',
        whyItMatters: 'The release includes a vulnerability workaround.',
        rationale: 'A security release relevant to this topic.',
      },
    ],
  };
  for (const refused of [[], ['claude-sonnet-5-5']]) {
    const h = harness([output], refused);
    const result = await h.editor.edit(topic, thin, 1, 'thin-source');
    assert.deepEqual(result?.stories, output.stories);
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].purpose, 'shortlist-editor-v13');
    assert.match(h.calls[0].instructions, /one sentence for thin evidence/);
    assert.match(
      h.calls[0].instructions,
      /State the attributed claim directly/,
    );
    assert.match(
      h.calls[0].instructions,
      /Preserve the allegation as an allegation/,
    );
    assert.match(h.calls[0].instructions, /Preserve the full publisher name/);
    assert.match(
      h.calls[0].instructions,
      /an aggregator, not the reporting outlet/,
    );
    assert.match(
      h.calls[0].instructions,
      /describe the news, not the supplied inputs/,
    );
    assert.deepEqual(h.diagnostics(), []);
  }
});

void test('brief guidance reaches both editors without changing saved factual bullets', async () => {
  const second = {
    id: 'two',
    title: 'A patch',
    excerpt: 'Publisher reports a security patch was released.',
    sources: ['Publisher'],
  };
  const output = {
    brief: [
      'A company launched a model.',
      'Publisher reports a security patch release.',
    ],
    stories: [
      story,
      {
        ...story,
        id: 'two',
        evidenceIds: ['two'],
        headline: 'Security patch released',
        summary: second.excerpt,
      },
    ],
  };
  for (const refused of [[], ['claude-sonnet-5-5']]) {
    const h = harness([output], refused);
    const result = await h.editor.edit(
      topic,
      [...candidates, second],
      2,
      'compact-brief',
    );
    assert.deepEqual(result?.brief, output.brief);
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].purpose, 'shortlist-editor-v13');
    assert.match(
      h.calls[0].instructions,
      /not a copied list of the story headlines/,
    );
    assert.match(
      h.calls[0].instructions,
      /any necessary attribution or uncertainty/,
    );
    assert.match(
      h.calls[0].instructions,
      /Keep unrelated events distinct even in the brief/,
    );
    assert.deepEqual(h.diagnostics(), []);
  }
});

void test('aggregated security reporting retains the explicitly named publisher on both editors', async () => {
  const title = 'AI pipeline generates Linux exploits - The Hacker News';
  const evidence = [
    {
      id: 'one',
      title,
      excerpt: title,
      sources: ['Google News: artificial intelligence'],
    },
  ];
  const output = {
    brief: [
      'The Hacker News reports an AI exploit pipeline.',
      'The pipeline generates Linux exploits.',
    ],
    stories: [
      {
        ...story,
        headline: 'AI pipeline generates Linux exploits',
        summary:
          'The Hacker News reports that an AI pipeline generates Linux exploits.',
      },
    ],
  };
  for (const refused of [[], ['claude-sonnet-5-5']]) {
    const h = harness([output], refused);
    const result = await h.editor.edit(
      topic,
      evidence,
      1,
      'publisher-attribution',
    );
    assert.equal(result?.stories[0].summary, output.stories[0].summary);
    assert.deepEqual(JSON.parse(h.calls[0].prompt).candidates, evidence);
    assert.match(
      h.calls[0].instructions,
      /The Hacker News .* and Hacker News .* are different sources/,
    );
    assert.match(
      h.calls[0].instructions,
      /When the reporting publisher is unclear, do not guess/,
    );
  }
});

void test('summary guidance preserves the central headline claim when the excerpt supplies only background', async () => {
  const input = [
    {
      id: 'one',
      title: 'Warriors reportedly withhold salary payments from Porzingis',
      excerpt: 'Porzingis has been away from the team since late September.',
      sources: ['Publisher'],
    },
  ];
  const output = {
    brief: [
      'Warriors reportedly withhold salary payments from Porzingis.',
      'Porzingis has been away since late September.',
    ],
    stories: [
      {
        id: 'one',
        evidenceIds: ['one'],
        headline: input[0].title,
        summary:
          'The Warriors are reportedly withholding salary payments from Porzingis, who has been away from the team since late September.',
        whyItMatters: 'The report concerns player compensation.',
        rationale: 'A reported salary dispute.',
      },
    ],
  };
  for (const refused of [[], ['claude-sonnet-5-5']]) {
    const h = harness([output], refused);
    const result = await h.editor.edit(topic, input, 1, 'headline-development');
    assert.deepEqual(result?.stories, output.stories);
    assert.equal(h.calls.length, 1);
    assert.deepEqual(JSON.parse(h.calls[0].prompt).candidates, input);
    assert.match(
      h.calls[0].instructions,
      /Each summary must state the central development/,
    );
    assert.match(
      h.calls[0].instructions,
      /Facts explicitly supplied in a candidate title are usable evidence/,
    );
    assert.match(
      h.calls[0].instructions,
      /retain any attribution or uncertainty/,
    );
    assert.deepEqual(h.diagnostics(), []);
  }
});

void test('editor preserves practical release qualifications in both headline and summary', async () => {
  const input = [
    {
      id: 'one',
      title:
        'GTA 6 will come to stores sooner, but it is not playable right away',
      excerpt:
        'The physical edition and preloading move to November 10. It is not playable right away.',
      sources: ['GameSpot'],
    },
  ];
  const output = {
    brief: [
      'GTA 6 physical copies reach stores on November 10.',
      'Preloading also moves to November 10.',
    ],
    stories: [
      {
        id: 'one',
        evidenceIds: ['one'],
        headline:
          'GTA 6 store and preload dates move up; playable access remains separate',
        summary:
          'Physical copies and preloading move to November 10. It is not playable right away.',
        whyItMatters: 'The change concerns distribution and preloading.',
        rationale: 'An updated release schedule.',
      },
    ],
  };
  for (const refused of [[], ['claude-sonnet-5-5']]) {
    const h = harness([output], refused);
    const result = await h.editor.edit(
      topic,
      input,
      1,
      'release-qualification',
    );
    assert.deepEqual(result?.stories, output.stories);
    assert.deepEqual(JSON.parse(h.calls[0].prompt).candidates, input);
    assert.equal(h.calls[0].purpose, 'shortlist-editor-v13');
    assert.match(
      h.calls[0].instructions,
      /qualifications.*both headline and summary/,
    );
    assert.match(h.calls[0].instructions, /never invent an unlock date/);
    assert.match(
      h.calls[0].instructions,
      /retain its complete source sentence verbatim/,
    );
    assert.deepEqual(h.diagnostics(), []);
  }
});

void test('editor does not infer personal pronouns from a name or role', async () => {
  const input = [
    {
      id: 'one',
      title: 'Sony CFO Lin Tao says PS6 development is on schedule',
      excerpt: 'CFO Lin Tao said development is progressing as scheduled.',
      sources: ['Push Square'],
    },
  ];
  const output = {
    brief: [
      'PS6 development is on schedule.',
      'Sony CFO Lin Tao gave an update.',
    ],
    stories: [
      {
        id: 'one',
        evidenceIds: ['one'],
        headline: 'Sony CFO says PS6 development is on schedule',
        summary:
          'Sony CFO Lin Tao said development is progressing as scheduled.',
        whyItMatters: 'A next-generation console development update.',
        rationale: 'Firsthand attributed update.',
      },
    ],
  };
  for (const refused of [[], ['claude-sonnet-5-5']]) {
    const h = harness([output], refused);
    const result = await h.editor.edit(topic, input, 1, 'supported-pronouns');
    assert.deepEqual(result?.stories, output.stories);
    assert.deepEqual(JSON.parse(h.calls[0].prompt).candidates, input);
    assert.match(
      h.calls[0].instructions,
      /Use a person's name or role when the supplied text does not establish their pronouns/,
    );
    assert.match(
      h.calls[0].instructions,
      /never infer gender or pronouns from a name, title or outside knowledge/,
    );
    assert.deepEqual(h.diagnostics(), []);
  }
});

void test('routine roster guidance reaches both editors and allows unfilled story budgets', async () => {
  const input = [
    {
      id: 'one',
      title: 'Lakers assign Bronny James to G League',
      excerpt:
        'The Lakers assigned Bronny James to their G League affiliate after limited NBA playing time early this season.',
      sources: ['Yahoo Sports NBA'],
    },
  ];
  for (const refused of [[], ['claude-sonnet-5-5']]) {
    const h = harness([{ brief: [], stories: [] }], refused);
    const result = await h.editor.edit(topic, input, 5, 'routine-roster');
    assert.deepEqual(result?.stories, []);
    assert.deepEqual(result?.brief, []);
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].purpose, 'shortlist-editor-v13');
    assert.deepEqual(JSON.parse(h.calls[0].prompt).candidates, input);
    assert.match(
      h.calls[0].instructions,
      /supplied facts establish a substantial development/,
    );
    assert.match(
      h.calls[0].instructions,
      /familiar name, timely report or reputable outlet alone/,
    );
    assert.match(
      h.calls[0].instructions,
      /Keep serious new injuries, consequential trades and exceptional performances eligible/,
    );
    assert.match(
      h.calls[0].instructions,
      /Leave slots empty when only routine updates remain/,
    );
    assert.deepEqual(h.diagnostics(), []);
  }
});
