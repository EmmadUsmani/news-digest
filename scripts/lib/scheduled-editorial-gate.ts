import assert from 'node:assert/strict';

interface EditionIdentity {
  id: string;
  windowStart: string;
  windowEnd: string;
}
interface ReaderEvidence extends EditionIdentity {
  topics: {
    id: string;
    name: string;
    stories: { id: string; summary?: string }[];
  }[];
}
interface EditorialEvidence extends EditionIdentity {
  topics: {
    id: string;
    stories: { id: string; summary?: string }[];
    editorial?: {
      mode: 'ai' | 'non-ai';
      model: string | null;
      unscoredIds: string[];
    };
  }[];
}

// A public reader response can also be a manually published edition.
export function requireScheduledPublication(evidence: {
  kind: string;
  scheduledKey: string | null;
  publishedAt: string | null;
}) {
  assert.equal(evidence.kind, 'scheduled', 'publication is not scheduled');
  assert.ok(evidence.scheduledKey?.trim(), 'missing scheduled publication key');
  assert.ok(
    !evidence.scheduledKey.startsWith('integration:'),
    'integration publication cannot establish scheduled acceptance',
  );
  assert.ok(
    evidence.publishedAt && Number.isFinite(Date.parse(evidence.publishedAt)),
    'missing valid scheduled publication time',
  );
  return evidence;
}

// AI provenance comes from the saved admin snapshot, never inferred from prose.
export function requireScheduledAiTopic(
  reader: ReaderEvidence,
  preview: EditorialEvidence,
  name: string,
) {
  assert.equal(preview.id, reader.id, 'editorial evidence edition differs');
  for (const key of ['windowStart', 'windowEnd'] as const)
    assert.equal(
      Date.parse(preview[key]),
      Date.parse(reader[key]),
      `${key}: editorial evidence differs`,
    );
  const topics = reader.topics.filter((topic) => topic.name === name);
  assert.equal(topics.length, 1, `${name}: expected exactly one reader topic`);
  const topic = topics[0];
  const saved = preview.topics.filter((item) => item.id === topic.id);
  assert.equal(
    saved.length,
    1,
    `${name}: missing or ambiguous editorial evidence`,
  );
  assert.equal(
    saved[0].editorial?.mode,
    'ai',
    `${name}: scheduled stories are not AI-edited`,
  );
  assert.ok(
    saved[0].editorial?.model?.trim(),
    `${name}: missing editorial model`,
  );
  assert.equal(
    saved[0].editorial.unscoredIds.length,
    0,
    `${name}: scheduled story triage is incomplete`,
  );
  assert.ok(topic.stories.length > 0, `${name}: no published stories`);
  assert.ok(
    topic.stories.every((story) => story.summary?.trim()),
    `${name}: missing published story text`,
  );
  assert.deepEqual(
    saved[0].stories.map((story) => story.id),
    topic.stories.map((story) => story.id),
    `${name}: published story selection differs from editorial evidence`,
  );
  for (const [index, story] of saved[0].stories.entries()) {
    assert.ok(story.summary?.trim(), `${name}: missing saved AI story summary`);
    assert.equal(
      topic.stories[index].summary,
      story.summary,
      `${name}: published summary differs from saved AI summary`,
    );
  }
  return {
    name,
    model: saved[0].editorial.model,
    stories: topic.stories.length,
  };
}

// Explicit names also detect a topic missing entirely from the published edition.
export function parseRequiredAiTopics(args: string[]): string[] {
  assert.equal(args.length % 2, 0, 'expected --require-ai-topic NAME pairs');
  const names: string[] = [];
  for (let index = 0; index < args.length; index += 2) {
    assert.equal(
      args[index],
      '--require-ai-topic',
      'unknown reader gate option',
    );
    const name = args[index + 1].trim();
    assert.ok(name && !name.startsWith('--'), 'required topic name is missing');
    assert.ok(!names.includes(name), 'duplicate required topic');
    names.push(name);
  }
  return names;
}

// Evaluate every requested section even when an earlier section failed.
export function assessScheduledAiTopics(
  reader: ReaderEvidence,
  preview: EditorialEvidence,
  names: string[],
) {
  return names.map((name) => {
    try {
      return {
        status: 'accepted' as const,
        ...requireScheduledAiTopic(reader, preview, name),
      };
    } catch (error) {
      return {
        status: 'refused' as const,
        name,
        reason:
          error instanceof Error
            ? error.message
            : 'Editorial evidence check failed',
      };
    }
  });
}
