export interface SocialPost {
  platform: 'x';
  externalId: string;
  url: string;
  author: string;
  authorUrl: string;
  // Time is decoded from a verified modern X Snowflake ID; legacy IDs stay null.
  // oEmbed supplies no authoritative engagement.
  publishedAt: string | null;
  metrics: Record<string, number>;
  embedHtml: string;
}
export interface PostVerificationPort {
  verify(externalId: string, discoveredUrl?: string): Promise<SocialPost>;
}
