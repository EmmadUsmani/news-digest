// Offline review aid: saved cluster membership only; no semantic inference.
import { readFileSync, writeFileSync } from 'node:fs';

import { digestPreviewSchema, readerEditionSchema } from '@digest/contracts';
import { z } from 'zod';

import { canonicalUrl } from '../src/modules/ingestion/domain/normalize';

const captureSchema = z.object({
  schemaVersion: z.literal(1),
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }),
  capturedAt: z.string().datetime({ offset: true }),
  windowEnded: z.boolean().optional(),
  feeds: z.array(
    z.object({
      topic: z.string(),
      name: z.string(),
      observedAt: z.string().datetime({ offset: true }),
      captureCompletedAt: z.string().datetime({ offset: true }).optional(),
      error: z.string().optional(),
      stories: z
        .array(
          z.object({
            title: z.string(),
            excerpt: z.string().nullable().optional(),
            url: z.string().url(),
            publishedAt: z.string().datetime({ offset: true }),
          }),
        )
        .optional(),
    }),
  ),
});

// A saved editor prompt is evidence of admission, not a complete collected pool.
const promptMember = z.object({ id: z.string(), url: z.string().optional() });
const promptSchema = z.object({
  topic: z.object({ id: z.string() }),
  candidates: z.array(
    promptMember.extend({
      title: z.string(),
      clusterEvidence: z.array(promptMember).optional(),
    }),
  ),
});

function editorInput(prompt: string | undefined, topicId: string) {
  if (!prompt) return null;
  try {
    const parsed = promptSchema.parse(JSON.parse(prompt));
    if (parsed.topic.id !== topicId) return null;
    if (
      new Set(parsed.candidates.map((item) => item.id)).size !==
      parsed.candidates.length
    )
      return null;
    return parsed.candidates;
  } catch {
    return null;
  }
}

