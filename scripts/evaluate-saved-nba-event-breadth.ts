// Offline comparison of manual labels; scripted responses only, no network or DB.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { logger } from '../apps/api/src/libs/observability/logging';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import { SocialPostEditor } from '../apps/api/src/modules/curation/application/social-editor';
import type { LlmLedger } from '../apps/api/src/modules/curation/domain/llm-ledger.port';
import { socialStoryContext } from '../apps/api/src/modules/digests/domain/social-story-context';
import { planJointEventBudget } from '../apps/api/src/modules/social/domain/joint-event-budget';
import { selectWithEventBudget } from '../apps/api/src/modules/social/public/event-budget';

const root = new URL('../docs/edition-reviews/', import.meta.url);
const saved = JSON.parse(
  readFileSync(new URL('2026-11-18-bluesky-selection.json', root), 'utf8'),
) as {
  editionId: string;
  topics: {
    topic: string;
    posts: { author: string; text: string }[];
    otherPostTexts: { author: string; text: string }[];
  }[];
};
const labels = JSON.parse(
  readFileSync(new URL('2026-11-18-nba-event-labels.json', root), 'utf8'),
) as {
  editionId: string;
  posts: {
    id: string;
    author: string;
    textSha256: string;
    event: string;
    standalone: boolean;
  }[];
  preferred: string[];
};
assert.equal(saved.editionId, labels.editionId);
const nba = saved.topics.find((topic) => topic.topic === 'NBA');
assert.ok(nba);
const published = [...nba.otherPostTexts, ...nba.posts];
assert.equal(published.length, labels.posts.length);
assert.equal(new Set(labels.posts.map((post) => post.id)).size, 4);
for (const label of labels.posts) {
  const matches = published.filter(
    (post) =>
      post.author === label.author &&
      createHash('sha256').update(post.text).digest('hex') === label.textSha256,
  );
  assert.equal(matches.length, 1, `Saved text drift: ${label.id}`);
}
type Post = (typeof labels.posts)[number];
function measure(posts: Post[]) {
  const events = new Set(posts.map((post) => post.event));
  return {
    slots: posts.length,
    labeledEvents: events.size,
    repeatedEventSlots: posts.length - events.size,
    nonStandalone: posts.filter((post) => !post.standalone).length,
  };
}
const preferred = labels.preferred.map((id) => {
  const post = labels.posts.find((post) => post.id === id);
  assert.ok(post, `Unknown preferred ID: ${id}`);
  return post;
});
// Enumerate every subset, rather than blessing only the preferred answer.
const acceptable: string[][] = [];
for (let mask = 0; mask < 1 << labels.posts.length; mask++) {
  const subset = labels.posts.filter((_, index) => mask & (1 << index));
  const metrics = measure(subset);
  if (
    metrics.labeledEvents === 2 &&
    metrics.repeatedEventSlots === 0 &&
    metrics.nonStandalone === 0
  ) {
    acceptable.push(subset.map((post) => post.id));
  }
}
assert.deepEqual(acceptable, [
  ['curry-contract', 'lakers-streak'],
  ['curry-contract', 'lakers-duo'],
]);
assert.deepEqual(measure(labels.posts), {
  slots: 4,
  labeledEvents: 2,
  repeatedEventSlots: 2,
  nonStandalone: 1,
});
assert.deepEqual(measure(preferred), {
  slots: 2,
  labeledEvents: 2,
  repeatedEventSlots: 0,
  nonStandalone: 0,
});
console.log(
  JSON.stringify({
    mode: 'offline-manual-label-comparison',
    exactTexts: published.length,
    subsets: 1 << labels.posts.length,
    published: measure(labels.posts),
    preferred: measure(preferred),
    acceptable,
    providerCalls: 0,
    productionSelectionChanged: false,
  }),
);

