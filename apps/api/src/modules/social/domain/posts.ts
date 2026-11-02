export interface SocialPost {
  platform: 'x';
  externalId: string;
  url: string;
  author: string;
  authorUrl: string;
  // oEmbed supplies neither authoritative engagement nor a structured post time.
  publishedAt: string | null;
  metrics: Record<string, number>;
  embedHtml: string;
}
export interface PostVerificationPort {
  verify(externalId: string): Promise<SocialPost>;
}
