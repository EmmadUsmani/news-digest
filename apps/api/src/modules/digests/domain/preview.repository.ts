import type { DigestPreview } from '@digest/contracts';
export abstract class PreviewRepository {
 abstract generate(start: Date, end: Date): Promise<DigestPreview>;
 abstract latest(): Promise<DigestPreview | null>;
}
