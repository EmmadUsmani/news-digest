// Exact source exclusion from the Nov 15 saved-edition credibility failure.
// Match the official embed's author URL, never display names or quoted handles.
// This does not classify other accounts, humour or reporter credibility.
export function isExcludedXNewsSource(authorUrl: string): boolean {
  try {
    const url = new URL(authorUrl);
    return (
      ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'].includes(
        url.hostname.toLowerCase(),
      ) && /^\/thenbacentel\/?$/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}
