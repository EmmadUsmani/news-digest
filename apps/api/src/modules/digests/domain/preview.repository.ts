import type { DigestPreview, PreviewHistory } from '@digest/contracts';
export abstract class PreviewRepository {
 abstract generate(start: Date, end: Date, scheduledKey?: string): Promise<DigestPreview>;
 abstract history(offset: number): Promise<PreviewHistory>;
 abstract find(id: string): Promise<DigestPreview | null>;
 abstract latest(): Promise<DigestPreview | null>;
}
