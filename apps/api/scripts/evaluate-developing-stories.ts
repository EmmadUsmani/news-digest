// Offline only: consume recorded semantic memberships, never call a provider or DB.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { matchDevelopingStories } from '../src/modules/digests/application/match-developing-stories';
import {
  developingEvidence,
  developingLinks,
} from '../src/modules/digests/domain/developing-links';

export type ReplayCase = {
  editionId: string;
  topicId: string;
  windowEnd: string;
  stories: Parameters<typeof developingLinks>[0];
  history: Parameters<typeof developingLinks>[1];
  reviewedStoryId?: string;
  expectedPredecessors?: { editionId: string; storyId: string }[];
};

export function replayFingerprint(item: ReplayCase) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        editionId: item.editionId,
        topicId: item.topicId,
        windowEnd: item.windowEnd,
        evidence: developingEvidence(item.stories, item.history),
        publicationTimes: item.history.map((edition) => edition.publishedAt),
      }),
    )
    .digest('hex');
}

const recordSchema = z
  .object({
    editionId: z.string(),
    topicId: z.string(),
    inputSha256: z.string().regex(/^[a-f0-9]{64}$/),
    groups: z.array(z.array(z.string()).min(2)),
  })
  .strict();

export async function evaluateDevelopingStories(
  cases: ReplayCase[],
  recorded: unknown,
) {
  const records = z.array(recordSchema).parse(recorded);
  const key = (item: { editionId: string; topicId: string }) =>
    JSON.stringify([item.editionId, item.topicId]);
  const inputs = new Set(cases.map(key));
  const results = new Map(records.map((record) => [key(record), record]));
  if (inputs.size !== cases.length || results.size !== records.length)
    throw new Error('Duplicate replay case or recorded result');
  if (records.some((record) => !inputs.has(key(record))))
    throw new Error('Recorded result has no replay input');
  const report = [];
  for (const item of cases) {
    const record = results.get(key(item));
    // Distinguish valid empty memberships from an invalid partition or no result.
    let valid = !!record && record.inputSha256 === replayFingerprint(item);
    if (record) {
      const references = new Set(
        developingEvidence(item.stories, item.history).map((x) => x.reference),
      );
      const seen = new Set<string>();
      for (const group of record.groups)
        for (const id of group) {
          if (!references.has(id) || seen.has(id)) valid = false;
          seen.add(id);
        }
    }
    let called = false;
    const links = await matchDevelopingStories(
      valid && record
        ? {
            groupWithResult() {
              called = true;
              return Promise.resolve({
                status: 'validated' as const,
                groups: record.groups,
              });
            },
          }
        : null,
      {
        topicId: item.topicId,
        publishedAt: item.windowEnd,
        runId: 'offline-replay',
      },
      item.stories,
      item.history,
    );
    const reviewed = item.reviewedStoryId !== undefined;
    if (
      reviewed &&
      (!item.stories.some((s) => s.id === item.reviewedStoryId) ||
        !item.expectedPredecessors)
    )
      throw new Error('Invalid review labels');
    const actual = links.find((link) => link.storyId === item.reviewedStoryId);
    const expected = item.expectedPredecessors ?? [];
    const evidence = developingEvidence(item.stories, item.history);
    const currentReference = evidence.find(
      (x) => x.editionId === null && x.story.id === item.reviewedStoryId,
    )?.reference;
    const membership = record?.groups.find(
      (group) => currentReference && group.includes(currentReference),
    );
    const predecessors = evidence
      .filter((x) => x.editionId !== null && membership?.includes(x.reference))
      .map((x) => ({ editionId: x.editionId!, storyId: x.story.id }));
    const identities = (items: typeof predecessors) =>
      items.map((x) => JSON.stringify([x.editionId, x.storyId])).sort();
    const exactMembership =
      JSON.stringify(identities(predecessors)) ===
      JSON.stringify(identities(expected));
    // Labels list all matching historical occurrences, newest first.
    const passes =
      reviewed &&
      valid &&
      called &&
      exactMembership &&
      (expected.length
        ? actual?.previousEditionId === expected[0].editionId &&
          actual.previousStoryId === expected[0].storyId &&
          actual.editionCount === expected.length + 1
        : actual === undefined);
    report.push({
      editionId: item.editionId,
      topicId: item.topicId,
      status: !record
        ? 'missing'
        : !valid
          ? 'invalid'
          : !called
            ? 'unavailable'
            : 'replayed',
      acceptance: reviewed ? (passes ? 'pass' : 'fail') : 'unreviewed',
      links,
      review: reviewed
        ? { storyId: item.reviewedStoryId, expected, predecessors }
        : null,
    });
  }
  return {
    purpose:
      'Recorded memberships only; provenance and unreviewed links require human review',
    semanticAcceptance: 'not-established',
    cases: report,
    controlsPassed:
      report.length > 0 && report.every((r) => r.acceptance === 'pass'),
  };
}

async function main() {
  const [input, recorded] = process.argv.slice(2);
  if (!input || !recorded || process.argv.length !== 4)
    throw new Error(
      'Usage: tsx apps/api/scripts/evaluate-developing-stories.ts inputs.json recorded-groups.json',
    );
  const fixture = JSON.parse(readFileSync(input, 'utf8')) as {
    cases: ReplayCase[];
  };
  const report = await evaluateDevelopingStories(
    fixture.cases,
    JSON.parse(readFileSync(recorded, 'utf8')),
  );
  console.log(JSON.stringify(report, null, 2));
  if (!report.controlsPassed) process.exitCode = 1;
}

if (require.main === module)
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Replay failed');
    process.exitCode = 1;
  });
