/** Social discovery uses its own access policy, never HN publisher scraping. */
export function publisherPageAllowed(url: string): boolean {
  const { protocol, hostname } = new URL(url);
  return (
    protocol === 'https:' &&
    !/(^|\.)(?:x\.com|twitter\.com|reddit\.com)$/.test(hostname) &&
    !/(^|\.)nitter\./.test(hostname)
  );
}
