export interface Source { id: string; topicId: string; name: string; kind: 'feed' | 'hn'; url: string }
export interface ContentItem { url: string; title: string; excerpt: string; author: string | null; publishedAt: string; imageUrl: string | null; engagement: Record<string, number> }
export interface HttpPort { get(url: string): Promise<string> }
export interface SourcePort { collect(source: Source): Promise<ContentItem[]> }
export abstract class ContentRepository {
 abstract sources(): Promise<Source[]>;
 abstract store(source: Source, items: ContentItem[]): Promise<void>;
 abstract failed(source: Source, message: string): Promise<void>;
 abstract latest(): Promise<unknown>;
 abstract status(): Promise<unknown>;
}