// Joint story/post comparison uses saved prose, with editorial event labels.
// Scripted editor replay below does not establish semantic model acceptance.
type JointLabels = {
  editionId: string;
  topics: {
    topic: string;
    slots: {
      id: string;
      kind: 'story' | 'post';
      text: string;
      textSha256: string;
      event: string;
      retain: boolean;
    }[];
  }[];
};
// Feed existing manual labels through the actual editor wire validation and
// cache. This tests plumbing, not the model's ability to produce those labels.
async function replayEditor(
  topic: JointLabels['topics'][number],
  date: string,
  completeStoryEvidence = false,
) {
  const stories = topic.slots.filter((slot) => slot.kind === 'story');
  const posts = topic.slots.filter((slot) => slot.kind === 'post');
  const context = socialStoryContext(
    stories.map(({ text }) => {
      const split = text.indexOf('\n');
      assert.ok(split >= 0);
      return { title: text.slice(0, split), summary: text.slice(split + 1) };
    }),
    { completeSummaries: completeStoryEvidence },
  );
  const cache = new Map<string, unknown>();
  const ledger: LlmLedger = {
    cached(key) {
      return Promise.resolve(cache.get(key));
    },
    cache(key, value) {
      cache.set(key, value);
      return Promise.resolve();
    },
    reserve() {
      return Promise.resolve('offline');
    },
    async settle() {},
    async fail() {},
  };
  let scriptedCalls = 0;
  const config = llmConfig({});
  const editor = new SocialPostEditor(
    new BudgetedLlm(
      {
        complete(request) {
          scriptedCalls++;
          const wire = JSON.parse(request.prompt) as {
            candidates: { id: string; text: string }[];
            coveredStories: { id: string; title: string; summary: string }[];
          };
          assert.equal(wire.candidates.length, posts.length);
          assert.equal(wire.coveredStories.length, stories.length);
          const annotations = [
            ...wire.coveredStories.map((story, index) => ({
              id: story.id,
              text: `${story.title}\n${story.summary}`,
              label: stories[index],
            })),
            ...wire.candidates.map((post, index) => ({
              ...post,
              label: posts[index],
            })),
          ].map(({ id, text, label }) => ({
            id,
            event: label.event,
            eventEvidence: text,
            materialFacts:
              label.kind === 'post' && label.retain
                ? [{ id: label.id, evidence: text }]
                : [],
          }));
          return Promise.resolve({
            text: JSON.stringify({
              posts: wire.candidates.map(({ id }) => ({
                id,
                whyItMatters: '',
                rationale: 'Saved selection.',
              })),
              qualifiedAlternatives: [],
              eventAnnotations: annotations,
            }),
            usage: { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 },
          });
        },
      },
      ledger,
      logger.child({}, { level: 'silent' }),
    ),
    config.sonnet,
    config.haiku,
  );
  const input = posts.map(({ id, text }) => ({
    id,
    text,
    author: 'Saved author',
    publishedAt: `${date}T14:00:00Z`,
    relevance: 10,
    interestingness: 10,
  }));
  const run = () =>
    editor.editOutcome(
      { id: topic.topic, name: topic.topic, description: '', guidance: '' },
      input,
      posts.length,
      'offline-saved-event-budget',
      [],
      context,
      { reviewEvents: true, completeStoryEvidence },
    );
  const first = await run();
  assert.equal(first.status, 'complete');
  assert.deepEqual(await run(), first, `Cache drift: ${topic.topic}`);
  assert.equal(scriptedCalls, 1);
  if (first.status !== 'complete') throw new Error('Unreachable');
  assert.ok(
    first.value.eventReview,
    `Invalid manual wire review: ${topic.topic}`,
  );
  assert.deepEqual(
    first.value.posts.map(({ id }) => id),
    posts.map(({ id }) => id),
  );
  const shortened =
    context.some((story) => story.textTruncated) ||
    posts.some((post) => post.text.length > 1200);
  assert.equal(first.value.eventBudgetPreview === null, shortened);
  const ids =
    first.value.eventBudgetPreview?.map(({ id }) => id) ??
    posts.map(({ id }) => id);
  return { ids, previewRefused: shortened, scriptedCalls };
}
async function compareJointEditions() {
  for (const [date, editionId, expectedSlots, expectedRetained] of [
    ['2026-11-17', '6216cb7a-3b6a-4fff-9e35-5fe959eb0c8e', 45, 45],
    ['2026-11-18', saved.editionId, 44, 40],
  ] as const) {
    const joint = JSON.parse(
      readFileSync(new URL(`${date}-joint-event-labels.json`, root), 'utf8'),
    ) as JointLabels;
    assert.equal(joint.editionId, editionId);
    if (date === '2026-11-17') {
      const retainedBluesky = JSON.parse(
        readFileSync(
          new URL('2026-11-17-bluesky-edition-quality.json', root),
          'utf8',
        ),
      ) as {
        editionId: string;
        selectedPosts: { topic: string; text: string }[];
      };
      assert.equal(retainedBluesky.editionId, joint.editionId);
      for (const post of retainedBluesky.selectedPosts) {
        const topic = joint.topics.find((item) => item.topic === post.topic);
        assert.ok(topic);
        assert.equal(
          topic.slots.filter(
            (slot) => slot.kind === 'post' && slot.text === post.text,
          ).length,
          1,
        );
      }
      assert.deepEqual(
        joint.topics.map(
          (topic) => new Set(topic.slots.map((slot) => slot.event)).size,
        ),
        [8, 9, 10, 9, 8],
      );
    }
    assert.equal(joint.topics.length, 5);
    assert.equal(new Set(joint.topics.map((topic) => topic.topic)).size, 5);
    const comparison = await Promise.all(
      joint.topics.map(async ({ topic, slots }) => {
        if (date === '2026-11-18') {
          const savedTopic = saved.topics.find((item) => item.topic === topic);
          assert.ok(savedTopic);
          assert.deepEqual(
            slots
              .filter((slot) => slot.kind === 'post')
              .map((slot) => slot.text)
              .sort(),
            [...savedTopic.otherPostTexts, ...savedTopic.posts]
              .map((post) => post.text)
              .sort(),
            `Joint posts differ from retained publication: ${topic}`,
          );
        }
        assert.equal(new Set(slots.map((slot) => slot.id)).size, slots.length);
        assert.equal(slots.filter((slot) => slot.kind === 'story').length, 5);
        for (const slot of slots) {
          assert.ok(slot.event.trim());
          assert.equal(
            createHash('sha256').update(slot.text).digest('hex'),
            slot.textSha256,
            `Joint saved text drift: ${slot.id}`,
          );
        }
        const retained = slots.filter((slot) => slot.retain);
        assert.ok(
          slots
            .filter((slot) => slot.kind === 'story')
            .every((slot) => slot.retain),
        );
        assert.deepEqual(
          [...new Set(retained.map((slot) => slot.event))].sort(),
          [...new Set(slots.map((slot) => slot.event))].sort(),
          `Lost labelled event: ${topic}`,
        );
        function concentration(items: typeof slots) {
          const counts = new Map<string, number>();
          for (const slot of items)
            counts.set(slot.event, (counts.get(slot.event) ?? 0) + 1);
          const largest = Math.max(...counts.values());
          return {
            slots: items.length,
            events: counts.size,
            largest,
            largestShare: largest / items.length,
          };
        }
        // Search the entire post-deletion policy space, not just the hand-picked
        // subset. Stories and every slot labelled as adding material facts stay.
        // These labels are an evaluation oracle, never a runtime selection input.
        const stories = slots.filter((slot) => slot.kind === 'story');
        const posts = slots.filter((slot) => slot.kind === 'post');
        assert.ok(posts.length <= 20, 'Bound exhaustive offline enumeration');
        const events = [...new Set(slots.map((slot) => slot.event))].sort();
        let admissibleSubsets = 0;
        let best = slots;
        for (let mask = 0; mask < 2 ** posts.length; mask++) {
          const selected = posts.filter((_, index) => mask & (1 << index));
          if (posts.some((post) => post.retain && !selected.includes(post)))
            continue;
          const subset = [...stories, ...selected];
          if (
            JSON.stringify(
              [...new Set(subset.map((slot) => slot.event))].sort(),
            ) !== JSON.stringify(events)
          )
            continue;
          admissibleSubsets++;
          const candidate = concentration(subset);
          const current = concentration(best);
          // Compare exact fractions; retain more supplied facts on a tie.
          if (
            candidate.largest * current.slots <
              current.largest * candidate.slots ||
            (candidate.largest * current.slots ===
              current.largest * candidate.slots &&
              candidate.slots > current.slots)
          )
            best = subset;
        }
        assert.ok(admissibleSubsets > 0);
        // Exercise the actual bounded planner against this independent exhaustive
        // oracle. Existing retain labels conservatively stand for unique facts;
        // they are not inferred annotations for production candidate pools.
        const plannedIds = planJointEventBudget({
          stories: stories.map((slot) => ({ ...slot, materialFacts: [] })),
          candidates: posts.map((slot) => ({
            ...slot,
            materialFacts: slot.retain ? [slot.id] : [],
          })),
          selectedPostIds: posts.map((slot) => slot.id),
          postBudget: posts.length,
        });
        const evidenceBound = selectWithEventBudget({
          stories,
          candidates: posts,
          selectedPostIds: posts.map((slot) => slot.id),
          postBudget: posts.length,
          annotations: slots.map((slot) => ({
            id: slot.id,
            event: slot.event,
            eventEvidence: slot.text,
            materialFacts:
              slot.kind === 'post' && slot.retain
                ? [{ id: slot.id, evidence: slot.text }]
                : [],
          })),
        });
        assert.equal(evidenceBound.status, 'complete');
        assert.deepEqual(
          evidenceBound.posts.map((post) => post.id),
          plannedIds,
        );
        for (const post of evidenceBound.posts) assert.ok(posts.includes(post));
        const planned = [
          ...stories,
          ...posts.filter((slot) => plannedIds.includes(slot.id)),
        ];
        assert.equal(
          concentration(planned).largest * best.length,
          concentration(best).largest * planned.length,
          `Planner differs from exhaustive oracle: ${topic}`,
        );
        assert.ok(
          slots
            .filter((slot) => slot.retain)
            .every((slot) => best.includes(slot)),
        );
        const expanded = await replayEditor({ topic, slots }, date, true);
        const expandedSlots = [
          ...stories,
          ...posts.filter((slot) => expanded.ids.includes(slot.id)),
        ];
        assert.deepEqual(
          new Set(expandedSlots.map((slot) => slot.event)),
          new Set(slots.map((slot) => slot.event)),
        );
        assert.ok(
          slots
            .filter((slot) => slot.retain)
            .every((slot) => expandedSlots.includes(slot)),
        );
        assert.deepEqual(
          expanded.ids,
          expanded.previewRefused ? posts.map(({ id }) => id) : plannedIds,
        );
        const replay = await replayEditor({ topic, slots }, date);
        assert.deepEqual(
          replay.ids,
          replay.previewRefused ? posts.map(({ id }) => id) : plannedIds,
        );
        const editorSlots = [
          ...stories,
          ...posts.filter((slot) => replay.ids.includes(slot.id)),
        ];
        assert.deepEqual(
          new Set(editorSlots.map((slot) => slot.event)),
          new Set(slots.map((slot) => slot.event)),
        );
        assert.ok(
          slots
            .filter((slot) => slot.retain)
            .every((slot) => editorSlots.includes(slot)),
        );
        return {
          topic,
          expandedEditorReplay: {
            after: concentration(expandedSlots),
            previewRefused: expanded.previewRefused,
            scriptedCalls: expanded.scriptedCalls,
            cacheReused: true,
          },
          editorReplay: {
            after: concentration(editorSlots),
            previewRefused: replay.previewRefused,
            scriptedCalls: replay.scriptedCalls,
            cacheReused: true,
          },
          before: concentration(slots),
          after: concentration(retained),
          deletionPolicyBound: {
            enumeratedSubsets: 2 ** posts.length,
            admissibleSubsets,
            best: concentration(best),
            removedIds: slots
              .filter((slot) => !best.includes(slot))
              .map((slot) => slot.id),
            improves:
              concentration(best).largest * slots.length <
              concentration(slots).largest * best.length,
          },
        };
      }),
    );
    assert.ok(
      comparison.every((topic) => !topic.expandedEditorReplay.previewRefused),
    );
    assert.deepEqual(
      comparison.map((topic) => topic.expandedEditorReplay.after),
      comparison.map((topic) => topic.deletionPolicyBound.best),
      'Complete-summary editor must match the fact-preserving exhaustive oracle',
    );
    assert.deepEqual(
      comparison.map((topic) => topic.editorReplay.previewRefused),
      date === '2026-11-18'
        ? [true, true, false, false, true]
        : [true, false, false, false, false],
      'Saved evidence completeness changed; review editor replay results',
    );
    for (const topic of comparison) {
      assert.deepEqual(
        topic.editorReplay.after,
        topic.before,
        `Bounded editor preview unexpectedly improved: ${topic.topic}`,
      );
    }
    assert.equal(
      joint.topics.flatMap((topic) => topic.slots).length,
      expectedSlots,
    );
    assert.deepEqual(
      comparison.map((topic) => topic.deletionPolicyBound.improves),
      date === '2026-11-18'
        ? [false, true, false, false, true]
        : [false, false, false, false, false],
      'Deletion feasibility changed; review material-fact labels before accepting',
    );
    assert.equal(
      joint.topics.flatMap((topic) => topic.slots).filter((slot) => slot.retain)
        .length,
      expectedRetained,
    );
    console.log(
      JSON.stringify({
        mode: 'offline-manual-joint-event-comparison',
        editionId: joint.editionId,
        comparison,
        providerCalls: 0,
        productionSelectionChanged: false,
      }),
    );
  }
}
void compareJointEditions().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
