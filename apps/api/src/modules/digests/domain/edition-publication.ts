/** Owner-approved phase-0 backfill; does not change reader visibility. */
export function historicalEditionPublication(
  scheduledKey: string | null,
  createdAt: Date,
): { kind: 'scheduled' | 'manual' | 'test'; publishedAt: string | null } {
  if (!Number.isFinite(createdAt.getTime()))
    throw new Error('Invalid edition creation time');
  if (scheduledKey?.startsWith('integration:'))
    return { kind: 'test', publishedAt: null };
  if (scheduledKey !== null && createdAt.getTime() >= Date.UTC(2026, 10, 3))
    return { kind: 'scheduled', publishedAt: createdAt.toISOString() };
  return { kind: 'manual', publishedAt: null };
}
