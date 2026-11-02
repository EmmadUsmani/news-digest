// Discovery only: a citation does not verify a post's existence, content or metrics.
export interface XLink {
  externalId: string;
  url: string;
  verificationUrl?: string;
}
export function extractXLinks(input: string): XLink[] {
  const links = new Map<string, XLink>();
  for (const match of input.matchAll(/https?:\/\/[^\s<>"']+/gi)) {
    try {
      const url = new URL(match[0].replace(/[),.;!\]}]+$/, ''));
      if (
        ![
          'x.com',
          'www.x.com',
          'twitter.com',
          'www.twitter.com',
          'mobile.twitter.com',
        ].includes(url.hostname) ||
        url.username ||
        url.password ||
        url.port
      )
        continue;
      const path =
        /^\/(?:[a-zA-Z0-9_]{1,15}|i\/web)\/status\/(\d{1,20})(?:\/|$)/.exec(
          url.pathname,
        );
      if (!path || /^0+$/.test(path[1])) continue;
      const externalId = path[1];
      const handle = url.pathname.split('/')[1];
      const verificationUrl =
        handle !== 'i'
          ? `https://twitter.com/${handle}/status/${externalId}`
          : links.get(externalId)?.verificationUrl;
      links.set(externalId, {
        externalId,
        ...(verificationUrl ? { verificationUrl } : {}),
        url: `https://x.com/i/web/status/${externalId}`,
      });
      if (links.size >= 50) break;
    } catch {
      /* Ignore malformed citation URLs. */
    }
  }
  return [...links.values()];
}
