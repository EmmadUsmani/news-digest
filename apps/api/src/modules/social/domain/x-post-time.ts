// X Snowflake: milliseconds since 2010-11-04T01:42:54.657Z in the high bits.
// Decode only after official post verification. Observation time is never post time.
export function xPostTime(externalId: string, now = new Date()): string | null {
  if (!/^[1-9][0-9]{0,19}$/.test(externalId)) return null;
  const id = BigInt(externalId);
  if (id > 9223372036854775807n) return null;
  const milliseconds = Number(id >> 22n) + 1288834974657;
  // Conservatively leave transition-era/legacy sequential IDs undated.
  if (milliseconds < Date.UTC(2011, 0, 1) || milliseconds > now.getTime())
    return null;
  return new Date(milliseconds).toISOString();
}
