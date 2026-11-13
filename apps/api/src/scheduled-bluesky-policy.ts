// Exact opt-in; the topic ID is configured explicitly, never inferred by name.
export function scheduledBlueskyPolicy(
  env: NodeJS.ProcessEnv = process.env,
): { worldTopicId: string } | undefined {
  if (env.BLUESKY_WORLD_ROTATION_ENABLED !== '1') return undefined;
  const worldTopicId = env.BLUESKY_WORLD_TOPIC_ID?.trim();
  if (
    !worldTopicId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      worldTopicId,
    )
  )
    throw new Error('Bluesky World rotation requires a configured topic UUID');
  return { worldTopicId };
}
