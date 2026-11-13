import assert from 'node:assert/strict';

interface EditionIdentity {
  id: string;
  windowStart: string;
  windowEnd: string;
}
interface ReaderEvidence extends EditionIdentity {
  topics: { id: string; name: string; stories: { summary: string }[] }[];
}
interface EditorialEvidence extends EditionIdentity {
  topics: {
    id: string;
    editorial?: { mode: 'ai' | 'non-ai'; model: string | null };
  }[];
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
  assert.ok(topic.stories.length > 0, `${name}: no published stories`);
  assert.ok(
    topic.stories.every((story) => story.summary.trim()),
    `${name}: missing published story text`,
  );
  return {
    name,
    model: saved[0].editorial.model,
    stories: topic.stories.length,
  };
}
