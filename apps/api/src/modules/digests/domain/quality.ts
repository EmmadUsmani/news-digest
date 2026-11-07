// Conservative headline rules, not semantic editorial review. Keep the matched rule
// with each immutable snapshot so omissions can be inspected and tuned.
const rules: { id: string; reason: string; pattern: RegExp }[] = [
  {
    id: 'betting-promotion',
    reason: 'Betting or promotional guide',
    pattern: /\b(odds|best bets|promo code|how to watch|where to watch)\b/i,
  },
  {
    id: 'discussion-thread',
    reason: 'Routine discussion thread',
    pattern: /\b(game thread|open thread|combined thread)\b/i,
  },
  {
    id: 'matchup-preview',
    reason: 'Routine matchup preview',
    pattern:
      /\bvs\.?\s+.+\bpreview\b|^preview\s*:.*\b(meet|meets|face|faces|vs)\b|^\s*game preview\s*:\s*[^:,\n]+\s(?:at|vs\.?|versus)\s+[^:,\n]+,\s*[a-z]+\s+\d{1,2},\s+\d{4}\s*$/i,
  },
  {
    id: 'monthly-schedule',
    reason: 'Monthly schedule guide',
    pattern:
      /\bschedule for (january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  },
  {
    id: 'shopping-guide',
    reason: 'Shopping or affiliate guide',
    pattern: /\b(gift guide|best deals|buying guide)\b/i,
  },
];
export function qualityRejection(item: {
  title: string;
  url: string;
}): { rule: string; reason: string } | null {
  try {
    const url = new URL(item.url);
    if (!['http:', 'https:'].includes(url.protocol))
      return { rule: 'unsafe-url', reason: 'Unsupported article URL' };
    // HN questions are useful incoming discussions, but do not establish a news event.
    // Restrict this rule to original HN discussion URLs; reporting about Ask HN survives.
    if (
      url.hostname === 'news.ycombinator.com' &&
      url.pathname === '/item' &&
      /^ask hn\s*:/i.test(item.title.normalize('NFKC').trim())
    )
      return { rule: 'hn-question', reason: 'Hacker News question thread' };
    if (/\/betting\//i.test(url.pathname))
      return {
        rule: 'betting-promotion',
        reason: 'Betting or promotional guide',
      };
  } catch {
    return { rule: 'unsafe-url', reason: 'Invalid article URL' };
  }
  const title = item.title.normalize('NFKC');
  const matched = rules.find((rule) => rule.pattern.test(title));
  return matched ? { rule: matched.id, reason: matched.reason } : null;
}
