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

export type EditionPublication = {
  kind: 'scheduled' | 'manual' | 'test';
  publishedAt: string | null;
};

/** Future saves use explicit intent, independent of the historical cutoff.
 * Test intent wins even when a caller supplies a real scheduled key.
 * Integration keys remain private while legacy test callers are migrated.
 * Manual publication is a separate admin action, never an insertion default.
 */
export function newEditionPublication(
  intent: 'scheduled' | 'manual' | 'test',
  scheduledKey: string | null,
  savedAt: Date,
): EditionPublication {
  if (!Number.isFinite(savedAt.getTime()))
    throw new Error('Invalid edition save time');
  if (intent === 'test' || scheduledKey?.startsWith('integration:'))
    return { kind: 'test', publishedAt: null };
  if (intent === 'manual') {
    if (scheduledKey !== null)
      throw new Error('Manual editions cannot have a scheduled key');
    return { kind: 'manual', publishedAt: null };
  }
  if (scheduledKey === null || scheduledKey.trim().length === 0)
    throw new Error('Scheduled editions require a scheduled key');
  return { kind: 'scheduled', publishedAt: savedAt.toISOString() };
}
