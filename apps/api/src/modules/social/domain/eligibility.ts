import type { RelevancePolicy } from '@digest/contracts';

const normalize = (text: string) =>
  text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
const contains = (text: string, phrase: string) => {
  const normalized = normalize(phrase);
  return normalized.length > 0 && ` ${text} `.includes(` ${normalized} `);
};
// Conservative first-stage screening, not semantic relevance or a virality score.
// These are post-quality exclusions, independent of any topic's name or sources.
const excluded = [
  'crypto',
  'cryptocurrency',
  'bitcoin',
  'memecoin',
  'airdrop',
  'nft',
  'token sale',
  'retweet to win',
  'like and repost',
  'follow to win',
];
export function assessPostEligibility(
  post: { text: string; publishedAt: string | null },
  policy: RelevancePolicy,
  start: Date,
  end: Date,
) {
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start >= end
  )
    throw new Error('Invalid social coverage window');
  const time = Date.parse(post.publishedAt ?? '');
  if (!Number.isFinite(time))
    return { eligible: false, reason: 'Unknown post time' };
  if (time < start.getTime() || time >= end.getTime())
    return { eligible: false, reason: 'Outside coverage window' };
  const text = normalize(post.text);
  if (!text) return { eligible: false, reason: 'No verified post text' };
  const quality = excluded.find((phrase) => contains(text, phrase));
  if (quality)
    return { eligible: false, reason: `Social quality exclusion: ${quality}` };
  const rejected = policy.excludeAny.find((phrase) => contains(text, phrase));
  if (rejected)
    return { eligible: false, reason: `Excluded topic phrase: ${rejected}` };
  const included = policy.includeAny.find((phrase) => contains(text, phrase));
  if (!included)
    return {
      eligible: false,
      reason: policy.includeAny.length
        ? 'No required topic phrase found'
        : 'No positive topic rules configured',
    };
  return { eligible: true, reason: `Verified post topic phrase: ${included}` };
}
