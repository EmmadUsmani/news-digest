export type DigestPublished = {
  type: 'DigestPublished';
  editionId: string;
  profileId: string;
  publishedAt: string;
  windowStart: string;
  windowEnd: string;
};

export abstract class DigestNotifications {
  abstract published(event: DigestPublished): Promise<void>;
}