export function traceReferenceStories(
  captureInput: unknown,
  editionInput: unknown,
  snapshotInput?: unknown,
) {
  // Multiple rolling observations remain separate: deduplicating their URLs
  // here would erase timing and failed-feed evidence needed by the reviewer.
  const captures = (
    Array.isArray(captureInput) ? captureInput : [captureInput]
  ).map((input) => captureSchema.parse(input));
  if (!captures.length) throw new Error('No reference observations');
  const first = captures[0];
  if (
    captures.some(
      (item) =>
        Date.parse(item.start) !== Date.parse(first.start) ||
        Date.parse(item.end) !== Date.parse(first.end),
    )
  )
    throw new Error('Reference observation windows must match exactly');
  const capture = {
    ...first,
    capturedAt: captures.reduce(
      (latest, item) =>
        Date.parse(item.capturedAt) > Date.parse(latest)
          ? item.capturedAt
          : latest,
      first.capturedAt,
    ),
    feeds: captures.flatMap((item) =>
      item.feeds.map((feed) => ({
        ...feed,
        captureCompletedAt: feed.captureCompletedAt ?? item.capturedAt,
      })),
    ),
  };
  const edition = readerEditionSchema.parse(editionInput);
  const snapshot =
    snapshotInput === undefined
      ? undefined
      : digestPreviewSchema.parse(snapshotInput);
  if (
    snapshot &&
    (snapshot.id !== edition.id ||
      Date.parse(snapshot.windowStart) !== Date.parse(edition.windowStart) ||
      Date.parse(snapshot.windowEnd) !== Date.parse(edition.windowEnd))
  )
    throw new Error('Snapshot and reader edition must match exactly');
  const start = Date.parse(capture.start);
  const end = Date.parse(capture.end);
  if (
    start >= end ||
    start !== Date.parse(edition.windowStart) ||
    end !== Date.parse(edition.windowEnd)
  )
    throw new Error('Reference and edition windows must match exactly');
  if (
    snapshot &&
    new Set(snapshot.topics.map((topic) => topic.id)).size !==
      snapshot.topics.length
  )
    throw new Error('Ambiguous snapshot topic IDs');
  const names = edition.topics.map((topic) => topic.name);
  if (new Set(names).size !== names.length)
    throw new Error('Ambiguous topic names');
  return {
    editionId: edition.id,
    windowStart: edition.windowStart,
    windowEnd: edition.windowEnd,
    capturedAt: capture.capturedAt,
    observationCount: captures.length,
    windowEnded:
      Date.parse(capture.capturedAt) >= end &&
      capture.feeds.length > 0 &&
      capture.feeds.every((feed) => Date.parse(feed.observedAt) >= end),
    purpose:
      'Saved selected-cluster URL trace; unresolved entries require event and importance review, not automatic misses or recall',
    feeds: capture.feeds.map((feed) => {
      const topic = edition.topics.find((item) => item.name === feed.topic);
      const savedTopic = snapshot?.topics.find((item) => item.id === topic?.id);
      const input = savedTopic
        ? editorInput(savedTopic.editorial?.candidatePrompt, savedTopic.id)
        : null;
      if (feed.error || !feed.stories)
        return {
          topic: feed.topic,
          name: feed.name,
          observedAt: feed.observedAt,
          captureCompletedAt: feed.captureCompletedAt,
          windowEnded: Date.parse(feed.observedAt) >= end,
          error: feed.error ?? 'Missing stories',
        };
      return {
        topic: feed.topic,
        name: feed.name,
        observedAt: feed.observedAt,
        captureCompletedAt: feed.captureCompletedAt,
        windowEnded: Date.parse(feed.observedAt) >= end,
        topicAvailable: !!topic,
        stories: feed.stories.map((reference) => {
          const date = Date.parse(reference.publishedAt);
          if (date < start || date >= end)
            throw new Error('Reference outside edition window');
          const url = canonicalUrl(reference.url);
          if (!url) throw new Error('Invalid reference URL');
          const selectedClusters = (topic?.stories ?? [])
            .filter((story) =>
              [
                story.url,
                ...(story.coverage ?? []).map((member) => member.url),
              ].some((candidate) => canonicalUrl(candidate) === url),
            )
            .map((story) => ({ id: story.id, title: story.title }));
          return {
            ...reference,
            selectedClusters,
            ...(snapshot
              ? {
                  editorInput: {
                    available: input !== null,
                    // Supplemental evidence in old prompts often lacks URLs. No
                    // match cannot establish that a reference missed the shortlist.
                    membersWithoutUrl:
                      input === null
                        ? null
                        : input.reduce(
                            (n, candidate) =>
                              n +
                              [
                                candidate,
                                ...(candidate.clusterEvidence ?? []),
                              ].filter((member) => !member.url).length,
                            0,
                          ),
                    matchingCandidates: (input ?? [])
                      .filter((candidate) =>
                        [candidate, ...(candidate.clusterEvidence ?? [])].some(
                          (member) =>
                            member.url && canonicalUrl(member.url) === url,
                        ),
                      )
                      .map((candidate) => ({
                        id: candidate.id,
                        title: candidate.title,
                        selected: (topic?.stories ?? []).some(
                          (story) => story.id === candidate.id,
                        ),
                        triage:
                          savedTopic?.editorial?.triage.find(
                            (score) => score.id === candidate.id,
                          ) ?? null,
                      })),
                  },
                }
              : {}),
            status: selectedClusters.length
              ? 'selected-cluster-url'
              : 'needs-event-review',
          };
        }),
      };
    }),
  };
}

if (require.main === module) {
  const [capture, edition, output, snapshot] = process.argv.slice(2);
  if (![5, 6].includes(process.argv.length) || !output)
    throw new Error(
      'Usage: tsx apps/api/scripts/trace-reference-stories.ts capture.json reader.json output.json [snapshot.json]',
    );
  const report = traceReferenceStories(
    JSON.parse(readFileSync(capture, 'utf8')),
    JSON.parse(readFileSync(edition, 'utf8')),
    snapshot ? JSON.parse(readFileSync(snapshot, 'utf8')) : undefined,
  );
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n', {
    flag: 'wx',
    mode: 0o600,
  });
  console.log(
    JSON.stringify({ editionId: report.editionId, feeds: report.feeds.length }),
  );
}
